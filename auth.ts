import { compareSync } from "bcrypt-ts-edge";
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { cookies } from "next/headers"; // ✅ NEW: needed for cart persistence
import { authConfig } from "./auth.config"; // ✅ NEW

import { prisma } from "@/db/prisma";
import { PrismaAdapter } from "@auth/prisma-adapter";

export const config = {
  trustHost: true,
  pages: {
    signIn: "/sign-in",
    error: "/sign-in",
  },
  session: {
    strategy: "jwt" as const, // ✅ NEW: literal type
    maxAge: 30 * 24 * 60 * 60,
  },
  adapter: PrismaAdapter(prisma),
  providers: [
    Credentials({
      credentials: {
        email: { type: "email" },
        password: { type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const user = await prisma.user.findFirst({
          where: {
            email: credentials.email as string,
          },
        });

        if (user && user.password) {
          const isMatch = compareSync(
            credentials.password as string,
            user.password,
          );

          if (isMatch) {
            return {
              id: user.id,
              name: user.name,
              email: user.email,
              role: user.role,
            };
          }
        }

        return null;
      },
    }),
  ],
  callbacks: {
    ...authConfig.callbacks, // ✅ NEW: authorized callback from auth.config

    async jwt({ token, user, trigger, session }: any) {
      if (user) {        token.id = user.id;
        token.role = user.role ?? "user";

        if (user.name === "NO_NAME") {
          token.name = (user.email ?? "").split("@")[0];

          await prisma.user.update({
            where: { id: user.id as string },
            data: { name: token.name },
          });
        }

        // ✅ NEW: Persist guest cart to user on sign in or sign up
        if (trigger === "signIn" || trigger === "signUp") {
          const cookiesObject = await cookies();
          const sessionCartId = cookiesObject.get("sessionCartId")?.value;

          if (sessionCartId) {
            const sessionCart = await prisma.cart.findFirst({
              where: { sessionCartId },
            });

            if (sessionCart) {
              // Delete any existing user cart first
              await prisma.cart.deleteMany({
                where: { userId: user.id },
              });

              // Assign the guest cart to the newly signed-in user
              await prisma.cart.update({
                where: { id: sessionCart.id },
                data: { userId: user.id },
              });
            }
          }
        }
      }

      if (trigger === "update" && session?.user?.name) {
        token.name = session.user.name;
      }

      return token;
    },

    async session({ session, token }: any) {
      if (token) {
        session.user.id = (token.id as string) ?? "";
        session.user.name = (token.name as string) ?? "";
        session.user.role = (token.role as string) ?? "user";
      }

      return session;
    },
  },
};

export const { handlers, auth, signIn, signOut } = NextAuth(config);
