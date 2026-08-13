import { PrismaAdapter } from "@auth/prisma-adapter";
import NextAuth from "next-auth";
import type { NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import { z } from "zod";

const hasDatabase = Boolean(process.env.DATABASE_URL);
const googleConfigured = Boolean(process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET);
const devAuthEnabled = process.env.NODE_ENV !== "production" || process.env.ENABLE_DEV_AUTH === "true";

const providers: NextAuthConfig["providers"] = [
  Credentials({
    id: "development",
    name: "Development learner",
    credentials: { email: { label: "Email", type: "email" } },
    async authorize(rawCredentials) {
      if (!devAuthEnabled) return null;
      const result = z.object({ email: z.email() }).safeParse(rawCredentials);
      if (!result.success) return null;
      return { id: `dev-${result.data.email}`, email: result.data.email, name: "Demo Learner" };
    },
  }),
];

if (googleConfigured) providers.push(Google);

const config: NextAuthConfig = {
  adapter: hasDatabase ? PrismaAdapter((await import("@/lib/db/prisma")).prisma) : undefined,
  providers,
  pages: { signIn: "/signin" },
  secret: process.env.AUTH_SECRET ?? (process.env.NODE_ENV !== "production" ? "fde-learning-lab-development-secret" : undefined),
  session: { strategy: "jwt" },
  callbacks: {
    session({ session, token }) {
      if (session.user) session.user.id = token.sub ?? session.user.email ?? "anonymous";
      return session;
    },
  },
};

export const { auth, handlers, signIn, signOut } = NextAuth(config);
