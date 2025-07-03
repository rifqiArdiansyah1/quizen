import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { PrismaClient } from "@prisma/client";

import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user?: DefaultSession["user"] & { id: string };
  }
}

const prisma = new PrismaClient();

export const { handlers, auth, signOut } = NextAuth({
    adapter: PrismaAdapter(prisma),
    providers: [
        GitHub({
            clientId: "Ov23liIMX5lJRgcTyh7W",
            clientSecret: "6309681b0a63726008c2eba4c16e4680bbe4b8da",
        }),
    ],
    callbacks: {
        async session({ session, user }) {
            if (session.user) {
                session.user.id = user.id;
            }
            return session;
        },
    },
});