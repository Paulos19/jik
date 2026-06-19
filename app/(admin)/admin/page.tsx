import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";
import Link from "next/link";
import {
  Users,
  Newspaper,
  Rocket,
  MessageSquare,
  Tags,
  Pin,
  Lock,
  EyeOff,
  ArrowRight,
  TrendingUp,
} from "lucide-react";

export default async function AdminDashboard() {
  await requireAdmin();

  const [usersCount, newsCount, hubCount, postsCount, categoriesCount] =
    await Promise.all([
      prisma.user.count(),
      prisma.newsCard.count(),
      prisma.hubUpdate.count(),
      prisma.forumPost.count(),
      prisma.forumCategory.count(),
    ]);

  const recentPosts = await prisma.forumPost.findMany({
    take: 5,
    orderBy: { createdAt: "desc" },
    include: {
      author: { select: { name: true, email: true } },
      category: { select: { name: true } },
    },
  });

  return (
    <div className="space-y-10 text-left">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-[#131d1f] to-[#0a0f10] border border-white/5 rounded-3xl p-8 shadow-lg">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#9BE8D6]/5 blur-[80px] rounded-full pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-[#336E72]/5 blur-[100px] rounded-full pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <h1 className="text-3xl font-extrabold tracking-tight text-white">
              Olá, Administrador
            </h1>
            <p className="text-neutral-400 text-xs leading-relaxed max-w-xl">
              Bem-vindo de volta ao painel de controle do JiK. Aqui você pode monitorar e gerenciar a comunidade, os aplicativos do Hub e as notícias oficiais do ecossistema.
            </p>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center gap-3 shrink-0">
            <TrendingUp className="w-8 h-8 text-[#9BE8D6]" />
            <div>
              <span className="text-[10px] uppercase font-extrabold text-neutral-500 tracking-wider">Status do Sistema</span>
              <p className="text-xs font-bold text-white mt-0.5">Operando 100% online</p>
            </div>
          </div>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="space-y-4">
        <h2 className="text-xs font-extrabold text-neutral-500 uppercase tracking-widest px-1">
          Métricas Principais
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <StatCard
            label="Usuários"
            value={usersCount}
            icon={Users}
            gradient="from-blue-500/10 to-[#9BE8D6]/10"
            iconColor="text-blue-400"
          />
          <StatCard
            label="Notícias"
            value={newsCount}
            icon={Newspaper}
            gradient="from-purple-500/10 to-indigo-500/10"
            iconColor="text-purple-400"
          />
          <StatCard
            label="Hub Updates"
            value={hubCount}
            icon={Rocket}
            gradient="from-[#336E72]/15 to-[#9BE8D6]/10"
            iconColor="text-[#9BE8D6]"
          />
          <StatCard
            label="Posts Fórum"
            value={postsCount}
            icon={MessageSquare}
            gradient="from-pink-500/10 to-rose-500/10"
            iconColor="text-pink-400"
          />
          <StatCard
            label="Categorias"
            value={categoriesCount}
            icon={Tags}
            gradient="from-amber-500/10 to-orange-500/10"
            iconColor="text-amber-400"
          />
        </div>
      </div>

      {/* Main Section Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Recent Posts List (2 Columns) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-xs font-extrabold text-neutral-500 uppercase tracking-widest">
              Últimas Atividades do Fórum
            </h2>
            <Link
              href="/admin/forum"
              className="text-[11px] font-bold text-[#9BE8D6] hover:underline flex items-center gap-1"
            >
              Moderar posts <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="bg-[#131d1f]/35 border border-white/5 rounded-3xl overflow-hidden">
            {recentPosts.length === 0 ? (
              <div className="px-6 py-12 text-center text-neutral-500 text-xs font-medium">
                Nenhum post publicado ainda.
              </div>
            ) : (
              <div className="divide-y divide-white/5">
                {recentPosts.map((post) => (
                  <div key={post.id} className="p-5 flex items-center justify-between gap-4 hover:bg-white/[0.01] transition-colors">
                    <div className="min-w-0 space-y-1.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[9px] px-2 py-0.5 bg-[#336E72]/15 border border-[#336E72]/20 text-[#9BE8D6] rounded-md font-bold uppercase tracking-wider">
                          {post.category.name}
                        </span>
                        <span className="text-[10px] text-neutral-500">
                          por {post.author.name || post.author.email}
                        </span>
                      </div>
                      <h3 className="text-sm font-bold text-white truncate max-w-lg">
                        {post.title}
                      </h3>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {post.pinned && (
                        <span
                          title="Post Fixado"
                          className="p-1.5 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-lg"
                        >
                          <Pin className="w-3.5 h-3.5" />
                        </span>
                      )}
                      {post.locked && (
                        <span
                          title="Post Trancado"
                          className="p-1.5 bg-neutral-800 text-neutral-400 border border-white/10 rounded-lg"
                        >
                          <Lock className="w-3.5 h-3.5" />
                        </span>
                      )}
                      {!post.published && (
                        <span
                          title="Post Oculto"
                          className="p-1.5 bg-red-500/10 text-red-400 border border-red-500/20 rounded-lg"
                        >
                          <EyeOff className="w-3.5 h-3.5" />
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right: Quick Links Widget (1 Column) */}
        <div className="space-y-4">
          <h2 className="text-xs font-extrabold text-neutral-500 uppercase tracking-widest px-1">
            Atalhos Rápidos
          </h2>

          <div className="bg-[#131d1f]/35 border border-white/5 rounded-3xl p-6 space-y-4">
            <QuickLink href="/admin/usuarios" title="Gerenciar Usuários" desc="Senhas, ativações e papéis" />
            <QuickLink href="/admin/noticias/novo" title="Escrever Notícia" desc="Comunicados para o ecossistema" />
            <QuickLink href="/admin/hub/novo" title="Publicar Atualização" desc="Notas de versão de aplicativos" />
            <QuickLink href="/admin/forum/categorias" title="Gerenciar Categorias" desc="Organize as abas do Fórum" />
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  icon: Icon,
  gradient,
  iconColor,
}: {
  label: string;
  value: number;
  icon: any;
  gradient: string;
  iconColor: string;
}) {
  return (
    <div className={`relative overflow-hidden bg-[#131d1f]/40 border border-white/5 rounded-2xl p-5 space-y-4 shadow-md`}>
      <div className="absolute top-0 right-0 w-24 h-24 bg-[#9BE8D6]/[0.02] blur-xl rounded-full" />
      <div className="flex items-center justify-between">
        <span className="text-[10px] text-neutral-500 font-extrabold uppercase tracking-wider">{label}</span>
        <div className={`p-2.5 rounded-xl bg-white/5 border border-white/10 ${iconColor}`}>
          <Icon className="w-4 h-4" />
        </div>
      </div>
      <div>
        <p className="text-3xl font-extrabold text-white tracking-tight">{value}</p>
      </div>
    </div>
  );
}

function QuickLink({ href, title, desc }: { href: string; title: string; desc: string }) {
  return (
    <Link
      href={href}
      className="group block p-3.5 bg-white/[0.02] hover:bg-[#336E72]/15 border border-white/5 hover:border-[#9BE8D6]/10 rounded-xl transition-all"
    >
      <div className="flex items-center justify-between">
        <h4 className="text-xs font-bold text-white group-hover:text-[#9BE8D6] transition-colors">{title}</h4>
        <ArrowRight className="w-3.5 h-3.5 text-neutral-500 group-hover:text-[#9BE8D6] group-hover:translate-x-0.5 transition-all" />
      </div>
      <p className="text-[10px] text-neutral-400 mt-1 leading-normal">{desc}</p>
    </Link>
  );
}
