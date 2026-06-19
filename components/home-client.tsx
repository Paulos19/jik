"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import {
  Heart,
  MessageSquare,
  Sun,
  ArrowRight,
} from "lucide-react";
import Navbar from "./navbar";

type UserProps = {
  name?: string | null;
  email?: string | null;
  image?: string | null;
};

type Category = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  color: string | null;
  order: number;
};

type Post = {
  id: string;
  title: string;
  content: string;
  imageUrl?: string | null;
  published: boolean;
  pinned: boolean;
  locked: boolean;
  createdAt: string;
  updatedAt: string;
  author: {
    id: string;
    name: string | null;
    image: string | null;
  };
  category: {
    id: string;
    name: string;
    slug: string;
    color: string | null;
  };
};

type NewsItem = {
  id: string;
  title: string;
  summary: string;
  content: string | null;
  imageUrl: string | null;
  createdAt: string;
  author: {
    name: string | null;
  };
};

type UpdateItem = {
  id: string;
  appName: string;
  version: string | null;
  title: string;
  description: string;
  type: "FEATURE" | "BUGFIX" | "ANNOUNCEMENT" | "RELEASE";
  createdAt: string;
  author: {
    name: string | null;
  };
};

interface HomeClientProps {
  user?: UserProps | null;
  initialPosts: Post[];
  initialCategories: Category[];
  initialNews: NewsItem[];
  initialUpdates: UpdateItem[];
}

export default function HomeClient({
  user,
  initialPosts,
  initialCategories,
  initialNews,
  initialUpdates,
}: HomeClientProps) {

  // Helper for human-readable time
  const timeAgo = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 60) return `há ${diffMins} min`;
    if (diffHours < 24) return `há ${diffHours}h`;
    return `há ${diffDays}d`;
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: "spring" as const, stiffness: 100, damping: 20 },
    },
  };

  return (
    <div className="relative min-h-screen w-full bg-neutral-950 text-[#FBFBFB] flex flex-col justify-between overflow-x-hidden font-sans">

      {/* ──────────────────────── NAVBAR ──────────────────────── */}
      <Navbar user={user} />

      {/* ──────────────────────── HERO SECTION ──────────────────────── */}
      <section className="relative h-screen min-h-[600px] max-h-[850px] flex flex-col justify-between pt-24 pb-8 z-10 overflow-hidden">
        {/* Cinematic Background Video/Image */}
        <div className="absolute inset-0 w-full h-full overflow-hidden z-0 pointer-events-none">
          <video
            autoPlay
            loop
            muted
            playsInline
            className="absolute top-0 left-0 w-full h-full object-cover"
          >
            <source
              src="https://0nxicue7ew.ufs.sh/f/BGEz3YvO4INz1Nm0tyraZP4pYltWg12wLSuqKd7iy9I8DV3M"
              type="video/mp4"
            />
          </video>
          {/* Dark overlays for readability */}
          <div className="absolute inset-0 bg-black/45" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/30 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-transparent to-transparent" />
        </div>

        <div className="relative z-10 w-full max-w-7xl mx-auto px-6 lg:px-8 flex-1 flex flex-col justify-center">
          {/* Left Content */}
          <motion.div
            className="max-w-[550px] space-y-6"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <motion.h1
              className="text-5xl md:text-6xl font-extrabold tracking-tight leading-[1.1]"
              variants={itemVariants}
            >
              Um ecossistema <br />
              de integração, conexão <br />
              e <span className="bg-gradient-to-r from-[#9BE8D6] to-[#336E72] bg-clip-text text-transparent drop-shadow-sm">propósito.</span>
            </motion.h1>

            <motion.p
              className="text-lg text-[#FBFBFB]/75 leading-relaxed font-medium"
              variants={itemVariants}
            >
              Fórum interativo, hub de produtos e comunidade acolhedora para todos que desejam compartilhar, crescer e inspirar.
            </motion.p>

            <motion.div className="flex flex-wrap items-center gap-4 pt-2" variants={itemVariants}>
              <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
                <a
                  href="#preview-section"
                  className="group flex items-center justify-center gap-2 px-8 py-3 bg-gradient-to-r from-[#9BE8D6] to-[#336E72] text-[#FBFBFB] hover:shadow-[0_0_20px_rgba(155,232,214,0.3)] rounded-xl font-bold transition-all duration-300 border border-[#9BE8D6]/10 text-sm"
                >
                  Explorar o JiK
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </a>
              </motion.div>

              <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
                <Link
                  href="/forum"
                  className="px-8 py-3 bg-white/12 border border-white/15 hover:bg-white/20 text-[#FBFBFB] rounded-xl font-medium backdrop-blur-md transition-all duration-300 text-sm"
                >
                  Acessar Fórum
                </Link>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ──────────────────────── PREVIEW DO HUB E DO FÓRUM ──────────────────────── */}
      <section
        id="preview-section"
        className="relative z-20 w-full bg-[#0d1314] border-t border-white/5 py-24 scroll-mt-20"
      >
        <div className="max-w-7xl mx-auto px-6 lg:px-8 space-y-24">
          
          {/* 1. Hub News Preview */}
          <div className="space-y-12">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <div className="text-left">
                <h2 className="text-3xl font-extrabold tracking-tight text-[#FBFBFB]">
                  Novidades do Hub
                </h2>
                <p className="text-[#FBFBFB]/70 mt-2 text-sm max-w-xl">
                  Acompanhe os últimos lançamentos de aplicativos, anúncios oficiais e notícias do ecossistema JiK.
                </p>
              </div>
              <Link
                href="/aplicativos"
                className="flex items-center gap-1 text-sm font-bold text-[#9BE8D6] hover:text-white transition-colors cursor-pointer shrink-0"
              >
                <span>Ver todas as novidades</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {initialNews.length === 0 ? (
              <div className="bg-[#131d1f]/20 border border-white/5 rounded-3xl p-12 text-center">
                <p className="text-neutral-500 text-sm">Nenhuma notícia oficial publicada ainda.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {initialNews.slice(0, 2).map((news) => (
                  <div
                    key={news.id}
                    className="group bg-[#131d1f]/45 hover:bg-[#131d1f]/75 border border-white/5 hover:border-white/10 rounded-3xl p-6 transition-all duration-300 shadow-md flex flex-col justify-between"
                  >
                    <div className="space-y-4">
                      {news.imageUrl && (
                        <div className="w-full h-48 rounded-2xl overflow-hidden border border-white/10 bg-neutral-900">
                          <img
                            src={news.imageUrl}
                            alt={news.title}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-102"
                          />
                        </div>
                      )}
                      <div className="space-y-2 text-left">
                        <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#9BE8D6] bg-[#9BE8D6]/10 px-2 py-0.5 rounded border border-[#9BE8D6]/20">
                          Notícia Oficial
                        </span>
                        <h3 className="text-xl font-bold text-white group-hover:text-[#9BE8D6] transition-colors leading-snug">
                          {news.title}
                        </h3>
                        <p className="text-neutral-400 text-sm leading-relaxed line-clamp-3">
                          {news.summary}
                        </p>
                      </div>
                    </div>

                    <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between text-xs text-neutral-500">
                      <span>{new Date(news.createdAt).toLocaleDateString("pt-BR")}</span>
                      <Link
                        href="/aplicativos"
                        className="text-[#9BE8D6] font-bold hover:underline"
                      >
                        Ler mais
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 2. Forum Preview */}
          <div className="space-y-12">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <div className="text-left">
                <h2 className="text-3xl font-extrabold tracking-tight text-[#FBFBFB]">
                  Fórum da Comunidade
                </h2>
                <p className="text-[#FBFBFB]/70 mt-2 text-sm max-w-xl">
                  Partilhe da sua jornada, compartilhe testemunhos e debata ideias com outros membros em nosso fórum.
                </p>
              </div>
              <Link
                href="/forum"
                className="flex items-center gap-1 text-sm font-bold text-[#9BE8D6] hover:text-white transition-colors cursor-pointer shrink-0"
              >
                <span>Acessar Fórum completo</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {initialPosts.length === 0 ? (
              <div className="bg-[#131d1f]/20 border border-white/5 rounded-3xl p-12 text-center">
                <p className="text-neutral-500 text-sm">Nenhuma discussão iniciada no fórum ainda.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {initialPosts.slice(0, 3).map((post) => (
                  <div
                    key={post.id}
                    className="group bg-[#131d1f]/40 hover:bg-[#131d1f]/70 border border-white/5 hover:border-white/10 rounded-2xl p-6 transition-all duration-300 shadow-md flex flex-col justify-between text-left"
                  >
                    <div className="space-y-4">
                      <div className="flex items-center justify-between gap-2 text-[10px] text-neutral-500">
                        <span className="font-semibold text-neutral-400">u/{post.author.name}</span>
                        <span
                          className="w-2.5 h-2.5 rounded-full"
                          style={{ backgroundColor: post.category.color || "#336E72" }}
                          title={post.category.name}
                        />
                      </div>

                      <div className="space-y-1.5">
                        <h4 className="font-bold text-white group-hover:text-[#9BE8D6] transition-colors leading-snug line-clamp-2">
                          {post.title}
                        </h4>
                        <p className="text-[#FBFBFB]/70 text-xs leading-relaxed line-clamp-4">
                          {post.content}
                        </p>
                      </div>
                    </div>

                    <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between text-xs text-neutral-500">
                      <div className="flex items-center gap-3">
                        <span className="flex items-center gap-1 text-red-400">
                          <Heart className="w-3.5 h-3.5 fill-red-400/10" />
                          {(post.title.length % 12) + 3}
                        </span>
                        <span className="flex items-center gap-1">
                          <MessageSquare className="w-3.5 h-3.5" />
                          {(post.title.length % 5) + 1}
                        </span>
                      </div>
                      <span>{timeAgo(post.createdAt)}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </section>

      {/* ──────────────────────── BOTTOM QUOTE BAR / FOOTER ──────────────────────── */}
      <footer className="relative z-10 w-full bg-neutral-950/60 backdrop-blur-md border-t border-white/10 py-6">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <Image
              src="/imagens/logo.png"
              alt="JiK"
              width={70}
              height={22}
              className="h-5 w-auto object-contain opacity-60 hover:opacity-100 transition-opacity"
            />
          </div>

          <div className="text-center max-w-xl">
            <p className="text-[#FBFBFB]/75 text-sm font-serif italic">
              "Portanto, sejam firmes e constantes, sempre abundantes na obra do Senhor."
            </p>
            <p className="text-[#FBFBFB]/50 text-[11px] mt-0.5">1 Coríntios 15:58</p>
          </div>

          <div className="flex items-center gap-6 text-sm text-[#FBFBFB]/75">
            <Link href="/ajuda" className="hover:text-white transition-colors">Ajuda</Link>
            <Link href="/privacidade" className="hover:text-white transition-colors">Privacidade</Link>
            <Link href="/termos" className="hover:text-white transition-colors">Termos</Link>
            <button className="hover:text-[#9BE8D6] text-[#FBFBFB]/75 transition-colors p-1.5 cursor-pointer">
              <Sun className="w-4.5 h-4.5" />
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
