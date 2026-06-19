import { auth } from "@/auth";
import { redirect } from "next/navigation";

/**
 * Server-side admin guard.
 * Call in server components and server actions to verify ADMIN role.
 * Redirects to "/" if not admin, or returns the session.
 */
export async function requireAdmin() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  if ((session.user as any).role !== "ADMIN") {
    redirect("/");
  }

  return session;
}
