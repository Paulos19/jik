import { prisma } from "@/lib/prisma";
import {
  togglePostPublished,
  togglePostPinned,
  togglePostLocked,
  deletePost,
} from "@/app/actions/admin";

export default async function ForumModerationPage() {
  const posts = await prisma.forumPost.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      author: { select: { name: true, email: true } },
      category: { select: { name: true } },
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Moderação do Fórum</h1>
        <p className="text-neutral-400 text-sm mt-1">
          Controle os posts dos usuários — fixar, trancar, ocultar ou excluir
        </p>
      </div>

      {posts.length === 0 ? (
        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-12 text-center">
          <p className="text-neutral-500">Nenhum post no fórum ainda.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {posts.map((post) => (
            <div
              key={post.id}
              className={`bg-neutral-900 border rounded-xl p-5 space-y-3 ${
                !post.published
                  ? "border-red-900/30 bg-red-950/10"
                  : "border-neutral-800"
              }`}
            >
              {/* Header */}
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs px-1.5 py-0.5 bg-neutral-800 text-neutral-400 rounded">
                      {post.category.name}
                    </span>
                    {post.pinned && (
                      <span className="text-[11px] px-1.5 py-0.5 bg-amber-500/10 text-amber-400 rounded font-medium">
                        📌 Fixado
                      </span>
                    )}
                    {post.locked && (
                      <span className="text-[11px] px-1.5 py-0.5 bg-neutral-500/10 text-neutral-400 rounded font-medium">
                        🔒 Trancado
                      </span>
                    )}
                    {!post.published && (
                      <span className="text-[11px] px-1.5 py-0.5 bg-red-500/10 text-red-400 rounded font-medium">
                        Oculto
                      </span>
                    )}
                  </div>
                  <h3 className="text-sm font-medium mt-1.5">{post.title}</h3>
                  <p className="text-xs text-neutral-500 mt-1 line-clamp-2">
                    {post.content}
                  </p>
                </div>
              </div>

              {/* Meta */}
              <div className="text-[11px] text-neutral-600">
                por {post.author.name} ({post.author.email}) •{" "}
                {new Date(post.createdAt).toLocaleDateString("pt-BR", {
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </div>

              {/* Actions */}
              <div className="flex gap-2 flex-wrap">
                <form
                  action={async () => {
                    "use server";
                    await togglePostPinned(post.id);
                  }}
                >
                  <button
                    type="submit"
                    className={`text-xs px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                      post.pinned
                        ? "bg-amber-900/30 text-amber-400 hover:bg-amber-900/50"
                        : "bg-neutral-800 hover:bg-neutral-700 text-neutral-300"
                    }`}
                  >
                    {post.pinned ? "Desafixar" : "📌 Fixar"}
                  </button>
                </form>

                <form
                  action={async () => {
                    "use server";
                    await togglePostLocked(post.id);
                  }}
                >
                  <button
                    type="submit"
                    className={`text-xs px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                      post.locked
                        ? "bg-neutral-600/30 text-neutral-300 hover:bg-neutral-600/50"
                        : "bg-neutral-800 hover:bg-neutral-700 text-neutral-300"
                    }`}
                  >
                    {post.locked ? "Destrancar" : "🔒 Trancar"}
                  </button>
                </form>

                <form
                  action={async () => {
                    "use server";
                    await togglePostPublished(post.id);
                  }}
                >
                  <button
                    type="submit"
                    className={`text-xs px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                      post.published
                        ? "bg-neutral-800 hover:bg-neutral-700 text-neutral-300"
                        : "bg-green-900/30 text-green-400 hover:bg-green-900/50"
                    }`}
                  >
                    {post.published ? "Ocultar" : "Tornar visível"}
                  </button>
                </form>

                <form
                  action={async () => {
                    "use server";
                    await deletePost(post.id);
                  }}
                >
                  <button
                    type="submit"
                    className="text-xs px-2.5 py-1 bg-red-900/30 hover:bg-red-900/50 text-red-400 rounded-md transition-colors cursor-pointer"
                  >
                    Excluir
                  </button>
                </form>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
