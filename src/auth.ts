import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { getDb } from "@/db";
import { users } from "@/db/schema";
import { isAdminEmail } from "@/lib/admin-emails";

export const googleEnabled =
  !!process.env.AUTH_GOOGLE_ID && !!process.env.AUTH_GOOGLE_SECRET;

export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  session: { strategy: "jwt" },
  pages: { signIn: "/conta" },
  providers: [
    Credentials({
      credentials: {
        email: { label: "E-mail", type: "email" },
        password: { label: "Senha", type: "password" },
      },
      authorize: async (creds) => {
        const email = String(creds?.email ?? "").toLowerCase().trim();
        const password = String(creds?.password ?? "");
        if (!email || !password) return null;

        const db = getDb();
        const [u] = await db.select().from(users).where(eq(users.email, email)).limit(1);
        if (!u || !u.passwordHash) return null;

        const ok = await bcrypt.compare(password, u.passwordHash);
        if (!ok) return null;

        return { id: u.id, name: u.name, email: u.email, image: u.image };
      },
    }),
    ...(googleEnabled
      ? [
          Google({
            clientId: process.env.AUTH_GOOGLE_ID!,
            clientSecret: process.env.AUTH_GOOGLE_SECRET!,
            allowDangerousEmailAccountLinking: true,
          }),
        ]
      : []),
  ],
  callbacks: {
    // Ao entrar com Google, garante que o usuário exista na nossa tabela.
    async signIn({ user, account }) {
      if (account?.provider === "google" && user.email) {
        const db = getDb();
        const email = user.email.toLowerCase();
        const [existing] = await db.select().from(users).where(eq(users.email, email)).limit(1);
        if (!existing) {
          await db.insert(users).values({
            name: user.name ?? null,
            email,
            image: user.image ?? null,
            provider: "google",
          });
        }
      }
      return true;
    },
    async jwt({ token, user }) {
      if (user?.id) token.uid = user.id;
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        if (token.uid) (session.user as { id?: string }).id = token.uid as string;
        (session.user as { isAdmin?: boolean }).isAdmin = isAdminEmail(session.user.email);
      }
      return session;
    },
  },
});
