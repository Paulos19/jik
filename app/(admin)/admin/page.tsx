import { prisma } from "@/lib/prisma";

export default async function AdminDashboard() {
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
    include: { author: { select: { name: true } }, category: { select: { name: true } } },
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-neutral-400 text-sm mt-1">Visão geral do JiK</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard label="Usuários" value={usersCount} icon="👥" />
        <StatCard label="Notícias" value={newsCount} icon="📰" />
        <StatCard label="Hub Updates" value={hubCount} icon="🚀" />
        <StatCard label="Posts" value={postsCount} icon="💬" />
        <StatCard label="Categorias" value={categoriesCount} icon="🏷️" />
      </div>

      {/* Recent Posts */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden">
        <div className="px-5 py-3 border-b border-neutral-800">
          <h2 className="font-semibold text-sm">Últimos posts do fórum</h2>
        </div>
        {recentPosts.length === 0 ? (
          <div className="px-5 py-8 text-center text-neutral-500 text-sm">
            Nenhum post ainda.
          </div>
        ) : (
          <div className="divide-y divide-neutral-800">
            {recentPosts.map((post) => (
              <div key={post.id} className="px-5 py-3 flex items-center justify-between">
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">{post.title}</p>
                  <p className="text-xs text-neutral-500">
                    por {post.author.name} em {post.category.name}
                  </p>
                </div>
                <div className="flex gap-2 shrink-0 ml-4">
                  {post.pinned && (
                    <span className="text-[10px] px-1.5 py-0.5 bg-amber-500/10 text-amber-400 rounded">
                      Fixado
                    </span>
                  )}
                  {!post.published && (
                    <span className="text-[10px] px-1.5 py-0.5 bg-red-500/10 text-red-400 rounded">
                      Oculto
                    </span>
                  )}
                  {post.locked && (
                    <span className="text-[10px] px-1.5 py-0.5 bg-neutral-500/10 text-neutral-400 rounded">
                      Trancado
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: number;
  icon: string;
}) {
  return (
    <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4 space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-xs text-neutral-500 font-medium">{label}</span>
        <span className="text-lg">{icon}</span>
      </div>
      <p className="text-2xl font-bold">{value}</p>
    </div>
  );
}
