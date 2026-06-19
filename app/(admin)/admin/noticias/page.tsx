import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { deleteNews, togglePublishNews } from "@/app/actions/admin";

export default async function NoticiasPage() {
  const news = await prisma.newsCard.findMany({
    orderBy: { createdAt: "desc" },
    include: { author: { select: { name: true } } },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Notícias</h1>
          <p className="text-neutral-400 text-sm mt-1">
            Gerencie os cards de notícia do hub
          </p>
        </div>
        <Link
          href="/admin/noticias/novo"
          className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg text-sm font-medium transition-colors"
        >
          + Nova notícia
        </Link>
      </div>

      {news.length === 0 ? (
        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-12 text-center">
          <p className="text-neutral-500">Nenhuma notícia criada ainda.</p>
          <Link
            href="/admin/noticias/novo"
            className="text-blue-400 hover:text-blue-300 text-sm mt-2 inline-block"
          >
            Criar a primeira
          </Link>
        </div>
      ) : (
        <div className="bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-neutral-800 text-left text-xs text-neutral-500 uppercase">
                <th className="px-5 py-3 font-medium">Título</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 font-medium">Autor</th>
                <th className="px-5 py-3 font-medium">Data</th>
                <th className="px-5 py-3 font-medium text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800">
              {news.map((item) => (
                <tr key={item.id} className="hover:bg-neutral-800/30">
                  <td className="px-5 py-3">
                    <p className="text-sm font-medium truncate max-w-xs">
                      {item.title}
                    </p>
                    <p className="text-xs text-neutral-500 truncate max-w-xs">
                      {item.summary}
                    </p>
                  </td>
                  <td className="px-5 py-3">
                    <span
                      className={`text-[11px] px-2 py-0.5 rounded-full font-medium ${
                        item.published
                          ? "bg-green-500/10 text-green-400"
                          : "bg-neutral-500/10 text-neutral-400"
                      }`}
                    >
                      {item.published ? "Publicado" : "Rascunho"}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-sm text-neutral-400">
                    {item.author.name}
                  </td>
                  <td className="px-5 py-3 text-sm text-neutral-500">
                    {new Date(item.createdAt).toLocaleDateString("pt-BR")}
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex justify-end gap-2">
                      <form
                        action={async () => {
                          "use server";
                          await togglePublishNews(item.id);
                        }}
                      >
                        <button
                          type="submit"
                          className="text-xs px-2.5 py-1 bg-neutral-800 hover:bg-neutral-700 rounded-md transition-colors cursor-pointer"
                        >
                          {item.published ? "Despublicar" : "Publicar"}
                        </button>
                      </form>
                      <form
                        action={async () => {
                          "use server";
                          await deleteNews(item.id);
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
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
