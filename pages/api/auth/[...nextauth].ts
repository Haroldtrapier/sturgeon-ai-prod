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
        // TODO: SECURITY - This is a basic example for demonstration purposes only.
        // In production, you MUST:
        // 1. Validate credentials against a secure database
        // 2. Use proper password hashing (bcrypt, argon2, etc.)
        // 3. Implement rate limiting
        // 4. Add proper error handling
        // 5. Consider using established auth providers (OAuth, SAML, etc.)
        if (credentials?.username && credentials?.password) {
          // WARNING: This accepts any credentials - DO NOT use in production
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
  // TODO: Add NEXTAUTH_SECRET environment variable for production
  // Generate with: openssl rand -base64 32
  secret: process.env.NEXTAUTH_SECRET,
};

export default NextAuth(authOptions);
