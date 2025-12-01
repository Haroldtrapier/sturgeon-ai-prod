import { cookies } from "next/headers";
import { prisma } from "./db";

export interface User {
  id: string;
  email: string | null;
}

export async function getCurrentUser(): Promise<User | null> {
  const cookieStore = cookies();
  const sessionToken = cookieStore.get("session-token")?.value;

  if (!sessionToken) {
    return null;
  }

  try {
    const session = await prisma.session.findUnique({
      where: { sessionToken },
      include: { user: true },
    });

    if (!session || session.expires < new Date()) {
      return null;
    }

    return {
      id: session.user.id,
      email: session.user.email,
    };
  } catch {
    return null;
  }
}
