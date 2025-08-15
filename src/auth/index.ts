// src/auth/index.ts
import type { NextAuthOptions } from "next-auth";
import GitHubProvider from "next-auth/providers/github";
// import other providers as needed

export const authOptions: NextAuthOptions = {
  providers: [
    GitHubProvider({
      clientId: process.env.GITHUB_ID!,
      clientSecret: process.env.GITHUB_SECRET!,
    }),
  ],
};
