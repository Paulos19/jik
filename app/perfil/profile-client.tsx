"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { UploadButton } from "@/lib/uploadthing";
import Navbar from "@/components/navbar";
import { updateProfileImageAction, updateUserDetailsAction } from "@/app/actions/user";
import {
  User as UserIcon,
  Mail,
  Calendar,
  Shield,
  Edit2,
  Check,
  MessageSquare,
  ArrowLeft,
  Image as ImageIcon,
  Loader2,
} from "lucide-react";
import Link from "next/link";

type ForumPost = {
  id: string;
  title: string;
  content: string;
  imageUrl: string | null;
  createdAt: string;
  category: {
    name: string;
    color: string | null;
  };
};

type UserProfile = {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
  role: string;
  createdAt: string;
  forumPosts: ForumPost[];
};

export default function ProfileClient({ user }: { user: UserProfile }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [name, setName] = useState(user.name || "");
  const [isEditingName, setIsEditingName] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [tempAvatar, setTempAvatar] = useState<string | null>(null);

  const handleUpdateName = async () => {
    if (!name.trim()) return;
    startTransition(async () => {
      const res = await updateUserDetailsAction(name);
      if (res.error) {
        setUploadError(res.error);
        setSuccessMsg(null);
      } else {
        setSuccessMsg("Nome atualizado com sucesso!");
        setUploadError(null);
        setIsEditingName(false);
        router.refresh();
      }
    });
  };

  const handleAvatarUploaded = async (url: string) => {
    setTempAvatar(url);
    const res = await updateProfileImageAction(url);
    if (res.error) {
      setUploadError(res.error);
      setSuccessMsg(null);
      setTempAvatar(null);
    } else {
      setSuccessMsg("Foto de perfil atualizada!");
      setUploadError(null);
      router.refresh();
    }
  };

  // Format date nicely
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  return (
    <div className="min-h-screen bg-[#0d1314] text-[#FBFBFB] relative overflow-hidden font-sans">
      {/* Decorative Gradients */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-[#336E72]/15 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-[#9BE8D6]/10 blur-[120px] pointer-events-none" />

      {/* Navbar */}
      <Navbar user={{ name: user.name, email: user.email, image: tempAvatar || user.image }} />

      <main className="max-w-4xl mx-auto px-6 pt-28 pb-16 relative z-10">
        {/* Back Link */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-[#FBFBFB]/75 hover:text-[#9BE8D6] transition-colors mb-8 group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Voltar para Home
        </Link>

        {/* Success/Error Alerts */}
        <AnimatePresence mode="wait">
          {successMsg && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-6 p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-2xl flex items-center gap-3 text-sm"
            >
              <Check className="w-5 h-5 shrink-0" />
              <span>{successMsg}</span>
            </motion.div>
          )}

          {uploadError && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-6 p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-2xl flex items-center gap-3 text-sm"
            >
              <span className="shrink-0 font-bold">!</span>
              <span>{uploadError}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Profile Card */}
        <section className="bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-md mb-8">
          <div className="flex flex-col md:flex-row items-center gap-8">
            {/* Avatar Section */}
            <div className="flex flex-col items-center gap-4">
              <div className="relative group w-28 h-28 rounded-full overflow-hidden border-2 border-white/20 shadow-xl bg-gradient-to-tr from-[#9BE8D6] to-[#336E72] flex items-center justify-center">
                {tempAvatar || user.image ? (
                  <img
                    src={tempAvatar || user.image || ""}
                    alt={user.name || "Avatar"}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <UserIcon className="w-12 h-12 text-[#FBFBFB]/50" />
                )}
                {isPending && (
                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                    <Loader2 className="w-8 h-8 text-[#9BE8D6] animate-spin" />
                  </div>
                )}
              </div>

              {/* Uploadthing Button */}
              <div className="uploadthing-custom-theme">
                <UploadButton
                  endpoint="avatarUploader"
                  onClientUploadComplete={(res) => {
                    if (res && res[0]) {
                      handleAvatarUploaded(res[0].url);
                    }
                  }}
                  onUploadError={(error: Error) => {
                    setUploadError(`Erro no upload: ${error.message}`);
                    setSuccessMsg(null);
                  }}
                  content={{
                    button({ ready }) {
                      if (ready) return "Alterar Foto";
                      return "Carregando...";
                    },
                  }}
                  appearance={{
                    button:
                      "bg-white/10 hover:bg-white/15 border border-white/10 text-xs font-semibold px-4 py-2 rounded-full cursor-pointer text-[#FBFBFB] transition-colors focus-within:ring-2 focus-within:ring-[#9BE8D6]",
                    allowedContent: "hidden",
                  }}
                />
              </div>
            </div>

            {/* Profile Info Form */}
            <div className="flex-1 space-y-4 w-full">
              <div>
                <span className="text-[11px] uppercase tracking-wider text-[#FBFBFB]/50 font-bold">Nome</span>
                <div className="flex items-center gap-3 mt-1">
                  {isEditingName ? (
                    <div className="flex gap-2 w-full">
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm text-[#FBFBFB] focus:outline-none focus:border-[#9BE8D6] w-full"
                        disabled={isPending}
                      />
                      <button
                        onClick={handleUpdateName}
                        disabled={isPending}
                        className="px-4 py-2 bg-[#9BE8D6] text-neutral-900 rounded-xl font-semibold text-xs hover:bg-[#9BE8D6]/90 transition-colors shrink-0 flex items-center justify-center"
                      >
                        {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Salvar"}
                      </button>
                      <button
                        onClick={() => {
                          setName(user.name || "");
                          setIsEditingName(false);
                        }}
                        className="px-4 py-2 bg-white/10 text-[#FBFBFB] rounded-xl font-semibold text-xs hover:bg-white/15 transition-colors shrink-0"
                      >
                        Cancelar
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between w-full">
                      <span className="text-xl font-bold text-[#FBFBFB]">{name || "Sem Nome"}</span>
                      <button
                        onClick={() => setIsEditingName(true)}
                        className="p-2 hover:bg-white/5 rounded-full transition-colors text-[#FBFBFB]/75 hover:text-[#9BE8D6]"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <span className="text-[11px] uppercase tracking-wider text-[#FBFBFB]/50 font-bold flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5" /> E-mail
                  </span>
                  <span className="block mt-1 text-sm text-[#FBFBFB]/90 font-medium">{user.email}</span>
                </div>

                <div>
                  <span className="text-[11px] uppercase tracking-wider text-[#FBFBFB]/50 font-bold flex items-center gap-1.5">
                    <Shield className="w-3.5 h-3.5" /> Função
                  </span>
                  <span className="block mt-1 text-sm text-[#9BE8D6] font-semibold">{user.role}</span>
                </div>

                <div>
                  <span className="text-[11px] uppercase tracking-wider text-[#FBFBFB]/50 font-bold flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5" /> Membro Desde
                  </span>
                  <span className="block mt-1 text-sm text-[#FBFBFB]/75">{formatDate(user.createdAt)}</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* User Post History */}
        <section className="space-y-6">
          <div className="flex items-center gap-3">
            <MessageSquare className="w-5 h-5 text-[#9BE8D6]" />
            <h2 className="text-lg font-bold">Minhas Publicações ({user.forumPosts.length})</h2>
          </div>

          {user.forumPosts.length === 0 ? (
            <div className="bg-white/5 border border-white/10 rounded-3xl p-12 text-center flex flex-col items-center gap-4">
              <MessageSquare className="w-12 h-12 text-[#FBFBFB]/30" />
              <p className="text-[#FBFBFB]/75 text-sm">Você ainda não publicou nada no fórum.</p>
              <Link
                href="/#forum"
                className="px-6 py-2.5 bg-[#9BE8D6] text-neutral-900 rounded-full font-bold text-sm hover:opacity-90 hover:scale-102 transition-all shadow-md"
              >
                Criar Primeiro Tópico
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {user.forumPosts.map((post) => (
                <div
                  key={post.id}
                  className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/8 transition-colors flex flex-col md:flex-row gap-6 justify-between items-start"
                >
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <span
                        className="text-[10px] font-bold px-2 py-0.5 rounded-md uppercase"
                        style={{
                          backgroundColor: `${post.category.color || "#336E72"}20`,
                          color: post.category.color || "#9BE8D6",
                          border: `1px solid ${post.category.color || "#9BE8D6"}40`,
                        }}
                      >
                        {post.category.name}
                      </span>
                      <span className="text-xs text-[#FBFBFB]/50">{formatDate(post.createdAt)}</span>
                    </div>

                    <h3 className="font-bold text-base text-[#FBFBFB] hover:text-[#9BE8D6] transition-colors">
                      <Link href={`/#post-${post.id}`}>{post.title}</Link>
                    </h3>

                    <p className="text-sm text-[#FBFBFB]/75 line-clamp-2 leading-relaxed">
                      {post.content}
                    </p>
                  </div>

                  {post.imageUrl && (
                    <div className="w-24 h-24 rounded-xl overflow-hidden shrink-0 border border-white/10 self-center bg-neutral-950">
                      <img src={post.imageUrl} alt={post.title} className="w-full h-full object-cover" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
