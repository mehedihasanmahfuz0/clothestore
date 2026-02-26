import { compareSync } from "bcrypt-ts-edge";
import type { NextAuthConfig } from "next-auth";
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { NextResponse } from "next/server";

import { prisma } from "@/db/prisma";
import { PrismaAdapter } from "@auth/prisma-adapter";

export const config = {
  pages: {
    signIn: "/sign-in",
    error: "/sign-in",
  },
  session: {
    strategy: "jwt",
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
    authorized({ request }: any) {
      // Check for session cart cookie
      if (!request.cookies.get("sessionCartId")) {
        // Generate a new session cart ID
        const sessionCartId = crypto.randomUUID();

        // Clone the request headers
        const newRequestHeaders = new Headers(request.headers);

        // Create a new response and add the new headers
        const response = NextResponse.next({
          request: {
            headers: newRequestHeaders,
          },
        });

        // Set the newly generated sessionCartId in the response cookies
        response.cookies.set("sessionCartId", sessionCartId);

        // Return the response with the sessionCartId set
        return response;
      }

      return true;
    },
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
        token.role = user.role ?? "user";

        if (user.name === "NO_NAME") {
          token.name = (user.email ?? "").split("@")[0];

          await prisma.user.update({
            where: { id: user.id as string },
            data: { name: token.name },
          });
        }
      }

      if (trigger === "update" && session?.user?.name) {
        token.name = session.user.name;
      }

      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = (token.id as string) ?? "";
        session.user.name = (token.name as string) ?? "";
        session.user.role = (token.role as string) ?? "user";
      }

      return session;
    },
  },
} satisfies NextAuthConfig;

export const { handlers, auth, signIn, signOut } = NextAuth(config);
