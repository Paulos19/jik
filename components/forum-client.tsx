"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Pin,
  Heart,
  MessageSquare,
  Share2,
  Plus,
  X,
  MessageCircle,
  Image as ImageIcon,
  Trash2,
  Search,
  BookOpen,
  Send,
  AlertCircle,
  ShieldCheck,
  Megaphone,
} from "lucide-react";
import Navbar from "@/components/navbar";
import { createPostAction } from "@/app/actions/forum";
import { UploadButton } from "@/lib/uploadthing";

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
};

interface ForumClientProps {
  user?: UserProps | null;
  initialPosts: Post[];
  initialCategories: Category[];
  latestNews?: NewsItem | null;
}

export default function ForumClient({
  user,
  initialPosts,
  initialCategories,
  latestNews,
}: ForumClientProps) {
  const [posts, setPosts] = useState<Post[]>(initialPosts);
  const [categories] = useState<Category[]>(initialCategories);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortMethod, setSortMethod] = useState<"recent" | "pinned">("pinned");
  
  const [likedPosts, setLikedPosts] = useState<Record<string, boolean>>({});
  const [likeCounts, setLikeCounts] = useState<Record<string, number>>({});

  // Create Post Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(
    categories[0]?.id || ""
  );
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Filter & Sort Posts based on Category, Search query and Sort method
  const filteredPosts = posts
    .filter((post) => {
      const matchesCategory = !activeCategory || post.category.id === activeCategory;
      const matchesSearch =
        post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.content.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    })
    .sort((a, b) => {
      if (sortMethod === "pinned") {
        if (a.pinned && !b.pinned) return -1;
        if (!a.pinned && b.pinned) return 1;
      }
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

  // Handle Like Toggle
  const handleLike = (postId: string) => {
    const isLiked = !!likedPosts[postId];
    setLikedPosts((prev) => ({ ...prev, [postId]: !isLiked }));
    setLikeCounts((prev) => {
      const current = prev[postId] ?? Math.floor(Math.random() * 12) + 1;
      return { ...prev, [postId]: isLiked ? current - 1 : current + 1 };
    });
  };

  const getLikeCount = (postId: string) => {
    if (likeCounts[postId] !== undefined) return likeCounts[postId];
    return (postId.charCodeAt(0) % 15) + 3;
  };

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

  // Handle Create Post
  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !content || !selectedCategory) {
      setError("Por favor, preencha todos os campos.");
      return;
    }

    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append("title", title);
    formData.append("content", content);
    formData.append("categoryId", selectedCategory);
    if (imageUrl) {
      formData.append("imageUrl", imageUrl);
    }

    const result = await createPostAction(formData);

    setLoading(false);
    if (result?.error) {
      setError(result.error);
    } else if (result?.success && result.post) {
      const cat = categories.find((c) => c.id === selectedCategory);

      const newPost: Post = {
        id: result.post.id,
        title: result.post.title,
        content: result.post.content,
        imageUrl: result.post.imageUrl || null,
        published: result.post.published,
        pinned: result.post.pinned,
        locked: result.post.locked,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        author: {
          id: result.post.authorId,
          name: user?.name || "Usuário",
          image: user?.image || null,
        },
        category: {
          id: selectedCategory,
          name: cat?.name || "Geral",
          slug: cat?.slug || "geral",
          color: cat?.color || "#336E72",
        },
      };

      setPosts((prev) => [newPost, ...prev]);
      setTitle("");
      setContent("");
      setImageUrl(null);
      setIsModalOpen(false);
    }
  };

  const forumFilters = (
    <div className="space-y-4">
      {/* Search Input */}
      <div className="space-y-2">
        <h6 className="text-[10px] font-extrabold uppercase tracking-wider text-neutral-400">Pesquisar</h6>
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar postagens..."
            className="w-full bg-neutral-900 border border-white/10 rounded-xl pl-9 pr-4 py-2 text-xs text-white focus:border-[#9BE8D6] focus:outline-none"
          />
          <Search className="w-3.5 h-3.5 text-neutral-500 absolute left-3 top-2.5" />
        </div>
      </div>

      {/* Categories Select/List */}
      <div className="space-y-2">
        <h6 className="text-[10px] font-extrabold uppercase tracking-wider text-neutral-400">Filtrar Categoria</h6>
        <div className="flex flex-col gap-1.5">
          <button
            onClick={() => setActiveCategory(null)}
            className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold ${
              activeCategory === null
                ? "bg-[#336E72] text-[#FBFBFB]"
                : "bg-white/5 hover:bg-white/10 text-[#FBFBFB]/75"
            }`}
          >
            <span>Todos os posts</span>
            <span className="text-[9px] opacity-75">{posts.length}</span>
          </button>
          {categories.map((cat) => {
            const count = posts.filter((p) => p.category.id === cat.id).length;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold ${
                  activeCategory === cat.id
                    ? "bg-[#336E72] text-[#FBFBFB]"
                    : "bg-white/5 hover:bg-white/10 text-[#FBFBFB]/75"
                }`}
              >
                <div className="flex items-center gap-2">
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: cat.color || "#336E72" }}
                  />
                  <span>{cat.name}</span>
                </div>
                <span className="text-[9px] opacity-75">{count}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );

  return (
    <div className="relative min-h-screen w-full bg-neutral-950 text-[#FBFBFB] flex flex-col justify-between overflow-x-hidden font-sans">
      
      {/* Navbar */}
      <Navbar user={user} mobileFilters={forumFilters} />

      {/* ──────────────────────── BANNER DO ADMINISTRADOR ──────────────────────── */}
      <section className="relative z-10 w-full max-w-7xl mx-auto px-6 lg:px-8 pt-32 pb-4">
        {latestNews ? (
          <div className="relative w-full rounded-3xl overflow-hidden border border-white/10 bg-[#131d1f]/45 backdrop-blur-md p-6 md:p-10 shadow-2xl flex flex-col md:flex-row justify-between items-center gap-8 min-h-[220px]">
            {/* Banner Background glow */}
            <div className="absolute inset-0 bg-gradient-to-r from-neutral-950/90 via-neutral-950/40 to-transparent z-0" />
            {latestNews.imageUrl && (
              <div className="absolute inset-0 opacity-20 pointer-events-none z-0">
                <img
                  src={latestNews.imageUrl}
                  alt={latestNews.title}
                  className="w-full h-full object-cover filter blur-[3px]"
                />
              </div>
            )}
            
            <div className="relative z-10 flex-1 space-y-4 text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#9BE8D6]/10 border border-[#9BE8D6]/20 text-[#9BE8D6] rounded-full text-[10px] font-extrabold tracking-widest uppercase">
                <Megaphone className="w-3.5 h-3.5" />
                <span>Anúncio Oficial do Administrador</span>
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl md:text-3xl font-extrabold text-[#FBFBFB] leading-tight">
                  {latestNews.title}
                </h2>
                <p className="text-neutral-300 text-sm max-w-2xl leading-relaxed">
                  {latestNews.summary}
                </p>
              </div>
            </div>

            <div className="relative z-10 shrink-0">
              <a
                href="/aplicativos"
                className="px-6 py-3 bg-gradient-to-r from-[#9BE8D6] to-[#336E72] hover:opacity-90 text-[#FBFBFB] rounded-xl font-bold text-xs tracking-wider uppercase transition-all shadow-md inline-block text-center cursor-pointer"
              >
                Acessar Novidades
              </a>
            </div>
          </div>
        ) : (
          /* Default beautiful community banner */
          <div className="relative w-full rounded-3xl overflow-hidden border border-white/5 bg-gradient-to-r from-[#131d1f]/45 to-neutral-950/40 backdrop-blur-md p-8 md:p-12 shadow-2xl flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="absolute top-0 right-0 w-80 h-80 bg-[#336E72]/10 blur-[80px] rounded-full pointer-events-none" />
            <div className="space-y-3 flex-1 text-left">
              <h2 className="text-2xl md:text-3xl font-extrabold text-[#FBFBFB]">
                Comunidade JiK Fórum
              </h2>
              <p className="text-neutral-400 text-sm max-w-xl leading-relaxed">
                Um espaço seguro e acolhedor para compartilhar conquistas, debater ideias saudáveis sobre cooperação e crescer profissional e pessoalmente.
              </p>
            </div>
            <div className="shrink-0">
              <button
                onClick={() => {
                  if (!user) {
                    window.location.href = "/login";
                  } else {
                    setIsModalOpen(true);
                  }
                }}
                className="px-6 py-3.5 bg-gradient-to-r from-[#9BE8D6] to-[#336E72] hover:opacity-90 text-[#FBFBFB] rounded-xl font-bold text-xs tracking-wider uppercase transition-all shadow-md cursor-pointer"
              >
                Escrever Algo
              </button>
            </div>
          </div>
        )}
      </section>

      {/* ──────────────────────── MAIN FORUM CONTENT ──────────────────────── */}
      <section className="relative z-10 w-full bg-neutral-950 py-8">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          
          <div className="grid grid-cols-1 lg:grid-cols-10 gap-8 items-start">
            
            {/* Left/Middle Feed (7 Columns) */}
            <div className="lg:col-span-7 space-y-6">
              
              {/* ──────────────────────── FACEBOOK-STYLE QUICK POST BAR ──────────────────────── */}
              {user ? (
                <div className="bg-[#131d1f]/40 border border-white/10 rounded-2xl p-4 shadow-md flex items-center gap-4">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-[#9BE8D6] to-[#336E72] flex items-center justify-center text-xs font-bold text-neutral-900 overflow-hidden shrink-0">
                    {user.image ? (
                      <img src={user.image} alt={user.name || ""} className="w-full h-full object-cover" />
                    ) : (
                      user.name?.charAt(0).toUpperCase() || "U"
                    )}
                  </div>
                  
                  <button
                    onClick={() => setIsModalOpen(true)}
                    className="flex-1 bg-neutral-900/60 hover:bg-neutral-900 border border-white/5 hover:border-white/10 transition-all rounded-xl py-2.5 px-4 text-left text-neutral-400 text-xs sm:text-sm cursor-pointer"
                  >
                    No que você está pensando, {user.name?.split(" ")[0]}?
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setIsModalOpen(true);
                      }}
                      className="p-2 hover:bg-white/5 rounded-xl text-neutral-400 hover:text-[#9BE8D6] transition-colors cursor-pointer"
                      title="Anexar Imagem"
                    >
                      <ImageIcon className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="bg-[#131d1f]/20 border border-white/5 rounded-2xl p-4 text-center">
                  <p className="text-xs text-neutral-400">
                    Você precisa estar logado para iniciar um novo tópico.{" "}
                    <a href="/login" className="text-[#9BE8D6] hover:underline font-bold">
                      Fazer Login
                    </a>
                  </p>
                </div>
              )}

              {/* Feed Filters / Sorting */}
              <div className="flex items-center justify-between border-b border-white/5 pb-4">
                <span className="text-xs font-extrabold uppercase tracking-widest text-[#FBFBFB]/55">
                  Discussões
                </span>
                
                <div className="flex items-center gap-2 bg-neutral-900/60 border border-white/5 p-1 rounded-xl">
                  <button
                    onClick={() => setSortMethod("pinned")}
                    className={`px-3 py-1.5 rounded-lg text-[10px] font-extrabold uppercase tracking-wider transition-all ${
                      sortMethod === "pinned"
                        ? "bg-[#336E72] text-[#FBFBFB] shadow-sm"
                        : "text-[#FBFBFB]/60 hover:text-white"
                    }`}
                  >
                    Populares
                  </button>
                  <button
                    onClick={() => setSortMethod("recent")}
                    className={`px-3 py-1.5 rounded-lg text-[10px] font-extrabold uppercase tracking-wider transition-all ${
                      sortMethod === "recent"
                        ? "bg-[#336E72] text-[#FBFBFB] shadow-sm"
                        : "text-[#FBFBFB]/60 hover:text-white"
                    }`}
                  >
                    Recentes
                  </button>
                </div>
              </div>

              {/* Feed Post List */}
              <div className="space-y-4">
                {filteredPosts.length === 0 ? (
                  <div className="bg-[#131d1f]/20 border border-white/5 rounded-2xl p-12 text-center space-y-3">
                    <MessageCircle className="w-8 h-8 text-neutral-500 mx-auto" />
                    <h3 className="text-white font-bold text-sm">Nenhum tópico encontrado</h3>
                    <p className="text-neutral-500 text-xs">
                      Tente ajustar sua busca ou seja o primeiro a postar nesta categoria!
                    </p>
                  </div>
                ) : (
                  filteredPosts.map((post) => (
                    <motion.article
                      key={post.id}
                      layoutId={post.id}
                      className="group bg-[#131d1f]/40 hover:bg-[#131d1f]/75 border border-white/5 hover:border-white/10 rounded-2xl p-6 transition-all duration-300 shadow-md flex flex-col gap-4 relative overflow-hidden"
                    >
                      {/* Top Metadata */}
                      <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-[#FBFBFB]/55">
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-[#9BE8D6] to-[#336E72] flex items-center justify-center text-[10px] font-bold text-neutral-900 overflow-hidden shrink-0">
                              {post.author.image ? (
                                <img src={post.author.image} alt={post.author.name || ""} className="w-full h-full object-cover" />
                              ) : (
                                post.author.name?.charAt(0).toUpperCase() || "U"
                              )}
                            </div>
                            <span className="font-semibold text-[#FBFBFB]/80">
                              u/{post.author.name || "Membro"}
                            </span>
                          </div>

                          <span>•</span>
                          <span>{timeAgo(post.createdAt)}</span>

                          <span>•</span>
                          <div className="flex items-center gap-1.5">
                            <span
                              className="w-2.5 h-2.5 rounded-full"
                              style={{ backgroundColor: post.category.color || "#336E72" }}
                            />
                            <span className="font-bold text-[#FBFBFB]/80 text-[10px] tracking-wide uppercase">
                              c/{post.category.name}
                            </span>
                          </div>
                        </div>

                        {post.pinned && (
                          <div className="flex items-center gap-1 bg-[#9BE8D6]/10 text-[#9BE8D6] border border-[#9BE8D6]/20 px-2 py-0.5 rounded-md font-bold text-[9px] uppercase tracking-wider">
                            <Pin className="w-2.5 h-2.5 rotate-45" />
                            Fixado
                          </div>
                        )}
                      </div>

                      {/* Post Content */}
                      <div className="space-y-2">
                        <h3 className="text-lg font-bold text-white group-hover:text-[#9BE8D6] transition-colors leading-snug">
                          {post.title}
                        </h3>
                        <p className="text-[#FBFBFB]/75 text-sm leading-relaxed whitespace-pre-wrap">
                          {post.content}
                        </p>
                        {post.imageUrl && (
                          <div className="mt-3 overflow-hidden rounded-xl border border-white/10 max-h-[350px] w-full bg-neutral-950/40">
                            <img
                              src={post.imageUrl}
                              alt={post.title}
                              className="w-full h-full object-cover max-h-[350px] transition-transform hover:scale-[1.005] duration-500"
                            />
                          </div>
                        )}
                      </div>

                      {/* Actions row */}
                      <div className="flex items-center gap-6 pt-2 border-t border-white/5 text-[#FBFBFB]/60 text-xs">
                        <button
                          onClick={() => handleLike(post.id)}
                          className={`flex items-center gap-1.5 transition-colors font-semibold py-1.5 px-3 rounded-lg hover:bg-white/5 cursor-pointer ${
                            likedPosts[post.id] ? "text-red-400" : "hover:text-[#FBFBFB]"
                          }`}
                        >
                          <Heart className={`w-4 h-4 ${likedPosts[post.id] ? "fill-red-400" : ""}`} />
                          <span>{getLikeCount(post.id)}</span>
                        </button>

                        <button className="flex items-center gap-1.5 hover:text-white transition-colors font-semibold py-1.5 px-3 rounded-lg hover:bg-white/5 cursor-pointer">
                          <MessageSquare className="w-4 h-4" />
                          <span>{(post.title.length % 5) + 1} comentários</span>
                        </button>

                        <button className="flex items-center gap-1.5 hover:text-white transition-colors font-semibold py-1.5 px-3 rounded-lg hover:bg-white/5 cursor-pointer ml-auto">
                          <Share2 className="w-4 h-4" />
                          <span className="hidden sm:inline">Compartilhar</span>
                        </button>
                      </div>
                    </motion.article>
                  ))
                )}
              </div>
            </div>

            {/* Right: Sidebar widgets (3 Columns) */}
            <div className="lg:col-span-3 space-y-6">
              
              {/* Search Widget */}
              <div className="bg-[#131d1f]/40 border border-white/5 rounded-3xl p-6 shadow-md space-y-4">
                <h3 className="text-white font-bold text-sm">Pesquisar Fórum</h3>
                <div className="relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Buscar postagens..."
                    className="w-full bg-neutral-900 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white focus:border-[#9BE8D6] focus:outline-none transition-colors"
                  />
                  <Search className="w-4 h-4 text-neutral-500 absolute left-3.5 top-3" />
                </div>
              </div>

              {/* Categories Selector Widget */}
              <div className="bg-[#131d1f]/40 border border-white/5 rounded-3xl p-6 shadow-md">
                <h3 className="text-white font-bold text-sm mb-4">Filtrar por Categoria</h3>
                <div className="flex flex-col gap-2">
                  <button
                    onClick={() => setActiveCategory(null)}
                    className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                      activeCategory === null
                        ? "bg-[#336E72] text-[#FBFBFB]"
                        : "hover:bg-white/5 text-[#FBFBFB]/75"
                    }`}
                  >
                    <span>Todos os posts</span>
                    <span className="text-[10px] opacity-75">{posts.length}</span>
                  </button>
                  {categories.map((cat) => {
                    const count = posts.filter((p) => p.category.id === cat.id).length;
                    return (
                      <button
                        key={cat.id}
                        onClick={() => setActiveCategory(cat.id)}
                        className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                          activeCategory === cat.id
                            ? "bg-[#336E72] text-[#FBFBFB]"
                            : "hover:bg-white/5 text-[#FBFBFB]/75"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span
                            className="w-2.5 h-2.5 rounded-full"
                            style={{ backgroundColor: cat.color || "#336E72" }}
                          />
                          <span>{cat.name}</span>
                        </div>
                        <span className="text-[10px] opacity-75">{count}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Rules Widget */}
              <div className="bg-[#131d1f]/40 border border-white/5 rounded-3xl p-6 shadow-md space-y-4">
                <h3 className="text-white font-bold text-sm">Diretrizes JiK</h3>
                <ol className="space-y-3.5 text-xs text-[#FBFBFB]/75 leading-relaxed">
                  <li className="flex gap-2">
                    <span className="font-bold text-[#9BE8D6]">1.</span>
                    <span>Seja construtivo: Compartilhe ideias e conhecimentos que agreguem valor à comunidade.</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="font-bold text-[#9BE8D6]">2.</span>
                    <span>Respeito mútuo: Trate todos com cordialidade, empatia e paciência.</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="font-bold text-[#9BE8D6]">3.</span>
                    <span>Sem conteúdo ofensivo ou spam.</span>
                  </li>
                </ol>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/5 py-8 bg-neutral-950">
        <div className="max-w-7xl mx-auto px-6 text-center text-xs text-neutral-500 space-y-2">
          <p>© {new Date().getFullYear()} JiK Ecosystem. Todos os direitos reservados.</p>
          <p>Feito com dedicação, cooperação e propósito para integrar nossa comunidade.</p>
        </div>
      </footer>

      {/* ──────────────────────── MODAL DE CRIAÇÃO DE TÓPICO ──────────────────────── */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-[#0d1314] border border-white/10 rounded-3xl p-8 max-w-lg w-full z-10 shadow-2xl space-y-6"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold text-white">Criar Novo Tópico</h3>
                  <p className="text-neutral-400 text-xs mt-1">Inicie uma nova conversa no fórum</p>
                </div>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-1 rounded-lg hover:bg-white/5 text-neutral-400 hover:text-white transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {error && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-300 text-xs px-4 py-2.5 rounded-xl font-medium">
                  {error}
                </div>
              )}

              <form onSubmit={handleCreatePost} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-neutral-300 uppercase tracking-wider">Título</label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Escreva um título chamativo..."
                    className="w-full bg-neutral-900 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-[#9BE8D6] focus:outline-none transition-colors"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-neutral-300 uppercase tracking-wider">Categoria</label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full bg-neutral-900 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-[#9BE8D6] focus:outline-none transition-colors"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-neutral-300 uppercase tracking-wider">Conteúdo</label>
                  <textarea
                    required
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    rows={5}
                    placeholder="Compartilhe suas ideias aqui..."
                    className="w-full bg-neutral-900 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-[#9BE8D6] focus:outline-none transition-colors resize-none"
                  />
                </div>

                {/* Image Upload Area */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-neutral-300 uppercase tracking-wider flex items-center gap-1.5">
                    <ImageIcon className="w-3.5 h-3.5" /> Anexar Imagem (Opcional)
                  </label>

                  {imageUrl ? (
                    <div className="relative w-full h-32 rounded-xl overflow-hidden border border-white/10 bg-neutral-900 flex items-center justify-center">
                      <img src={imageUrl} alt="Preview do anexo" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => setImageUrl(null)}
                        className="absolute top-2 right-2 p-1.5 bg-black/60 hover:bg-black/85 text-red-400 hover:text-red-300 rounded-lg transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="uploadthing-custom-theme flex justify-start">
                      <UploadButton
                        endpoint="postImageUploader"
                        onClientUploadComplete={(res) => {
                          if (res && res[0]) {
                            setImageUrl(res[0].url);
                          }
                        }}
                        onUploadError={(error: Error) => {
                          setError(`Erro no upload: ${error.message}`);
                        }}
                        content={{
                          button({ ready }) {
                            if (ready) return "Escolher Imagem";
                            return "Carregando...";
                          },
                        }}
                        appearance={{
                          button:
                            "bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold px-4 py-2.5 rounded-xl cursor-pointer text-[#FBFBFB]/75 hover:text-white transition-colors focus-within:ring-2 focus-within:ring-[#9BE8D6] w-full flex justify-center items-center gap-2",
                          allowedContent: "hidden",
                        }}
                      />
                    </div>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 bg-gradient-to-r from-[#9BE8D6] to-[#336E72] disabled:opacity-50 text-[#FBFBFB] rounded-xl font-bold text-sm tracking-wider uppercase transition-all hover:opacity-90 cursor-pointer"
                >
                  {loading ? "Publicando..." : "Publicar no Fórum"}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
