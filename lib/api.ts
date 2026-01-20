export const API_URL =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") || "";

export async function apiFetch<T>(
  path: string,
  options: RequestInit = {},
  authToken?: string
): Promise<T> {
  if (!API_URL) {
    throw new Error(
      "NEXT_PUBLIC_API_URL is not set. Add it to Vercel (Production + Preview) and to your local .env.local."
    );
  }

  const url = path.startsWith("http") 
    ? path 
    : `${API_URL}${path.startsWith("/") ? "" : "/"}${path}`;

  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };

  if (authToken) {
    headers["Authorization"] = `Bearer ${authToken}`;
  }

  const res = await fetch(url, {
    ...options,
    headers,
    cache: "no-store",
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`API ${res.status}: ${text || res.statusText}`);
  }

  return (await res.json()) as T;
}

export async function apiGet<T>(
  path: string,
  authToken?: string
): Promise<T> {
  return apiFetch<T>(path, { method: "GET" }, authToken);
}

export async function apiPost<T>(
  path: string,
  body?: unknown,
  authToken?: string
): Promise<T> {
  return apiFetch<T>(
    path,
    {
      method: "POST",
      body: body ? JSON.stringify(body) : undefined,
    },
    authToken
  );
}
