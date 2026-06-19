"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users,
  Search,
  Plus,
  Lock,
  Globe,
  Sparkles,
  Check,
  AlertCircle,
  HelpCircle,
  BookOpen,
  ArrowUpRight,
  Shield,
  Info,
  Clock,
  Compass
} from "lucide-react";
import Navbar from "@/components/navbar";

type UserProps = {
  id: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
};

type Article = {
  id: string;
  title: string;
  summary: string;
  content: string | null;
  imageUrl: string | null;
  createdAt: string;
};

interface ComunidadeClientProps {
  user?: UserProps | null;
  initialArticles: Article[];
  initialCommunities: Community[];
}

// Plan definitions
const PLANS = {
  GRACE: {
    name: "Membro Básico",
    price: "R$ 0",
    description: "Ideal para começar a participar e experimentar a comunidade.",
    publicLimit: 1,
    inviteLimit: 5,
    features: [
      "Criar até 1 comunidade pública",
      "Criar comunidades restritas (limite de 5 convites)",
      "Participar de comunidades públicas",
      "Visualizar artigos e blogs oficiais"
    ],
    color: "from-neutral-400 to-neutral-600",
    badgeColor: "bg-neutral-500/10 text-neutral-400 border-neutral-500/20"
  },
  FIEL: {
    name: "Membro Pro",
    price: "R$ 19,90",
    description: "Para membros ativos que desejam expandir seus grupos e iniciativas.",
    publicLimit: 5,
    inviteLimit: 50,
    features: [
      "Criar até 5 comunidades públicas",
      "Criar comunidades restritas (limite de 50 convites)",
      "Selo exclusivo PRO no perfil",
      "Destaque moderado na listagem de comunidades",
      "Acesso antecipado a novos aplicativos do Hub"
    ],
    color: "from-[#9BE8D6] to-[#336E72]",
    badgeColor: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
  },
  APOSTOLO: {
    name: "Membro Elite",
    price: "R$ 49,90",
    description: "Para criadores e líderes de equipes que desejam liberdade total de criação.",
    publicLimit: Infinity,
    inviteLimit: Infinity,
    features: [
      "Criar comunidades públicas ILIMITADAS",
      "Criar comunidades restritas com convites ILIMITADOS",
      "Selo Gold Premium no perfil",
      "Destaque máximo na página principal",
      "Criar sub-fóruns dentro de suas comunidades",
      "Suporte prioritário da equipe JiK"
    ],
    color: "from-[#e2b857] to-[#8d6913]",
    badgeColor: "bg-amber-500/10 text-amber-400 border-amber-500/20"
  }
};

type SimulatedPlan = keyof typeof PLANS;

interface Community {
  id: string;
  name: string;
  description: string;
  type: "public" | "restricted";
  creatorId: string;
  creatorPlan: SimulatedPlan;
  memberCount: number;
  tags: string[];
  bannerGradient: string;
}

export default function ComunidadeClient({ user, initialArticles, initialCommunities }: ComunidadeClientProps) {
  // Simulated State for testing limits easily
  const [currentPlan, setCurrentPlan] = useState<SimulatedPlan>("GRACE");
  const [showPlansModal, setShowPlansModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<"all" | "public" | "restricted">("all");

  // Active Communities from DB
  const [communities, setCommunities] = useState<Community[]>(initialCommunities);

  // Form State for creating a community
  const [newCommName, setNewCommName] = useState("");
  const [newCommDesc, setNewCommDesc] = useState("");
  const [newCommType, setNewCommType] = useState<"public" | "restricted">("public");
  const [newCommTags, setNewCommTags] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // Plan info
  const planDetails = PLANS[currentPlan];

  // User's created communities count
  const myCommunities = communities.filter(c => c.creatorId === user?.id);
  const myPublicCount = myCommunities.filter(c => c.type === "public").length;

  // Validation
  const isLimitReached = newCommType === "public" && myPublicCount >= planDetails.publicLimit;

  // Handles simulated checkout upgrade
  const handleUpgrade = (planKey: SimulatedPlan) => {
    setCurrentPlan(planKey);
    setShowPlansModal(false);
    showToast(`Assinatura atualizada com sucesso para ${PLANS[planKey].name}! (Checkout Stripe simulado)`);
  };

  // Toast indicator
  const [toastMessage, setToastMessage] = useState("");
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 4000);
  };

  // Handle community creation
  const handleCreateCommunity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLimitReached) return;
    if (!newCommName.trim() || !newCommDesc.trim()) return;

    try {
      const res = await fetch("/api/comunidade", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: newCommName,
          description: newCommDesc,
          type: newCommType,
          tags: newCommTags ? newCommTags.split(",").map(t => t.trim()) : ["Geral"],
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Erro ao criar comunidade");
      }

      const createdCommunity = await res.json();

      setCommunities(prev => [createdCommunity, ...prev]);
      setNewCommName("");
      setNewCommDesc("");
      setNewCommType("public");
      setNewCommTags("");
      setShowCreateModal(false);
      showToast(`Comunidade "${createdCommunity.name}" criada com sucesso!`);
    } catch (err: any) {
      showToast(`Erro ao criar: ${err.message}`);
    }
  };

  // Filter Communities
  const filteredCommunities = communities.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          c.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          c.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesType = filterType === "all" || c.type === filterType;
    return matchesSearch && matchesType;
  });

  // Reusable Sidebar Filters for Desktop and Mobile Drawer
  const communityFilters = (
    <div className="space-y-6">
      {/* Search Input */}
      <div className="space-y-2">
        <h6 className="text-[10px] font-extrabold uppercase tracking-wider text-neutral-500">Buscar Comunidades</h6>
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Pesquisar por nome ou tag..."
            className="w-full bg-neutral-900 border border-white/10 rounded-xl pl-9 pr-4 py-2 text-xs text-white focus:border-[#9BE8D6] focus:outline-none"
          />
          <Search className="w-3.5 h-3.5 text-neutral-500 absolute left-3 top-2.5" />
        </div>
      </div>

      {/* Filter by Type */}
      <div className="space-y-2">
        <h6 className="text-[10px] font-extrabold uppercase tracking-wider text-neutral-500">Acesso</h6>
        <div className="flex flex-col gap-1.5">
          <button
            onClick={() => setFilterType("all")}
            className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold ${
              filterType === "all"
                ? "bg-[#336E72] text-[#FBFBFB]"
                : "bg-white/5 hover:bg-white/10 text-[#FBFBFB]/75"
            }`}
          >
            <span>Todas as comunidades</span>
            <span className="text-[9px] opacity-75">{communities.length}</span>
          </button>
          <button
            onClick={() => setFilterType("public")}
            className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold ${
              filterType === "public"
                ? "bg-[#336E72] text-[#FBFBFB]"
                : "bg-white/5 hover:bg-white/10 text-[#FBFBFB]/75"
            }`}
          >
            <div className="flex items-center gap-2">
              <Globe className="w-3.5 h-3.5 text-[#9BE8D6]" />
              <span>Liberadas (Públicas)</span>
            </div>
            <span className="text-[9px] opacity-75">{communities.filter(c => c.type === "public").length}</span>
          </button>
          <button
            onClick={() => setFilterType("restricted")}
            className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold ${
              filterType === "restricted"
                ? "bg-[#336E72] text-[#FBFBFB]"
                : "bg-white/5 hover:bg-white/10 text-[#FBFBFB]/75"
            }`}
          >
            <div className="flex items-center gap-2">
              <Lock className="w-3.5 h-3.5 text-amber-400" />
              <span>Restritas (Por convite)</span>
            </div>
            <span className="text-[9px] opacity-75">{communities.filter(c => c.type === "restricted").length}</span>
          </button>
        </div>
      </div>

      {/* Pro/Premium Members List */}
      <div className="space-y-3 pt-2">
        <h6 className="text-[10px] font-extrabold uppercase tracking-wider text-neutral-500">Membros Destaque</h6>
        <div className="space-y-2">
          <div className="flex items-center justify-between p-2.5 bg-[#131d1f]/35 border border-white/5 rounded-xl">
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-8 h-8 rounded-full border-2 border-[#e2b857] flex items-center justify-center bg-neutral-900 text-xs font-bold text-[#e2b857]">
                AM
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-white truncate">Dr. André Marques</p>
                <p className="text-[9px] text-[#e2b857] font-semibold">Membro Elite</p>
              </div>
            </div>
            <Sparkles className="w-3.5 h-3.5 text-[#e2b857] shrink-0" />
          </div>

          <div className="flex items-center justify-between p-2.5 bg-[#131d1f]/35 border border-white/5 rounded-xl">
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-8 h-8 rounded-full border-2 border-[#9BE8D6] flex items-center justify-center bg-neutral-900 text-xs font-bold text-[#9BE8D6]">
                SL
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-white truncate">Sarah Lima</p>
                <p className="text-[9px] text-[#9BE8D6] font-semibold">Membro Pro</p>
              </div>
            </div>
            <Shield className="w-3.5 h-3.5 text-[#9BE8D6] shrink-0" />
          </div>

          <div className="flex items-center justify-between p-2.5 bg-[#131d1f]/35 border border-white/5 rounded-xl">
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-8 h-8 rounded-full border-2 border-[#9BE8D6] flex items-center justify-center bg-neutral-900 text-xs font-bold text-[#9BE8D6]">
                TC
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-white truncate">Thiago Cardoso</p>
                <p className="text-[9px] text-[#9BE8D6] font-semibold">Membro Pro</p>
              </div>
            </div>
            <Shield className="w-3.5 h-3.5 text-[#9BE8D6] shrink-0" />
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="relative min-h-screen w-full bg-neutral-950 text-[#FBFBFB] flex flex-col justify-between overflow-x-hidden font-sans">
      
      {/* Header / Navbar */}
      <Navbar user={user} mobileFilters={communityFilters} />

      {/* ──────────────────────── SIMULADOR DE PLANOS E HERO ──────────────────────── */}
      <section className="relative pt-32 pb-8 flex flex-col justify-center overflow-hidden z-10">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-[#336E72]/15 blur-[120px] rounded-full z-0 pointer-events-none" />

        <div className="relative z-10 w-full max-w-7xl mx-auto px-6 lg:px-8 space-y-6">
          {/* Header dashboard widgets */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-[#131d1f]/35 border border-white/5 rounded-3xl p-6 backdrop-blur-md">
            
            {/* Account Status / Plan info */}
            <div className="flex flex-wrap items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-[#336E72]/20 border border-[#9BE8D6]/20 flex items-center justify-center text-[#9BE8D6] shadow-inner">
                <Compass className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-bold text-white tracking-tight">Hub de Comunidades</h1>
                  <span className={`text-[10px] font-extrabold uppercase tracking-widest px-2 py-0.5 rounded-full border ${planDetails.badgeColor}`}>
                    {planDetails.name}
                  </span>
                </div>
                <p className="text-xs text-neutral-400 mt-0.5">
                  Assinatura do ecossistema para criar e gerenciar pequenos grupos e comunidades.
                </p>
              </div>
            </div>

            {/* Plan simulator widget & Upgrade Action */}
            <div className="flex flex-wrap items-center gap-3">
              {/* Simulator select */}
              <div className="bg-neutral-900/60 border border-white/10 rounded-xl px-3 py-1.5 flex items-center gap-2">
                <label className="text-[9px] font-extrabold uppercase tracking-widest text-neutral-500">
                  Simular Plano:
                </label>
                <select
                  value={currentPlan}
                  onChange={(e) => {
                    setCurrentPlan(e.target.value as SimulatedPlan);
                    showToast(`Plano alterado no simulador para ${PLANS[e.target.value as SimulatedPlan].name}`);
                  }}
                  className="bg-transparent text-xs font-bold text-[#9BE8D6] focus:outline-none cursor-pointer"
                >
                  <option value="GRACE">Membro Básico (Grátis)</option>
                  <option value="FIEL">Membro Pro (Pro)</option>
                  <option value="APOSTOLO">Membro Elite (Premium)</option>
                </select>
              </div>

              {/* Upgrade Button */}
              <button
                onClick={() => setShowPlansModal(true)}
                className="px-4 py-2 bg-gradient-to-r from-[#9BE8D6] to-[#336E72] hover:shadow-[0_0_15px_rgba(155,232,214,0.25)] text-[#FBFBFB] rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 hover:scale-102"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Gerenciar Assinatura</span>
              </button>
            </div>

          </div>
        </div>
      </section>

      {/* ──────────────────────── MAIN LAYOUT SPLIT-SCREEN ──────────────────────── */}
      <section className="relative z-10 w-full max-w-7xl mx-auto px-6 lg:px-8 pb-24">
        <div className="grid grid-cols-1 lg:grid-cols-10 gap-8">
          
          {/* Main Content Area (8 Cols) */}
          <div className="lg:col-span-7 space-y-10">
            
            {/* Admin Banner Announcement */}
            <div className="relative w-full rounded-3xl overflow-hidden border border-white/10 bg-gradient-to-br from-[#131d1f]/60 to-neutral-900 p-6 md:p-8 flex flex-col md:flex-row justify-between items-center gap-6 shadow-xl">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#336E72]/10 blur-3xl rounded-full" />
              <div className="space-y-3 max-w-xl text-left">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-[#9BE8D6]/10 border border-[#9BE8D6]/20 text-[#9BE8D6] rounded-md text-[10px] font-bold uppercase tracking-wider">
                  <Info className="w-3.5 h-3.5" />
                  <span>Anúncio Oficial</span>
                </div>
                <h2 className="text-xl font-extrabold text-white leading-tight">
                  Construa pontes virtuais para sua comunidade!
                </h2>
                <p className="text-neutral-400 text-xs leading-relaxed">
                  Conecte sua equipe, pequeno grupo de estudos, círculo de discussões ou projetos coletivos de forma prática. Use os limites do seu plano JiK e organize encontros, estudos estruturados e avisos importantes de forma direta e exclusiva.
                </p>
              </div>

              <button
                onClick={() => setShowCreateModal(true)}
                className="group flex items-center justify-center gap-2 px-5 py-3 bg-white/10 hover:bg-white/15 border border-white/10 hover:border-white/20 text-white rounded-xl text-xs font-bold transition-all duration-300 shrink-0 cursor-pointer shadow-md hover:scale-102"
              >
                <Plus className="w-4 h-4 text-[#9BE8D6]" />
                Criar Nova Comunidade
              </button>
            </div>

            {/* Simulated Limits Stats Bar */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 bg-[#131d1f]/20 border border-white/5 rounded-2xl text-left space-y-1">
                <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">
                  Comunidades Públicas
                </span>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-2xl font-bold text-white">{myPublicCount}</span>
                  <span className="text-xs text-neutral-500">
                    / {planDetails.publicLimit === Infinity ? "∞" : planDetails.publicLimit}
                  </span>
                </div>
                <div className="w-full bg-neutral-900 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-[#9BE8D6] to-[#336E72] h-full"
                    style={{ width: `${planDetails.publicLimit === Infinity ? 100 : Math.min(100, (myPublicCount / planDetails.publicLimit) * 100)}%` }}
                  />
                </div>
              </div>

              <div className="p-4 bg-[#131d1f]/20 border border-white/5 rounded-2xl text-left space-y-1">
                <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">
                  Limite de Convites/Restritas
                </span>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-2xl font-bold text-white">
                    {planDetails.inviteLimit === Infinity ? "Ilimitados" : `${planDetails.inviteLimit}`}
                  </span>
                  <span className="text-[10px] text-neutral-500 font-semibold">por grupo</span>
                </div>
                <p className="text-[9px] text-neutral-500">
                  {planDetails.inviteLimit === Infinity ? "Sem restrições de envio de link" : "Convites individuais com autorização prévia"}
                </p>
              </div>

              <div className="p-4 bg-[#131d1f]/20 border border-white/5 rounded-2xl text-left space-y-1 flex flex-col justify-between">
                <div>
                  <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">
                    Status do Plano
                  </span>
                  <p className="text-xs font-bold text-[#9BE8D6] mt-0.5">{planDetails.name}</p>
                </div>
                <button
                  onClick={() => setShowPlansModal(true)}
                  className="text-[9px] font-extrabold uppercase tracking-wider text-[#9BE8D6] hover:underline cursor-pointer text-left"
                >
                  Ver todos os benefícios →
                </button>
              </div>
            </div>

            {/* Communities Grid */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-white tracking-tight">Comunidades Ativas</h3>
                <span className="text-xs text-neutral-500">{filteredCommunities.length} encontradas</span>
              </div>

              {filteredCommunities.length === 0 ? (
                <div className="bg-[#131d1f]/25 border border-white/5 rounded-3xl p-12 text-center space-y-2">
                  <p className="text-neutral-500 text-sm">Nenhuma comunidade ativa corresponde aos filtros.</p>
                  <button
                    onClick={() => { setSearchQuery(""); setFilterType("all"); }}
                    className="text-xs font-bold text-[#9BE8D6] hover:underline"
                  >
                    Limpar filtros
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {filteredCommunities.map((comm) => (
                    <div
                      key={comm.id}
                      className="group bg-[#131d1f]/35 border border-white/5 hover:border-white/10 rounded-2xl p-5 transition-all duration-300 shadow-md flex flex-col justify-between relative overflow-hidden text-left"
                    >
                      {/* Gradient overlay */}
                      <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${PLANS[comm.creatorPlan].color}`} />

                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <span className={`text-[9px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-lg flex items-center gap-1 ${
                            comm.type === "public"
                              ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                              : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                          }`}>
                            {comm.type === "public" ? (
                              <>
                                <Globe className="w-3 h-3" />
                                <span>Pública</span>
                              </>
                            ) : (
                              <>
                                <Lock className="w-3 h-3" />
                                <span>Restrita</span>
                              </>
                            )}
                          </span>

                          <span className={`text-[8px] font-bold uppercase tracking-widest px-2 py-0.5 bg-neutral-900 border border-white/10 text-neutral-400 rounded-full`}>
                            Criado por: {PLANS[comm.creatorPlan].name}
                          </span>
                        </div>

                        <div className="space-y-1.5">
                          <h4 className="font-bold text-white group-hover:text-[#9BE8D6] transition-colors leading-snug text-base">
                            {comm.name}
                          </h4>
                          <p className="text-neutral-400 text-xs leading-relaxed line-clamp-3">
                            {comm.description}
                          </p>
                        </div>

                        {/* Tags */}
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {comm.tags.map((tag, i) => (
                            <span key={i} className="text-[9px] text-[#FBFBFB]/60 bg-white/5 px-2 py-0.5 rounded border border-transparent">
                              #{tag}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Footer card */}
                      <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between text-xs text-neutral-400">
                        <span className="flex items-center gap-1">
                          <Users className="w-3.5 h-3.5 text-[#9BE8D6]" />
                          {comm.memberCount} membros
                        </span>
                        
                        {comm.type === "public" ? (
                          <button
                            onClick={() => {
                              showToast(`Você ingressou na comunidade "${comm.name}"!`);
                              setTimeout(() => {
                                window.location.href = `/comunidade/${comm.id}`;
                              }, 1000);
                            }}
                            className="text-[#9BE8D6] font-bold hover:underline flex items-center gap-0.5 cursor-pointer"
                          >
                            <span>Participar</span>
                            <ArrowUpRight className="w-3 h-3" />
                          </button>
                        ) : (
                          <button
                            onClick={() => {
                              showToast(`Solicitação de acesso enviada para "${comm.name}"! Entrando como visitante...`);
                              setTimeout(() => {
                                window.location.href = `/comunidade/${comm.id}`;
                              }, 1000);
                            }}
                            className="text-amber-400 font-bold hover:underline flex items-center gap-0.5 cursor-pointer"
                          >
                            <span>Acessar Sala</span>
                            <ArrowUpRight className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Articles and Blog Section */}
            <div className="space-y-6 pt-6 border-t border-white/5">
              <div className="flex items-center justify-between">
                <div className="text-left">
                  <h3 className="text-lg font-bold text-white tracking-tight">Artigos e Conhecimento</h3>
                  <p className="text-xs text-neutral-500">Conteúdo de desenvolvimento oficial criado pela equipe JiK</p>
                </div>
                <BookOpen className="w-5 h-5 text-[#9BE8D6] opacity-75" />
              </div>

              {initialArticles.length === 0 ? (
                // Fallback Mock Articles if database is empty
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-[#131d1f]/20 border border-white/5 hover:border-white/10 rounded-2xl p-5 space-y-4 transition-all duration-300 text-left">
                    <span className="text-[8px] font-extrabold uppercase tracking-widest text-[#9BE8D6] bg-[#9BE8D6]/10 px-2 py-0.5 rounded border border-[#9BE8D6]/20">
                      Liderança
                    </span>
                    <div className="space-y-1.5">
                      <h5 className="font-bold text-white text-sm leading-snug">Como estruturar um Pequeno Grupo de Estudos</h5>
                      <p className="text-neutral-400 text-[11px] leading-relaxed line-clamp-3">
                        Passos práticos, dinâmicas eficientes e como gerenciar sugestões e debates de grupo de forma fluida.
                      </p>
                    </div>
                    <div className="flex items-center justify-between text-[9px] text-neutral-500 pt-2 border-t border-white/5">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" /> 5 min leitura
                      </span>
                      <span className="hover:text-[#9BE8D6] cursor-pointer font-bold">Ler artigo</span>
                    </div>
                  </div>

                  <div className="bg-[#131d1f]/20 border border-white/5 hover:border-white/10 rounded-2xl p-5 space-y-4 transition-all duration-300 text-left">
                    <span className="text-[8px] font-extrabold uppercase tracking-widest text-[#9BE8D6] bg-[#9BE8D6]/10 px-2 py-0.5 rounded border border-[#9BE8D6]/20">
                      Desenvolvimento
                    </span>
                    <div className="space-y-1.5">
                      <h5 className="font-bold text-white text-sm leading-snug">A Importância da Conexão no Ambiente Digital</h5>
                      <p className="text-neutral-400 text-[11px] leading-relaxed line-clamp-3">
                        Como as redes virtuais e fóruns podem atuar como apoio mútuo e desenvolvimento na vida real.
                      </p>
                    </div>
                    <div className="flex items-center justify-between text-[9px] text-neutral-500 pt-2 border-t border-white/5">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" /> 7 min leitura
                      </span>
                      <span className="hover:text-[#9BE8D6] cursor-pointer font-bold">Ler artigo</span>
                    </div>
                  </div>

                  <div className="bg-[#131d1f]/20 border border-white/5 hover:border-white/10 rounded-2xl p-5 space-y-4 transition-all duration-300 text-left">
                    <span className="text-[8px] font-extrabold uppercase tracking-widest text-[#9BE8D6] bg-[#9BE8D6]/10 px-2 py-0.5 rounded border border-[#9BE8D6]/20">
                      Análise
                    </span>
                    <div className="space-y-1.5">
                      <h5 className="font-bold text-white text-sm leading-snug">Análise Textual: Interpretando Documentos Complexos</h5>
                      <p className="text-neutral-400 text-[11px] leading-relaxed line-clamp-3">
                        Dicas e diretrizes fundamentais para não retirar trechos de seu contexto original e cultural.
                      </p>
                    </div>
                    <div className="flex items-center justify-between text-[9px] text-neutral-500 pt-2 border-t border-white/5">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" /> 6 min leitura
                      </span>
                      <span className="hover:text-[#9BE8D6] cursor-pointer font-bold">Ler artigo</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {initialArticles.map((art) => (
                    <article
                      key={art.id}
                      className="group bg-[#131d1f]/20 hover:bg-[#131d1f]/45 border border-white/5 hover:border-white/10 rounded-2xl p-5 transition-all duration-300 flex gap-4 items-start text-left"
                    >
                      {art.imageUrl && (
                        <div className="w-20 h-20 rounded-xl overflow-hidden shrink-0 border border-white/10 bg-neutral-900">
                          <img src={art.imageUrl} alt={art.title} className="w-full h-full object-cover" />
                        </div>
                      )}
                      <div className="flex-1 space-y-2 min-w-0">
                        <span className="text-[8px] font-extrabold uppercase tracking-widest text-[#9BE8D6] bg-[#9BE8D6]/10 px-2 py-0.5 rounded border border-[#9BE8D6]/20">
                          Oficial Admin
                        </span>
                        <h4 className="font-bold text-white text-sm leading-tight truncate group-hover:text-[#9BE8D6] transition-colors">
                          {art.title}
                        </h4>
                        <p className="text-neutral-400 text-[11px] leading-relaxed line-clamp-2">
                          {art.summary}
                        </p>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </div>

          </div>

          {/* Desktop Right Sidebar (3 Cols) */}
          <div className="hidden lg:block lg:col-span-3 bg-neutral-950 text-left border-l border-white/5 pl-8 space-y-6">
            {communityFilters}
          </div>

        </div>
      </section>

      {/* ──────────────────────── SIMULATED TOAST MESSAGE ──────────────────────── */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.95 }}
            className="fixed bottom-6 right-6 z-50 px-5 py-3 bg-[#131d1f] border border-[#9BE8D6]/30 text-white rounded-2xl shadow-xl flex items-center gap-3 text-xs max-w-sm"
          >
            <Sparkles className="w-4 h-4 text-[#9BE8D6] shrink-0" />
            <p className="font-medium">{toastMessage}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ──────────────────────── MODAL: UPGRADE PLANS ──────────────────────── */}
      <AnimatePresence>
        {showPlansModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowPlansModal(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-4xl bg-[#090d0e] border border-white/10 rounded-3xl p-6 md:p-8 overflow-y-auto max-h-[90vh] shadow-2xl space-y-6 text-left"
            >
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div>
                  <h3 className="text-xl font-extrabold text-white tracking-tight">Planos & Níveis de Conta</h3>
                  <p className="text-xs text-neutral-400 mt-1">
                    Escolha o plano ideal para as necessidades do seu grupo ou equipe.
                  </p>
                </div>
                <button
                  onClick={() => setShowPlansModal(false)}
                  className="p-1.5 bg-white/5 hover:bg-white/10 rounded-xl border border-white/10 text-neutral-400 hover:text-white transition-colors cursor-pointer"
                >
                  <XIcon className="w-4 h-4" />
                </button>
              </div>

              {/* Three Plans Layout */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* PLAN: GRACE */}
                <div className={`relative bg-[#131d1f]/20 border ${currentPlan === "GRACE" ? "border-[#9BE8D6]/30 bg-[#131d1f]/45" : "border-white/5"} rounded-2xl p-5 flex flex-col justify-between space-y-6`}>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-extrabold uppercase tracking-widest text-neutral-400">Grace</span>
                      {currentPlan === "GRACE" && (
                        <span className="text-[9px] font-extrabold uppercase tracking-wider px-2 py-0.5 bg-[#9BE8D6]/10 text-[#9BE8D6] rounded border border-[#9BE8D6]/20">
                          Ativo
                        </span>
                      )}
                    </div>
                    <div>
                      <h4 className="text-3xl font-extrabold text-white">R$ 0</h4>
                      <p className="text-[10px] text-neutral-400 mt-1">{PLANS.GRACE.description}</p>
                    </div>
                    <ul className="space-y-2.5 pt-2">
                      {PLANS.GRACE.features.map((feat, i) => (
                        <li key={i} className="text-xs text-neutral-300 flex items-start gap-2">
                          <Check className="w-4 h-4 text-[#9BE8D6] shrink-0 mt-0.5" />
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <button
                    disabled={currentPlan === "GRACE"}
                    onClick={() => handleUpgrade("GRACE")}
                    className={`w-full py-2.5 rounded-xl text-xs font-bold transition-all ${
                      currentPlan === "GRACE"
                        ? "bg-white/5 border border-white/10 text-neutral-500 cursor-default"
                        : "bg-white/10 hover:bg-white/15 border border-white/10 text-white cursor-pointer"
                    }`}
                  >
                    {currentPlan === "GRACE" ? "Plano Atual" : "Selecionar Básico"}
                  </button>
                </div>

                {/* PLAN: FIEL */}
                <div className={`relative bg-[#131d1f]/25 border ${currentPlan === "FIEL" ? "border-emerald-500/40 bg-[#131d1f]/60" : "border-white/10"} rounded-2xl p-5 flex flex-col justify-between space-y-6 shadow-lg`}>
                  {/* Highlight Ribbon */}
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-[#9BE8D6] to-[#336E72] text-[#FBFBFB] font-extrabold uppercase tracking-widest text-[8px] px-3 py-1 rounded-full border border-[#9BE8D6]/20">
                    Recomendado
                  </div>

                  <div className="space-y-4 pt-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-extrabold uppercase tracking-widest text-[#9BE8D6]">Fiel</span>
                      {currentPlan === "FIEL" && (
                        <span className="text-[9px] font-extrabold uppercase tracking-wider px-2 py-0.5 bg-emerald-500/10 text-emerald-400 rounded border border-emerald-500/20">
                          Ativo
                        </span>
                      )}
                    </div>
                    <div>
                      <h4 className="text-3xl font-extrabold text-white">R$ 19,90 <span className="text-xs font-normal text-neutral-500">/mês</span></h4>
                      <p className="text-[10px] text-neutral-400 mt-1">{PLANS.FIEL.description}</p>
                    </div>
                    <ul className="space-y-2.5 pt-2">
                      {PLANS.FIEL.features.map((feat, i) => (
                        <li key={i} className="text-xs text-neutral-300 flex items-start gap-2">
                          <Check className="w-4 h-4 text-[#9BE8D6] shrink-0 mt-0.5" />
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <button
                    disabled={currentPlan === "FIEL"}
                    onClick={() => handleUpgrade("FIEL")}
                    className={`w-full py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      currentPlan === "FIEL"
                        ? "bg-white/5 border border-white/10 text-neutral-500 cursor-default"
                        : "bg-gradient-to-r from-[#9BE8D6] to-[#336E72] hover:shadow-[0_0_15px_rgba(155,232,214,0.25)] text-white"
                    }`}
                  >
                    {currentPlan === "FIEL" ? "Plano Atual" : "Assinar Pro"}
                  </button>
                </div>

                {/* PLAN: APOSTOLO */}
                <div className={`relative bg-[#131d1f]/20 border ${currentPlan === "APOSTOLO" ? "border-amber-500/40 bg-[#131d1f]/45" : "border-white/5"} rounded-2xl p-5 flex flex-col justify-between space-y-6`}>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-extrabold uppercase tracking-widest text-amber-400">Apóstolo</span>
                      {currentPlan === "APOSTOLO" && (
                        <span className="text-[9px] font-extrabold uppercase tracking-wider px-2 py-0.5 bg-amber-500/10 text-amber-400 rounded border border-amber-500/20">
                          Ativo
                        </span>
                      )}
                    </div>
                    <div>
                      <h4 className="text-3xl font-extrabold text-white">R$ 49,90 <span className="text-xs font-normal text-neutral-500">/mês</span></h4>
                      <p className="text-[10px] text-neutral-400 mt-1">{PLANS.APOSTOLO.description}</p>
                    </div>
                    <ul className="space-y-2.5 pt-2">
                      {PLANS.APOSTOLO.features.map((feat, i) => (
                        <li key={i} className="text-xs text-neutral-300 flex items-start gap-2">
                          <Check className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <button
                    disabled={currentPlan === "APOSTOLO"}
                    onClick={() => handleUpgrade("APOSTOLO")}
                    className={`w-full py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      currentPlan === "APOSTOLO"
                        ? "bg-white/5 border border-white/10 text-neutral-500 cursor-default"
                        : "bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20 text-amber-400 hover:text-amber-300"
                    }`}
                  >
                    {currentPlan === "APOSTOLO" ? "Plano Atual" : "Assinar Elite"}
                  </button>
                </div>

              </div>

              <div className="flex items-center gap-2 p-3 bg-neutral-900/60 border border-white/5 rounded-xl text-[10px] text-neutral-400 leading-normal">
                <Info className="w-4 h-4 text-[#9BE8D6] shrink-0" />
                <p>
                  As assinaturas acima são gerenciadas e processadas via checkout seguro do Stripe. Seus dados financeiros e credenciais de pagamento não são guardados em nossos servidores.
                </p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ──────────────────────── MODAL: CREATE COMMUNITY ──────────────────────── */}
      <AnimatePresence>
        {showCreateModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowCreateModal(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg bg-[#090d0e] border border-white/10 rounded-3xl p-6 md:p-8 overflow-y-auto max-h-[90vh] shadow-2xl space-y-6 text-left"
            >
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div>
                  <h3 className="text-xl font-extrabold text-white tracking-tight">Criar Nova Comunidade</h3>
                  <p className="text-xs text-neutral-400 mt-1">
                    Crie um espaço de conexão para seus membros sob o plano <strong className="text-[#9BE8D6]">{planDetails.name}</strong>.
                  </p>
                </div>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="p-1.5 bg-white/5 hover:bg-white/10 rounded-xl border border-white/10 text-neutral-400 hover:text-white transition-colors cursor-pointer"
                >
                  <XIcon className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleCreateCommunity} className="space-y-4">
                {/* Community Name */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-neutral-300">Nome da Comunidade</label>
                  <input
                    type="text"
                    required
                    value={newCommName}
                    onChange={(e) => setNewCommName(e.target.value)}
                    placeholder="Ex: Jovens Líderes, Grupo de Estudos"
                    className="w-full bg-neutral-900 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:border-[#9BE8D6] focus:outline-none"
                  />
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-neutral-300">Descrição do Grupo</label>
                  <textarea
                    required
                    rows={3}
                    value={newCommDesc}
                    onChange={(e) => setNewCommDesc(e.target.value)}
                    placeholder="Conte o objetivo da comunidade, dias de encontros ou metas..."
                    className="w-full bg-neutral-900 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:border-[#9BE8D6] focus:outline-none resize-none"
                  />
                </div>

                {/* Accessibility Type */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-neutral-300">Acesso e Disponibilidade</label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setNewCommType("public")}
                      className={`p-3 rounded-xl border text-left flex flex-col justify-between space-y-2 transition-all ${
                        newCommType === "public"
                          ? "bg-[#336E72]/10 border-[#9BE8D6] text-white"
                          : "bg-neutral-900/60 border-white/5 text-neutral-400 hover:text-white"
                      }`}
                    >
                      <Globe className={`w-5 h-5 ${newCommType === "public" ? "text-[#9BE8D6]" : ""}`} />
                      <div>
                        <p className="text-xs font-bold">Pública (Livre)</p>
                        <p className="text-[9px] text-neutral-400 leading-normal mt-0.5">
                          Liberada para qualquer membro entrar imediatamente.
                        </p>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setNewCommType("restricted")}
                      className={`p-3 rounded-xl border text-left flex flex-col justify-between space-y-2 transition-all ${
                        newCommType === "restricted"
                          ? "bg-amber-500/5 border-amber-500/80 text-white"
                          : "bg-neutral-900/60 border-white/5 text-neutral-400 hover:text-white"
                      }`}
                    >
                      <Lock className={`w-5 h-5 ${newCommType === "restricted" ? "text-amber-400" : ""}`} />
                      <div>
                        <p className="text-xs font-bold">Restrita (Convite)</p>
                        <p className="text-[9px] text-neutral-400 leading-normal mt-0.5">
                          Apenas convites ou solicitação autorizada de moderadores.
                        </p>
                      </div>
                    </button>
                  </div>
                </div>

                {/* Tags */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-neutral-300">Tags (Separadas por vírgula)</label>
                  <input
                    type="text"
                    value={newCommTags}
                    onChange={(e) => setNewCommTags(e.target.value)}
                    placeholder="Ex: jovens, estudos, networking"
                    className="w-full bg-neutral-900 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:border-[#9BE8D6] focus:outline-none"
                  />
                </div>

                {/* Limits Validation Alert / Message */}
                {newCommType === "public" ? (
                  <div className={`p-3 border rounded-xl flex gap-2.5 items-start text-xs ${
                    isLimitReached
                      ? "bg-red-500/10 border-red-500/20 text-red-400"
                      : "bg-[#131d1f]/45 border-[#9BE8D6]/10 text-neutral-300"
                  }`}>
                    {isLimitReached ? (
                      <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    ) : (
                      <Check className="w-4 h-4 text-[#9BE8D6] shrink-0 mt-0.5" />
                    )}
                    <div className="leading-normal">
                      {isLimitReached ? (
                        <p>
                          <strong>Limite excedido!</strong> Você já possui <strong>{myPublicCount}</strong> de <strong>{planDetails.publicLimit}</strong> comunidades públicas permitidas no plano <strong>{planDetails.name}</strong>.
                        </p>
                      ) : (
                        <p>
                          Plano ativo: <strong>{planDetails.name}</strong>. Você possui <strong>{myPublicCount}</strong> de <strong>{planDetails.publicLimit}</strong> comunidades públicas criadas.
                        </p>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="p-3 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-xl flex gap-2.5 items-start text-xs leading-normal">
                    <Info className="w-4 h-4 shrink-0 mt-0.5" />
                    <p>
                      Comunidades restritas possuem um limite de <strong>{planDetails.inviteLimit === Infinity ? "convites ilimitados" : `${planDetails.inviteLimit} convites ativos`}</strong> sob o plano <strong>{planDetails.name}</strong>.
                    </p>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="flex-1 py-2.5 border border-white/10 hover:bg-white/5 text-xs font-bold rounded-xl text-neutral-400 hover:text-white transition-colors cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={isLimitReached}
                    className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                      isLimitReached
                        ? "bg-white/5 border border-white/10 text-neutral-500 cursor-not-allowed"
                        : "bg-gradient-to-r from-[#9BE8D6] to-[#336E72] text-[#FBFBFB] hover:opacity-90 shadow-md cursor-pointer hover:scale-102"
                    }`}
                  >
                    <Plus className="w-4 h-4" />
                    <span>Criar Comunidade</span>
                  </button>
                </div>

                {isLimitReached && (
                  <button
                    type="button"
                    onClick={() => {
                      setShowCreateModal(false);
                      setShowPlansModal(true);
                    }}
                    className="w-full text-center text-[10px] font-extrabold uppercase tracking-widest text-[#9BE8D6] hover:underline pt-1"
                  >
                    Fazer Upgrade de Plano de Assinatura →
                  </button>
                )}
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/5 py-8 bg-neutral-950/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 text-center text-xs text-neutral-500 space-y-2">
          <p>© {new Date().getFullYear()} JiK Ecosystem. Todos os direitos reservados.</p>
          <p>Módulos de comunidade integrados com Stripe Billing e planos multinível.</p>
        </div>
      </footer>

    </div>
  );
}

function XIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
    </svg>
  );
}
