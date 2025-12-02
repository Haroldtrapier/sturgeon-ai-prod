import { cookies } from "next/headers";

export interface User {
  id: string;
  email: string;
  name?: string;
}

/**
 * Get the current authenticated user from the request.
 * Returns null if the user is not authenticated.
 */
export async function getCurrentUser(): Promise<User | null> {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get("session-token")?.value;

  if (!sessionToken) {
    return null;
  }

  // In a real implementation, this would validate the session token
  // and fetch user data from a database or auth provider
  // For now, we decode a basic token format: userId:email:name
  try {
    const decoded = Buffer.from(sessionToken, "base64").toString("utf-8");
    const [id, email, name] = decoded.split(":");
    if (!id || !email) {
      return null;
    }
    return { id, email, name };
  } catch {
    return null;
  }
}
