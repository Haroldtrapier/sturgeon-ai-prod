import NextAuth from "next-auth";
import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        // This is a basic example. In production, verify credentials against your database
        if (credentials?.username && credentials?.password) {
          return {
            id: "1",
            name: credentials.username,
            email: `${credentials.username}@example.com`,
          };
        }
        return null;
      }
    })
  ],
  pages: {
    signIn: "/auth/signin",
  },
  session: {
    strategy: "jwt",
  },
};

export default NextAuth(authOptions);
