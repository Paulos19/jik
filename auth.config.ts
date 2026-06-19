import type { NextAuthConfig } from "next-auth";

/**
 * Edge-compatible auth config (NO Prisma/pg imports).
 * Used in proxy.ts (middleware replacement in Next.js 16).
 */
export const authConfig = {
  session: { strategy: "jwt" as const },
  pages: {
    signIn: "/login",
  },
  providers: [], // Providers are added in auth.ts (server-only)
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as any).role ?? "USER";
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        (session.user as any).role = token.role as string;
      }
      return session;
    },
  },
} satisfies NextAuthConfig;
