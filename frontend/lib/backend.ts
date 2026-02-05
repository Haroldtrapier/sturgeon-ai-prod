export const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "";

export async function fetchAgents() {
  const r = await fetch(`${BACKEND_URL}/agents`, { cache: "no-store" });
  if (!r.ok) throw new Error(await r.text());
  return r.json();
}

export async function sendChat(message: string, agentId?: string) {
  const r = await fetch(`${BACKEND_URL}/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message, agentId: agentId || null, context: {} })
  });
  if (!r.ok) throw new Error(await r.text());
  return r.json();
}
