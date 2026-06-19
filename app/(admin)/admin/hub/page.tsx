import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { deleteHubUpdate, togglePublishHubUpdate } from "@/app/actions/admin";

const typeLabels: Record<string, string> = {
  FEATURE: "Recurso",
  BUGFIX: "Correção",
  ANNOUNCEMENT: "Anúncio",
  RELEASE: "Lançamento",
};

const typeColors: Record<string, string> = {
  FEATURE: "bg-blue-500/10 text-blue-400",
  BUGFIX: "bg-orange-500/10 text-orange-400",
  ANNOUNCEMENT: "bg-purple-500/10 text-purple-400",
  RELEASE: "bg-green-500/10 text-green-400",
};

export default async function HubPage() {
  const updates = await prisma.hubUpdate.findMany({
    orderBy: { createdAt: "desc" },
    include: { author: { select: { name: true } } },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Hub Updates</h1>
          <p className="text-neutral-400 text-sm mt-1">
            Atualizações de aplicativos e produtos do ecossistema
          </p>
        </div>
        <Link
          href="/admin/hub/novo"
          className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg text-sm font-medium transition-colors"
        >
          + Novo update
        </Link>
      </div>

      {updates.length === 0 ? (
        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-12 text-center">
          <p className="text-neutral-500">Nenhum update criado ainda.</p>
          <Link
            href="/admin/hub/novo"
            className="text-blue-400 hover:text-blue-300 text-sm mt-2 inline-block"
          >
            Criar o primeiro
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {updates.map((item) => (
            <div
              key={item.id}
              className="bg-neutral-900 border border-neutral-800 rounded-xl p-5 space-y-3"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-semibold text-blue-400">
                      {item.appName}
                    </span>
                    {item.version && (
                      <span className="text-[11px] px-1.5 py-0.5 bg-neutral-800 text-neutral-400 rounded">
                        v{item.version}
                      </span>
                    )}
                    <span
                      className={`text-[11px] px-1.5 py-0.5 rounded font-medium ${
                        typeColors[item.type] || "bg-neutral-500/10 text-neutral-400"
                      }`}
                    >
                      {typeLabels[item.type] || item.type}
                    </span>
                    <span
                      className={`text-[11px] px-1.5 py-0.5 rounded-full font-medium ${
                        item.published
                          ? "bg-green-500/10 text-green-400"
                          : "bg-neutral-500/10 text-neutral-400"
                      }`}
                    >
                      {item.published ? "Publicado" : "Rascunho"}
                    </span>
                  </div>
                  <h3 className="text-sm font-medium mt-1">{item.title}</h3>
                  <p className="text-xs text-neutral-500 mt-1 line-clamp-2">
                    {item.description}
                  </p>
                </div>

                <div className="flex gap-2 shrink-0">
                  <form
                    action={async () => {
                      "use server";
                      await togglePublishHubUpdate(item.id);
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
                      await deleteHubUpdate(item.id);
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

              <div className="text-[11px] text-neutral-600">
                por {item.author.name} •{" "}
                {new Date(item.createdAt).toLocaleDateString("pt-BR")}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
