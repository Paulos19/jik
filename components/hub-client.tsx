"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Smartphone,
  BookOpen,
  Music,
  Users2,
  GitBranch,
  Calendar,
  ChevronRight,
  TrendingUp,
  Tag,
  ArrowUpRight,
  User,
} from "lucide-react";
import Navbar from "@/components/navbar";

type UserProps = {
  name?: string | null;
  email?: string | null;
  image?: string | null;
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

interface HubClientProps {
  user?: UserProps | null;
  news: NewsItem[];
  updates: UpdateItem[];
}

export default function HubClient({ user, news, updates }: HubClientProps) {
  const [activeTab, setActiveTab] = useState<"apps" | "noticias" | "updates">("apps");
  const [filterType, setFilterType] = useState<string>("ALL");

  const apps = [
    {
      id: "devocional",
      name: "Diário Devocional",
      description: "Cultive sua vida devocional registrando orações, anotando reflexões bíblicas e acompanhando planos de leitura personalizados.",
      icon: BookOpen,
      status: "Em Desenvolvimento",
      color: "#81B29A",
      features: ["Planos de Leitura", "Espaço de Oração", "Anotações com Tags"],
    },
    {
      id: "harpa",
      name: "Harpa Cristã",
      description: "O hinário oficial da igreja no seu bolso. Cante com playbacks em áudio de alta qualidade, cifras dinâmicas e busca rápida.",
      icon: Music,
      status: "Disponível em Breve",
      color: "#9BE8D6",
      features: ["Playbacks Completos", "Cifras Dinâmicas", "Playlist de Favoritos"],
    },
    {
      id: "grupos",
      name: "Pequenos Grupos",
      description: "Fortaleça sua comunhão em células e pequenos grupos de estudo. Agende reuniões, compartilhe pedidos de oração e estudos.",
      icon: Users2,
      status: "Planejado",
      color: "#E07A5F",
      features: ["Calendário de Reuniões", "Mural de Pedidos", "Material de Apoio"],
    },
  ];

  const filteredUpdates = updates.filter(
    (u) => filterType === "ALL" || u.type === filterType
  );

  return (
    <div className="relative min-h-screen w-full bg-neutral-950 text-[#FBFBFB] flex flex-col justify-between overflow-x-hidden font-sans">
      
      {/* Navbar */}
      <Navbar user={user} />

      {/* Hero Header */}
      <section className="relative pt-32 pb-16 flex flex-col justify-center items-center text-center overflow-hidden z-10">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-[#336E72]/10 blur-[100px] rounded-full z-0 pointer-events-none" />
        
        <div className="relative z-10 w-full max-w-7xl mx-auto px-6 lg:px-8 space-y-4">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-3 py-1 bg-white/5 border border-white/10 rounded-full text-xs font-semibold text-[#9BE8D6]"
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>Ecossistema JiK Hub</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl md:text-5xl font-extrabold tracking-tight"
          >
            Aplicativos e <span className="bg-gradient-to-r from-[#9BE8D6] to-[#336E72] bg-clip-text text-transparent">Novidades</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-base text-[#FBFBFB]/70 max-w-2xl mx-auto leading-relaxed"
          >
            Acompanhe o desenvolvimento de nossas ferramentas feitas para auxiliar na sua caminhada cristã, comunhão e leitura diária.
          </motion.p>
        </div>
      </section>

      {/* Main Tabs Navigation */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 w-full">
        <div className="flex items-center justify-center border-b border-white/10 mb-12">
          <div className="flex gap-8">
            <TabButton
              active={activeTab === "apps"}
              onClick={() => setActiveTab("apps")}
              label="Aplicativos"
            />
            <TabButton
              active={activeTab === "noticias"}
              onClick={() => setActiveTab("noticias")}
              label="Notícias do Hub"
            />
            <TabButton
              active={activeTab === "updates"}
              onClick={() => setActiveTab("updates")}
              label="Notas de Atualização"
            />
          </div>
        </div>

        {/* Dynamic content rendering */}
        <AnimatePresence mode="wait">
          {activeTab === "apps" && (
            <motion.div
              key="apps-tab"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.4 }}
              className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-24"
            >
              {apps.map((app) => (
                <div
                  key={app.id}
                  className="group bg-[#131d1f]/40 border border-white/5 hover:border-white/12 rounded-3xl p-6 transition-all duration-300 shadow-md flex flex-col justify-between relative overflow-hidden"
                >
                  <div
                    className="absolute -top-16 -right-16 w-32 h-32 blur-[40px] rounded-full opacity-10 transition-opacity group-hover:opacity-20"
                    style={{ backgroundColor: app.color }}
                  />

                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div
                        className="w-12 h-12 rounded-2xl flex items-center justify-center"
                        style={{ backgroundColor: `${app.color}15`, color: app.color }}
                      >
                        <app.icon className="w-6 h-6" />
                      </div>
                      <span className="text-[10px] uppercase font-extrabold tracking-wider px-2.5 py-1 bg-white/5 border border-white/10 text-neutral-300 rounded-lg">
                        {app.status}
                      </span>
                    </div>

                    <div className="space-y-2">
                      <h3 className="text-xl font-bold text-white group-hover:text-[#9BE8D6] transition-colors">
                        {app.name}
                      </h3>
                      <p className="text-neutral-400 text-sm leading-relaxed">
                        {app.description}
                      </p>
                    </div>

                    <div className="space-y-2 pt-2">
                      <h4 className="text-xs font-bold text-[#FBFBFB]/50 uppercase tracking-widest">
                        Funcionalidades principais
                      </h4>
                      <ul className="space-y-1.5">
                        {app.features.map((feat, i) => (
                          <li key={i} className="text-xs text-[#FBFBFB]/80 flex items-center gap-2">
                            <span
                              className="w-1.5 h-1.5 rounded-full"
                              style={{ backgroundColor: app.color }}
                            />
                            {feat}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="mt-8 pt-4 border-t border-white/5">
                    <button className="flex items-center gap-1 text-xs font-bold text-[#9BE8D6] group-hover:text-white transition-colors cursor-pointer">
                      <span>Saiba mais e sugira recursos</span>
                      <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                    </button>
                  </div>
                </div>
              ))}
            </motion.div>
          )}

          {activeTab === "noticias" && (
            <motion.div
              key="news-tab"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.4 }}
              className="space-y-8 max-w-4xl mx-auto mb-24"
            >
              {news.length === 0 ? (
                <div className="bg-[#131d1f]/30 border border-white/5 rounded-3xl p-12 text-center">
                  <p className="text-neutral-500 text-sm">Nenhuma notícia oficial publicada ainda.</p>
                </div>
              ) : (
                news.map((item) => (
                  <article
                    key={item.id}
                    className="group bg-[#131d1f]/40 hover:bg-[#131d1f]/70 border border-white/5 hover:border-white/12 rounded-3xl p-6 transition-all duration-300 shadow-md flex flex-col md:flex-row gap-6 items-start relative overflow-hidden"
                  >
                    {item.imageUrl && (
                      <div className="w-full md:w-48 h-32 rounded-xl overflow-hidden shrink-0 bg-neutral-900 border border-white/10">
                        <img
                          src={item.imageUrl}
                          alt={item.title}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      </div>
                    )}
                    <div className="flex-1 space-y-3">
                      <div className="flex items-center gap-3 text-xs text-[#FBFBFB]/50 font-semibold">
                        <span className="flex items-center gap-1.5 text-[#9BE8D6]">
                          <TrendingUp className="w-3.5 h-3.5" /> Oficial JiK
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" />
                          {new Date(item.createdAt).toLocaleDateString("pt-BR", {
                            day: "2-digit",
                            month: "long",
                            year: "numeric",
                          })}
                        </span>
                      </div>

                      <div className="space-y-1.5">
                        <h3 className="text-xl font-bold text-white group-hover:text-[#9BE8D6] transition-colors leading-snug">
                          {item.title}
                        </h3>
                        <p className="text-neutral-400 text-sm leading-relaxed">
                          {item.summary}
                        </p>
                      </div>

                      {item.content && (
                        <div className="text-neutral-300 text-xs leading-relaxed pt-2 border-t border-white/5">
                          {item.content}
                        </div>
                      )}
                    </div>
                  </article>
                ))
              )}
            </motion.div>
          )}

          {activeTab === "updates" && (
            <motion.div
              key="updates-tab"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.4 }}
              className="space-y-8 max-w-4xl mx-auto mb-24"
            >
              {/* Filter pills */}
              <div className="flex flex-wrap gap-2.5 items-center justify-start mb-6">
                <FilterPill label="Todos" active={filterType === "ALL"} onClick={() => setFilterType("ALL")} />
                <FilterPill label="Novidades" active={filterType === "FEATURE"} onClick={() => setFilterType("FEATURE")} />
                <FilterPill label="Melhorias/Correções" active={filterType === "BUGFIX"} onClick={() => setFilterType("BUGFIX")} />
                <FilterPill label="Anúncios" active={filterType === "ANNOUNCEMENT"} onClick={() => setFilterType("ANNOUNCEMENT")} />
              </div>

              {filteredUpdates.length === 0 ? (
                <div className="bg-[#131d1f]/30 border border-white/5 rounded-3xl p-12 text-center">
                  <p className="text-neutral-500 text-sm">Nenhuma nota de atualização encontrada para este filtro.</p>
                </div>
              ) : (
                <div className="relative pl-6 border-l-2 border-white/10 space-y-12">
                  {filteredUpdates.map((upd) => (
                    <div key={upd.id} className="relative space-y-3">
                      {/* Timeline dot */}
                      <div className="absolute -left-[31px] top-1.5 w-4 h-4 rounded-full bg-neutral-950 border-2 border-[#9BE8D6] flex items-center justify-center" />

                      <div className="flex flex-wrap items-center gap-3 text-xs">
                        <span className="font-extrabold text-[#9BE8D6] uppercase tracking-wider text-[10px] bg-[#9BE8D6]/10 px-2 py-0.5 rounded border border-[#9BE8D6]/20">
                          {upd.appName}
                        </span>
                        {upd.version && (
                          <span className="font-semibold text-neutral-400">
                            {upd.version}
                          </span>
                        )}
                        <span>•</span>
                        <span className="text-[#FBFBFB]/50 flex items-center gap-1 font-semibold">
                          <Calendar className="w-3.5 h-3.5" />
                          {new Date(upd.createdAt).toLocaleDateString("pt-BR")}
                        </span>
                        <span>•</span>
                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                          upd.type === "FEATURE" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" :
                          upd.type === "BUGFIX" ? "bg-amber-500/10 text-amber-400 border border-amber-500/20" :
                          upd.type === "ANNOUNCEMENT" ? "bg-blue-500/10 text-blue-400 border border-blue-500/20" :
                          "bg-purple-500/10 text-purple-400 border border-purple-500/20"
                        }`}>
                          {upd.type === "FEATURE" ? "Novidade" :
                           upd.type === "BUGFIX" ? "Correção" :
                           upd.type === "ANNOUNCEMENT" ? "Anúncio" : "Lançamento"}
                        </span>
                      </div>

                      <div className="space-y-1">
                        <h4 className="text-lg font-bold text-white flex items-center gap-1.5">
                          {upd.title}
                        </h4>
                        <p className="text-neutral-400 text-sm leading-relaxed max-w-2xl whitespace-pre-line">
                          {upd.description}
                        </p>
                      </div>

                      <div className="flex items-center gap-2 pt-1 text-xs text-[#FBFBFB]/40 font-medium">
                        <User className="w-3.5 h-3.5" />
                        <span>Publicado por {upd.author.name || "Admin"}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/5 py-8 mt-12 bg-neutral-950">
        <div className="max-w-7xl mx-auto px-6 text-center text-xs text-neutral-500 space-y-2">
          <p>© {new Date().getFullYear()} JiK Ecosystem. Todos os direitos reservados.</p>
          <p>Feito com amor, fé e propósito para edificar a igreja.</p>
        </div>
      </footer>
    </div>
  );
}

function TabButton({
  active,
  onClick,
  label,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`relative pb-4 text-xs font-extrabold uppercase tracking-widest cursor-pointer transition-colors ${
        active ? "text-[#9BE8D6]" : "text-[#FBFBFB]/55 hover:text-white"
      }`}
    >
      {label}
      {active && (
        <motion.span
          layoutId="activeTabUnderline"
          className="absolute left-0 right-0 bottom-0 h-0.5 bg-[#9BE8D6]"
          transition={{ type: "spring", stiffness: 380, damping: 30 }}
        />
      )}
    </button>
  );
}

function FilterPill({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-xl text-xs font-semibold tracking-wide transition-all cursor-pointer ${
        active
          ? "bg-[#336E72] text-[#FBFBFB] shadow-sm border border-[#9BE8D6]/10"
          : "bg-white/5 text-[#FBFBFB]/60 hover:text-white border border-transparent"
      }`}
    >
      {label}
    </button>
  );
}
