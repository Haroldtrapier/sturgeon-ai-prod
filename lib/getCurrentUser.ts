import { cookies } from "next/headers";
import { prisma } from "@/lib/db";

export interface CurrentUser {
  id: string;
  email: string;
  username: string | null;
  firstName: string | null;
  lastName: string | null;
}

export async function getCurrentUser(): Promise<CurrentUser | null> {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get("session_token")?.value;

  if (!sessionToken) {
    return null;
  }

  // In a production app, you would validate the session token
  // and fetch the user from the database based on the session
  // For now, we'll use a simple lookup by ID stored in the token
  try {
    const user = await prisma.user.findUnique({
      where: { id: sessionToken },
      select: {
        id: true,
        email: true,
        username: true,
        firstName: true,
        lastName: true,
      },
    });

    return user;
  } catch {
    return null;
  }
}
