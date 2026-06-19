import { requireAdmin } from "@/lib/admin";
import Link from "next/link";
import { signOut } from "@/auth";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireAdmin();

  return (
    <div className="min-h-screen bg-neutral-950 text-white flex">
      {/* Sidebar */}
      <aside className="w-64 border-r border-neutral-800 bg-neutral-900/50 flex flex-col shrink-0">
        {/* Logo */}
        <div className="h-14 px-5 flex items-center border-b border-neutral-800">
          <Link href="/admin" className="text-lg font-bold tracking-tight">
            JiK <span className="text-xs font-normal text-neutral-500 ml-1">Admin</span>
          </Link>
        </div>

        {/* Nav */}
        <nav className="flex-1 py-4 px-3 space-y-1">
          <SidebarLink href="/admin" icon="📊" label="Dashboard" />
          <SidebarLink href="/admin/noticias" icon="📰" label="Notícias" />
          <SidebarLink href="/admin/hub" icon="🚀" label="Hub Updates" />

          <div className="pt-3 pb-1 px-3">
            <span className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider">
              Fórum
            </span>
          </div>
          <SidebarLink href="/admin/forum" icon="💬" label="Moderação" />
          <SidebarLink href="/admin/forum/categorias" icon="🏷️" label="Categorias" />
        </nav>

        {/* Footer */}
        <div className="border-t border-neutral-800 p-4 space-y-3">
          <div className="text-xs text-neutral-500 truncate">
            {session.user?.name} ({session.user?.email})
          </div>
          <div className="flex gap-2">
            <Link
              href="/"
              className="flex-1 text-center text-xs py-1.5 bg-neutral-800 hover:bg-neutral-700 rounded-lg transition-colors"
            >
              ← Voltar ao site
            </Link>
            <form
              action={async () => {
                "use server";
                await signOut({ redirectTo: "/" });
              }}
            >
              <button
                type="submit"
                className="text-xs py-1.5 px-3 bg-neutral-800 hover:bg-red-900/50 text-neutral-400 hover:text-red-400 rounded-lg transition-colors cursor-pointer"
              >
                Sair
              </button>
            </form>
          </div>
        </div>
      </aside>

      {/* Content */}
      <main className="flex-1 min-h-screen">
        <div className="max-w-5xl mx-auto px-6 py-8">{children}</div>
      </main>
    </div>
  );
}

function SidebarLink({
  href,
  icon,
  label,
}: {
  href: string;
  icon: string;
  label: string;
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 px-3 py-2 text-sm text-neutral-300 hover:text-white hover:bg-neutral-800/60 rounded-lg transition-colors"
    >
      <span className="text-base">{icon}</span>
      {label}
    </Link>
  );
}
