"use client";
import { supabase } from "@/lib/supabase";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function Settings() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    loadUser();
  }, []);

  async function loadUser() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push("/login");
      return;
    }
    setUser(user);
    setLoading(false);
  }

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.push("/login");
  }

  if (loading) return <main><p>Loading...</p></main>;

  return (
    <main>
      <h1 style={{ fontSize: 24, fontWeight: 600, marginBottom: 24 }}>Settings</h1>

      <section style={{ marginBottom: 32, paddingBottom: 32, borderBottom: "1px solid #ddd" }}>
        <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 16 }}>Account</h2>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div>
            <label style={{ fontSize: 13, fontWeight: 500, color: "#666", display: "block", marginBottom: 4 }}>Email</label>
            <p style={{ margin: 0, fontSize: 15 }}>{user?.email}</p>
          </div>
          <div>
            <label style={{ fontSize: 13, fontWeight: 500, color: "#666", display: "block", marginBottom: 4 }}>Plan</label>
            <p style={{ margin: 0, fontSize: 15, fontWeight: 600 }}>Free</p>
            <p style={{ margin: 0, fontSize: 13, color: "#666", marginTop: 4 }}>10 chats/day • 5 saved conversations • Basic agent</p>
          </div>
        </div>
      </section>

      <section style={{ marginBottom: 32, paddingBottom: 32, borderBottom: "1px solid #ddd" }}>
        <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 16 }}>Billing</h2>
        <p style={{ fontSize: 14, color: "#666", marginBottom: 12 }}>Upgrade to Pro for unlimited chats, all agents, and priority support.</p>
        <a
          href="/billing"
          style={{
            display: "inline-block",
            padding: "10px 20px",
            backgroundColor: "#0070f3",
            color: "white",
            textDecoration: "none",
            borderRadius: 6,
            fontSize: 14,
            fontWeight: 500
          }}
        >
          Upgrade to Pro
        </a>
      </section>

      <section>
        <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 16 }}>Danger Zone</h2>
        <button
          onClick={handleSignOut}
          style={{
            padding: "10px 20px",
            backgroundColor: "#dc3545",
            color: "white",
            border: "none",
            borderRadius: 6,
            fontSize: 14,
            fontWeight: 500,
            cursor: "pointer"
          }}
        >
          Sign Out
        </button>
      </section>
    </main>
  );
}
