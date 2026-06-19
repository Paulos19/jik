"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Hash,
  Send,
  Users,
  Bot,
  Sparkles,
  Plus,
  Search,
  Lock,
  Globe,
  ChevronRight,
  Menu,
  X,
  Paperclip,
  Smile,
  ArrowLeft,
  Settings,
  ShieldAlert,
  ShieldCheck,
  Info,
  Circle,
  HelpCircle
} from "lucide-react";
import Navbar from "@/components/navbar";

type UserProps = {
  id?: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
};

interface CommunityProps {
  id: string;
  name: string;
  description: string;
  type: "public" | "restricted";
  memberCount: number;
  tags: string[];
  bannerGradient: string;
  creatorId?: string;
  creatorName?: string | null;
  channels?: Channel[];
}

interface ComunidadeInternaClientProps {
  communityId: string;
  user?: UserProps | null;
  initialCommunity: CommunityProps;
}

interface Message {
  id: string;
  senderName: string;
  senderRole: string;
  content: string;
  timestamp: string;
  isAi?: boolean;
  avatarUrl?: string;
  plan?: "Básico" | "Pro" | "Elite" | "Staff";
}

interface Channel {
  id: string;
  name: string;
  description: string;
  isBot?: boolean;
}

export default function ComunidadeInternaClient({ communityId, user, initialCommunity }: ComunidadeInternaClientProps) {
  const community = initialCommunity;

  // Channels Setup in State
  const [channels, setChannels] = useState<Channel[]>(() => {
    const dbChannels = initialCommunity.channels || [];
    if (dbChannels.length > 0) {
      const hasBot = dbChannels.some(c => c.isBot);
      if (!hasBot) {
        return [
          ...dbChannels,
          { id: "assistente-ia", name: "assistente-ia", description: "Chatbot inteligente integrado para suporte acadêmico e mentoria.", isBot: true }
        ];
      }
      return dbChannels;
    }
    return [
      { id: "painel-geral", name: "painel-geral", description: "Bate-papo livre e interações gerais da comunidade." },
      { id: "debates-e-estudos", name: "debates-e-estudos", description: "Artigos, filosofias, metodologias de estudo e debates intelectuais." },
      { id: "assistente-ia", name: "assistente-ia", description: "Chatbot inteligente integrado para suporte acadêmico e mentoria.", isBot: true },
    ];
  });

  const [activeChannelId, setActiveChannelId] = useState<string>(() => {
    const list = initialCommunity.channels && initialCommunity.channels.length > 0
      ? initialCommunity.channels
      : [];
    const firstBotLess = list.find(c => !c.isBot);
    return firstBotLess ? firstBotLess.id : (list[0]?.id || "painel-geral");
  });

  const [isNewChannelModalOpen, setIsNewChannelModalOpen] = useState(false);
  const [newChannelName, setNewChannelName] = useState("");
  const [newChannelDesc, setNewChannelDesc] = useState("");
  const [isCreatingChannel, setIsCreatingChannel] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  const isOwner = !!(user?.id && initialCommunity.creatorId && user.id === initialCommunity.creatorId);

  const handleCreateChannel = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newChannelName.trim() || !newChannelDesc.trim()) return;

    setIsCreatingChannel(true);
    try {
      const response = await fetch(`/api/comunidade/${communityId}/channel`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: newChannelName,
          description: newChannelDesc,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Erro ao criar canal");
      }

      setChannels((prev) => [...prev, data]);
      setActiveChannelId(data.id);
      setNewChannelName("");
      setNewChannelDesc("");
      setIsNewChannelModalOpen(false);
      setToastMessage(`Canal #${data.name} criado com sucesso!`);
      setTimeout(() => setToastMessage(""), 3000);
    } catch (error: any) {
      alert(error.message || "Erro de conexão ao criar canal");
    } finally {
      setIsCreatingChannel(false);
    }
  };
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isRightSidebarOpen, setIsRightSidebarOpen] = useState(true);
  const [inputMessage, setInputMessage] = useState("");
  const [isAiTyping, setIsAiTyping] = useState(false);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);

  // Messages State per Channel
  const [messageHistory, setMessageHistory] = useState<Record<string, Message[]>>({
    "assistente-ia": [
      {
        id: "ai-1",
        senderName: "JiK Assistente",
        senderRole: "Bot",
        content: "Olá! Sou o Assistente de Debates integrado a esta comunidade. Posso te ajudar a resumir textos, simular questionários ou propor dinâmicas de estudos. O que gostaria de desenvolver hoje?",
        timestamp: "Agora",
        isAi: true,
        avatarUrl: "AI",
      },
    ],
  });

  const chatEndRef = useRef<HTMLDivElement>(null);

  // Load channel messages dynamically on mount or channel switch
  useEffect(() => {
    if (!activeChannelId) return;

    const loadMessages = async () => {
      setIsLoadingMessages(true);
      try {
        const response = await fetch(`/api/comunidade/${communityId}/channel/${activeChannelId}/messages`);
        if (response.ok) {
          const data = await response.json();
          const formatted = data.map((msg: any) => ({
            id: msg.id,
            senderName: msg.senderName,
            senderRole: msg.senderRole,
            content: msg.content,
            timestamp: new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
            plan: msg.plan,
            avatarUrl: msg.avatarUrl,
            isAi: msg.isAi,
          }));

          setMessageHistory((prev) => ({
            ...prev,
            [activeChannelId]: formatted,
          }));
        }
      } catch (err) {
        console.error("Error fetching channel messages:", err);
      } finally {
        setIsLoadingMessages(false);
      }
    };

    loadMessages();
  }, [activeChannelId, communityId]);

  // Scroll to bottom when channel changes or messages update
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messageHistory, activeChannelId]);

  const activeChannel = channels.find((c) => c.id === activeChannelId) || channels[0];
  const activeMessages = messageHistory[activeChannelId] || (activeChannel.isBot ? messageHistory["assistente-ia"] : []) || [];

  // Send message implementation
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    const userMessageText = inputMessage;
    setInputMessage("");

    const now = new Date();
    const timeString = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

    // Determine plan type from session details if needed, fallback to Pro
    const userPlan = user ? "Pro" : "Básico";

    const newMsg: Message = {
      id: `msg-${Date.now()}`,
      senderName: user?.name || "Você",
      senderRole: "Membro",
      content: userMessageText,
      timestamp: timeString,
      plan: userPlan as any,
      avatarUrl: user?.name ? user.name.substring(0, 2).toUpperCase() : "ME",
    };

    // Add user message to state
    setMessageHistory((prev) => {
      const existingMsgs = prev[activeChannelId] || [];
      return {
        ...prev,
        [activeChannelId]: [...existingMsgs, newMsg],
      };
    });

    // If active channel is chatbot, call backend API
    if (activeChannel.isBot) {
      setIsAiTyping(true);

      try {
        const res = await fetch("/api/comunidade/chat", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            message: userMessageText,
            communityId,
            channelId: activeChannelId,
            userName: user?.name || "Membro JiK",
            userEmail: user?.email || "anonimo@jik.com",
          }),
        });

        if (res.ok) {
          const data = await res.json();
          const botMsg: Message = {
            id: `bot-${Date.now()}`,
            senderName: "JiK Assistente",
            senderRole: "Bot",
            content: data.reply,
            timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
            isAi: true,
            avatarUrl: "AI",
          };

          setMessageHistory((prev) => {
            const existingMsgs = prev[activeChannelId] || [];
            return {
              ...prev,
              [activeChannelId]: [...existingMsgs, botMsg],
            };
          });
        } else {
          throw new Error("API call failed");
        }
      } catch (err) {
        const errorMsg: Message = {
          id: `bot-err-${Date.now()}`,
          senderName: "JiK Assistente",
          senderRole: "Bot",
          content: "Oops! Tive um problema de comunicação com o servidor n8n. Por favor, tente enviar sua mensagem novamente.",
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          isAi: true,
          avatarUrl: "AI",
        };

        setMessageHistory((prev) => ({
          ...prev,
          [activeChannelId]: [...(prev[activeChannelId] || []), errorMsg],
        }));
      } finally {
        setIsAiTyping(false);
      }
    } else {
      // Normal channel - post to messages API
      try {
        await fetch(`/api/comunidade/${communityId}/channel/${activeChannelId}/messages`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            content: userMessageText,
            senderName: user?.name || "Você",
            senderRole: isOwner ? "Moderador" : "Membro",
            plan: userPlan,
            avatarUrl: user?.name ? user.name.substring(0, 2).toUpperCase() : "ME",
          }),
        });
      } catch (error) {
        console.error("Error saving normal channel message to DB:", error);
      }
    }
  };

  return (
    <div className="relative min-h-screen w-full bg-neutral-950 text-[#FBFBFB] flex flex-col justify-between overflow-x-hidden font-sans">
      <Navbar user={user} />

      {/* ──────────────────────── MAIN CONTAINER ──────────────────────── */}
      <main className="relative z-10 flex-1 pt-20 flex h-[calc(100vh-80px)] overflow-hidden">
        
        {/* Left Sidebar (Channels) - Collapsible/Mobile Drawer */}
        <div
          className={`w-64 border-r border-white/5 bg-[#090d0e]/95 flex flex-col justify-between shrink-0 transition-transform duration-300 md:translate-x-0 fixed md:relative h-[calc(100vh-80px)] z-40 ${
            isMobileSidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
          }`}
        >
          {/* Channels Header */}
          <div className="p-4 border-b border-white/5 flex items-center justify-between">
            <div className="min-w-0">
              <h3 className="font-extrabold text-sm text-white truncate flex items-center gap-1.5">
                {community.type === "restricted" ? (
                  <Lock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                ) : (
                  <Globe className="w-3.5 h-3.5 text-[#9BE8D6] shrink-0" />
                )}
                <span className="truncate">{community.name}</span>
              </h3>
              <p className="text-[10px] text-neutral-500 font-semibold tracking-wider uppercase mt-0.5">
                Sala de Estudos JiK
              </p>
            </div>
            <button
              onClick={() => setIsMobileSidebarOpen(false)}
              className="md:hidden p-1.5 hover:bg-white/5 rounded-xl border border-white/10 text-neutral-400"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Channels List */}
          <div className="flex-1 overflow-y-auto p-3 space-y-4">
            <div>
              <div className="flex items-center justify-between px-2 mb-2">
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-neutral-500">
                  Canais de Texto
                </span>
                {isOwner && (
                  <Plus
                    onClick={() => setIsNewChannelModalOpen(true)}
                    className="w-3.5 h-3.5 text-neutral-500 hover:text-white cursor-pointer"
                  />
                )}
              </div>

              <div className="space-y-0.5">
                {channels
                  .filter((c) => !c.isBot)
                  .map((channel) => (
                    <button
                      key={channel.id}
                      onClick={() => {
                        setActiveChannelId(channel.id);
                        setIsMobileSidebarOpen(false);
                      }}
                      className={`w-full flex items-center gap-2 px-2.5 py-2 rounded-xl text-xs font-semibold text-left transition-all ${
                        activeChannelId === channel.id
                          ? "bg-[#336E72]/15 border border-[#9BE8D6]/10 text-white shadow-sm"
                          : "text-neutral-400 hover:text-white hover:bg-white/5 border border-transparent"
                      }`}
                    >
                      <Hash className={`w-4 h-4 ${activeChannelId === channel.id ? "text-[#9BE8D6]" : "text-neutral-500"}`} />
                      <span className="truncate">{channel.name}</span>
                    </button>
                  ))}
              </div>
            </div>

            {/* AI Bot Section */}
            <div>
              <div className="px-2 mb-2">
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-neutral-500">
                  Assistência Integrada
                </span>
              </div>
              <div className="space-y-0.5">
                {channels
                  .filter((c) => c.isBot)
                  .map((channel) => (
                    <button
                      key={channel.id}
                      onClick={() => {
                        setActiveChannelId(channel.id);
                        setIsMobileSidebarOpen(false);
                      }}
                      className={`w-full flex items-center gap-2 px-2.5 py-2.5 rounded-xl text-xs font-bold text-left transition-all border ${
                        activeChannelId === channel.id
                          ? "bg-gradient-to-r from-[#9BE8D6]/10 to-[#336E72]/5 border-[#9BE8D6]/35 text-[#9BE8D6] shadow-[0_0_15px_rgba(155,232,214,0.05)]"
                          : "bg-gradient-to-r from-emerald-500/5 to-transparent border-emerald-500/10 text-emerald-400 hover:text-[#9BE8D6] hover:bg-white/5"
                      }`}
                    >
                      <Bot className="w-4 h-4 shrink-0" />
                      <span className="truncate">{channel.name}</span>
                      <Sparkles className="w-3 h-3 text-[#9BE8D6] ml-auto shrink-0 animate-pulse" />
                    </button>
                  ))}
              </div>
            </div>
          </div>

          {/* Quick Profile Footer */}
          <div className="p-3 border-t border-white/5 bg-neutral-900/40 flex items-center justify-between">
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#9BE8D6] to-[#336E72] flex items-center justify-center text-xs font-extrabold text-[#090d0e]">
                {user?.name ? user.name.substring(0, 2).toUpperCase() : "ME"}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-white truncate">{user?.name || "Membro JiK"}</p>
                <p className="text-[9px] text-[#9BE8D6] font-extrabold uppercase tracking-wide">
                  {user ? "Plano Pro" : "Plano Básico"}
                </p>
              </div>
            </div>
            <Settings className="w-4 h-4 text-neutral-500 hover:text-white cursor-pointer transition-colors" />
          </div>
        </div>

        {/* Backdrop for mobile menu drawer */}
        {isMobileSidebarOpen && (
          <div
            onClick={() => setIsMobileSidebarOpen(false)}
            className="fixed inset-0 z-35 bg-black/60 backdrop-blur-sm md:hidden"
          />
        )}

        {/* Central Chat Panel */}
        <div className="flex-1 flex flex-col justify-between bg-neutral-950/40 overflow-hidden relative">
          
          {/* Chat Header */}
          <div className="h-14 border-b border-white/5 px-4 flex items-center justify-between bg-[#090d0e]/60 backdrop-blur-md shrink-0">
            <div className="flex items-center gap-2 min-w-0">
              <button
                onClick={() => setIsMobileSidebarOpen(true)}
                className="md:hidden p-1.5 hover:bg-white/5 rounded-xl border border-white/10 text-neutral-400"
              >
                <Menu className="w-4 h-4" />
              </button>
              
              <div className="flex items-center gap-1 text-white font-bold text-sm min-w-0">
                {activeChannel.isBot ? (
                  <Bot className="w-4 h-4 text-[#9BE8D6] shrink-0" />
                ) : (
                  <Hash className="w-4 h-4 text-neutral-400 shrink-0" />
                )}
                <span className="truncate">{activeChannel.name}</span>
              </div>
              
              <span className="hidden sm:inline-block w-px h-4 bg-white/10 mx-2" />
              <p className="hidden sm:inline-block text-xs text-neutral-400 truncate">
                {activeChannel.description}
              </p>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <div className="relative hidden md:block">
                <input
                  type="text"
                  placeholder="Pesquisar..."
                  className="w-40 bg-neutral-900 border border-white/10 rounded-xl px-3 py-1.5 text-[10px] text-white focus:outline-none focus:border-[#9BE8D6] transition-all focus:w-48"
                />
                <Search className="w-3.5 h-3.5 text-neutral-500 absolute right-3 top-2.5" />
              </div>

              <button
                onClick={() => setIsRightSidebarOpen(!isRightSidebarOpen)}
                className={`p-2 rounded-xl border transition-colors cursor-pointer ${
                  isRightSidebarOpen
                    ? "bg-[#336E72]/15 border-[#9BE8D6]/20 text-[#9BE8D6]"
                    : "bg-white/5 border-white/10 text-neutral-400 hover:text-white"
                }`}
                title="Membros e Informações"
              >
                <Users className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Messages Feed */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            
            {/* Welcome banner at the top of the feed */}
            <div className="bg-[#131d1f]/10 border border-[#9BE8D6]/10 rounded-2xl p-5 mb-6 text-left space-y-2">
              <div className="w-10 h-10 rounded-2xl bg-[#336E72]/20 border border-[#9BE8D6]/30 flex items-center justify-center">
                {activeChannel.isBot ? (
                  <Bot className="w-6 h-6 text-[#9BE8D6]" />
                ) : (
                  <Hash className="w-6 h-6 text-[#9BE8D6]" />
                )}
              </div>
              <h4 className="text-base font-extrabold text-white">
                Bem-vindo ao canal #{activeChannel.name}!
              </h4>
              <p className="text-xs text-neutral-400 leading-relaxed">
                Este é o início do canal #{activeChannel.name}. {activeChannel.description}
              </p>
            </div>

            {/* List of Messages */}
            {isLoadingMessages ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex gap-3 text-left animate-pulse">
                    <div className="w-9 h-9 rounded-full bg-white/5 border border-white/5 shrink-0" />
                    <div className="space-y-2 flex-1">
                      <div className="flex gap-2">
                        <div className="h-3.5 w-24 bg-white/10 rounded" />
                        <div className="h-2 w-8 bg-white/5 rounded" />
                      </div>
                      <div className="h-3 w-full max-w-md bg-white/5 rounded" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              activeMessages.map((msg) => (
                <div key={msg.id} className="flex gap-3 text-left group">
                  <div className="w-9 h-9 rounded-full bg-neutral-900 border border-white/10 shrink-0 flex items-center justify-center text-xs font-bold text-neutral-300">
                    {msg.avatarUrl}
                  </div>
                  <div className="space-y-1 min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-bold text-white truncate">{msg.senderName}</span>
                      
                      {msg.plan === "Elite" && (
                        <span className="text-[8px] font-extrabold px-1.5 py-0.5 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded">
                          Elite
                        </span>
                      )}
                      {msg.plan === "Pro" && (
                        <span className="text-[8px] font-extrabold px-1.5 py-0.5 bg-emerald-500/10 text-[#9BE8D6] border border-emerald-500/20 rounded">
                          Pro
                        </span>
                      )}
                      {msg.senderRole === "Bot" && (
                        <span className="text-[8px] font-extrabold px-1.5 py-0.5 bg-purple-500/10 text-purple-400 border border-purple-500/20 rounded flex items-center gap-0.5">
                          <Bot className="w-2.5 h-2.5" /> BOT
                        </span>
                      )}
                      
                      <span className="text-[9px] text-neutral-500 font-semibold">{msg.timestamp}</span>
                    </div>
                    <p className="text-xs text-neutral-300 leading-relaxed break-words whitespace-pre-wrap">
                      {msg.content}
                    </p>
                  </div>
                </div>
              ))
            )}

            {/* AI Typing Indicator */}
            {isAiTyping && (
              <div className="flex gap-3 text-left">
                <div className="w-9 h-9 rounded-full bg-neutral-900 border border-white/10 shrink-0 flex items-center justify-center text-xs font-bold text-[#9BE8D6]">
                  AI
                </div>
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-white">JiK Assistente</span>
                    <span className="text-[8px] font-extrabold px-1.5 py-0.5 bg-purple-500/10 text-purple-400 border border-purple-500/20 rounded flex items-center gap-0.5">
                      <Bot className="w-2.5 h-2.5" /> BOT
                    </span>
                  </div>
                  <div className="flex items-center gap-1 px-3 py-2 bg-neutral-900/60 border border-white/5 rounded-2xl w-16">
                    <motion.div
                      animate={{ scale: [0.6, 1, 0.6] }}
                      transition={{ repeat: Infinity, duration: 1, delay: 0 }}
                      className="w-1.5 h-1.5 bg-[#9BE8D6] rounded-full"
                    />
                    <motion.div
                      animate={{ scale: [0.6, 1, 0.6] }}
                      transition={{ repeat: Infinity, duration: 1, delay: 0.2 }}
                      className="w-1.5 h-1.5 bg-[#9BE8D6] rounded-full"
                    />
                    <motion.div
                      animate={{ scale: [0.6, 1, 0.6] }}
                      transition={{ repeat: Infinity, duration: 1, delay: 0.4 }}
                      className="w-1.5 h-1.5 bg-[#9BE8D6] rounded-full"
                    />
                  </div>
                </div>
              </div>
            )}

            <div ref={chatEndRef} />
          </div>

          {/* Chat Input Area */}
          <div className="p-4 bg-neutral-950/60 border-t border-white/5 shrink-0">
            <form onSubmit={handleSendMessage} className="relative flex items-center bg-neutral-900 border border-white/10 rounded-2xl px-4 py-2.5">
              <button
                type="button"
                className="p-1 text-neutral-400 hover:text-white transition-colors cursor-pointer shrink-0"
              >
                <Paperclip className="w-4 h-4" />
              </button>

              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder={
                  activeChannel.isBot
                    ? "Faça uma pergunta para o assistente integrado..."
                    : `Conversar em #${activeChannel.name}...`
                }
                className="flex-1 bg-transparent border-0 px-3 text-xs text-white focus:outline-none focus:ring-0 placeholder-neutral-500"
              />

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  className="p-1 text-neutral-400 hover:text-white transition-colors cursor-pointer"
                >
                  <Smile className="w-4 h-4" />
                </button>

                <button
                  type="submit"
                  disabled={!inputMessage.trim() || isAiTyping}
                  className={`p-1.5 rounded-xl cursor-pointer transition-all ${
                    inputMessage.trim() && !isAiTyping
                      ? "bg-gradient-to-r from-[#9BE8D6] to-[#336E72] text-[#FBFBFB]"
                      : "text-neutral-500"
                  }`}
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Right Sidebar (Community Specs & Active Members) */}
        <AnimatePresence>
          {isRightSidebarOpen && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 240, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="hidden lg:flex flex-col border-l border-white/5 bg-[#090d0e]/95 h-[calc(100vh-80px)] overflow-y-auto p-4 space-y-6 shrink-0 text-left"
            >
              {/* About Section */}
              <div className="space-y-2">
                <h4 className="text-[10px] font-extrabold uppercase tracking-widest text-neutral-500">
                  Sobre a Sala
                </h4>
                <div className="p-3 bg-white/5 border border-white/10 rounded-2xl space-y-2">
                  <p className="text-[11px] text-neutral-300 leading-relaxed">
                    {community.description}
                  </p>
                  <div className="flex gap-1.5 flex-wrap">
                    {community.tags.map((tag) => (
                      <span key={tag} className="text-[9px] font-semibold text-[#9BE8D6] bg-[#9BE8D6]/10 px-2 py-0.5 rounded border border-[#9BE8D6]/10">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Members List */}
              <div className="space-y-4">
                <h4 className="text-[10px] font-extrabold uppercase tracking-widest text-neutral-500 flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5" />
                  Membros online — {community.memberCount}
                </h4>

                <div className="space-y-3">
                  {/* Moderador / Admin */}
                  <div>
                    <span className="text-[9px] font-bold text-neutral-500 uppercase tracking-wider block mb-1">
                      Liderança (1)
                    </span>
                    <div className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-white/5 transition-colors cursor-pointer">
                      <div className="relative">
                        <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-amber-500 to-amber-700 flex items-center justify-center text-xs font-bold text-white">
                          {community.creatorName ? community.creatorName.substring(0, 2).toUpperCase() : "CR"}
                        </div>
                        <Circle className="w-2.5 h-2.5 fill-emerald-500 stroke-[#090d0e] stroke-2 absolute bottom-0 right-0" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-white truncate">
                          {community.creatorName || "Criador"}
                        </p>
                        <p className="text-[8px] text-amber-400 font-semibold uppercase">Proprietário</p>
                      </div>
                    </div>
                  </div>

                  {/* Elite Members */}
                  <div>
                    <span className="text-[9px] font-bold text-[#e2b857] uppercase tracking-wider block mb-1">
                      Membros Elite (1)
                    </span>
                    <div className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-white/5 transition-colors cursor-pointer">
                      <div className="relative">
                        <div className="w-7 h-7 rounded-full border border-amber-500/35 bg-[#e2b857]/15 flex items-center justify-center text-xs font-bold text-[#e2b857]">
                          TS
                        </div>
                        <Circle className="w-2.5 h-2.5 fill-emerald-500 stroke-[#090d0e] stroke-2 absolute bottom-0 right-0" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-[#e2b857] truncate">Tales Souza</p>
                        <p className="text-[8px] text-neutral-400">Elite</p>
                      </div>
                    </div>
                  </div>

                  {/* Pro Members */}
                  <div>
                    <span className="text-[9px] font-bold text-[#9BE8D6] uppercase tracking-wider block mb-1">
                      Membros Pro (2)
                    </span>
                    <div className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-white/5 transition-colors cursor-pointer">
                      <div className="relative">
                        <div className="w-7 h-7 rounded-full border border-[#9BE8D6]/35 bg-[#9BE8D6]/10 flex items-center justify-center text-xs font-bold text-[#9BE8D6]">
                          SL
                        </div>
                        <Circle className="w-2.5 h-2.5 fill-emerald-500 stroke-[#090d0e] stroke-2 absolute bottom-0 right-0" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-[#9BE8D6] truncate">Sarah Lima</p>
                        <p className="text-[8px] text-neutral-400">Pro</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-white/5 transition-colors cursor-pointer">
                      <div className="relative">
                        <div className="w-7 h-7 rounded-full border border-[#9BE8D6]/35 bg-[#9BE8D6]/10 flex items-center justify-center text-xs font-bold text-[#9BE8D6]">
                          TC
                        </div>
                        <Circle className="w-2.5 h-2.5 fill-emerald-500 stroke-[#090d0e] stroke-2 absolute bottom-0 right-0" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-[#9BE8D6] truncate">Thiago Cardoso</p>
                        <p className="text-[8px] text-neutral-400">Pro</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bot Info section */}
              <div className="pt-4 border-t border-white/5 space-y-2">
                <div className="flex items-center gap-1.5 text-[10px] text-[#9BE8D6] font-bold">
                  <Info className="w-3.5 h-3.5" />
                  <span>Configurações do Bot</span>
                </div>
                <p className="text-[9px] text-neutral-500 leading-normal">
                  Este canal chatbot está enviando mensagens para `/api/comunidade/chat`. Defina `N8N_CHATBOT_WEBHOOK_URL` em seu `.env` para apontar ao fluxo real do n8n.
                </p>
              </div>

            </motion.div>
          )}
        </AnimatePresence>

      </main>

      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="fixed bottom-6 right-6 z-50 bg-[#131d1f] border border-[#9BE8D6]/30 text-white rounded-2xl px-5 py-3 shadow-[0_10px_30px_rgba(0,0,0,0.5)] flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4 text-[#9BE8D6]" />
            <span className="text-xs font-bold">{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* New Channel Modal */}
      <AnimatePresence>
        {isNewChannelModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsNewChannelModalOpen(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />

            {/* Modal Box */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md bg-[#090d0e]/95 border border-white/10 rounded-3xl p-6 shadow-[0_20px_50px_rgba(0,0,0,0.8)] overflow-hidden text-left"
            >
              <div className="absolute top-0 right-0 p-4">
                <button
                  type="button"
                  onClick={() => setIsNewChannelModalOpen(false)}
                  className="p-1.5 hover:bg-white/5 rounded-xl border border-white/10 text-neutral-400"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-bold text-white">Criar Novo Canal</h3>
                  <p className="text-xs text-neutral-400">Adicione um novo espaço para debate e interação dos membros.</p>
                </div>

                <form onSubmit={handleCreateChannel} className="space-y-4 pt-2">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-neutral-300">Nome do Canal</label>
                    <div className="relative">
                      <Hash className="w-4 h-4 text-neutral-500 absolute left-3 top-3.5" />
                      <input
                        type="text"
                        required
                        value={newChannelName}
                        onChange={(e) => {
                          // Format to lowercase, remove spaces and accents/special chars to respect channel formats
                          const formatted = e.target.value
                            .toLowerCase()
                            .replace(/\s+/g, "-")
                            .replace(/[^a-z0-9-_]/g, "");
                          setNewChannelName(formatted);
                        }}
                        placeholder="ex-estudos-filosoficos"
                        className="w-full bg-neutral-900 border border-white/10 rounded-xl pl-9 pr-4 py-2.5 text-sm text-white focus:border-[#9BE8D6] focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-neutral-300">Descrição</label>
                    <textarea
                      required
                      rows={3}
                      value={newChannelDesc}
                      onChange={(e) => setNewChannelDesc(e.target.value)}
                      placeholder="Qual o objetivo desse canal?"
                      className="w-full bg-neutral-900 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:border-[#9BE8D6] focus:outline-none resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isCreatingChannel}
                    className="w-full mt-2 bg-gradient-to-r from-[#9BE8D6] to-[#336E72] hover:opacity-90 disabled:opacity-50 text-[#090d0e] font-extrabold rounded-xl py-3 text-sm transition-all flex items-center justify-center gap-2 cursor-pointer shadow-[0_4px_20px_rgba(155,232,214,0.15)]"
                  >
                    {isCreatingChannel ? (
                      <div className="w-5 h-5 border-2 border-[#090d0e] border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <Plus className="w-4 h-4 stroke-[3]" />
                        <span>Criar Canal</span>
                      </>
                    )}
                  </button>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
