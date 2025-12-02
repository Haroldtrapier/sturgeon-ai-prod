import type { NextAuthOptions } from "next-auth";

export const authOptions: NextAuthOptions = {
  // Add authentication providers here (e.g., GitHub, Google, Credentials)
  providers: [],
  session: {
    strategy: "jwt",
  },
};
