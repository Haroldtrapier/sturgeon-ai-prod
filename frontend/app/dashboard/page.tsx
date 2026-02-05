"use client";
import { supabase } from "@/lib/supabase";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function Dashboard() {
  const [user, setUser] = useState<any>(null);
  const [stats, setStats] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push("/login");
      return;
    }
    setUser(user);

    // Load stats
    const [convos, msgs] = await Promise.all([
      supabase.from("conversations").select("*", { count: "exact", head: true }),
      supabase.from("messages").select("*", { count: "exact", head: true })
    ]);

    setStats({
      conversations: convos.count || 0,
      messages: msgs.count || 0
    });
    setLoading(false);
  }

  if (loading) return <main><p>Loading dashboard...</p></main>;

  return (
    <main>
      <h1 style={{ fontSize: 24, fontWeight: 600, marginBottom: 8 }}>Dashboard</h1>
      <p style={{ color: "#666", marginBottom: 24 }}>Welcome back, {user?.email}</p>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 20, marginBottom: 32 }}>
        <Card title="Conversations" value={stats.conversations} subtitle="Total saved chats" />
        <Card title="Messages" value={stats.messages} subtitle="Total agent interactions" />
        <Card title="Plan" value="Free" subtitle="10 chats/day limit" />
      </div>

      <section style={{ marginTop: 32 }}>
        <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 12 }}>Quick Actions</h2>
        <div style={{ display: "flex", gap: 12 }}>
          <ActionButton href="/agent" label="Start Chat" />
          <ActionButton href="/opportunities" label="Find Opportunities" />
          <ActionButton href="/proposals" label="Create Proposal" />
        </div>
      </section>
    </main>
  );
}

function Card({ title, value, subtitle }: { title: string; value: number | string; subtitle: string }) {
  return (
    <div style={{ padding: 20, border: "1px solid #ddd", borderRadius: 8, backgroundColor: "#fafafa" }}>
      <h3 style={{ fontSize: 14, fontWeight: 500, color: "#666", marginBottom: 8 }}>{title}</h3>
      <p style={{ fontSize: 32, fontWeight: 700, margin: "8px 0" }}>{value}</p>
      <p style={{ fontSize: 12, color: "#999", margin: 0 }}>{subtitle}</p>
    </div>
  );
}

function ActionButton({ href, label }: { href: string; label: string }) {
  return (
    <a
      href={href}
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
      {label}
    </a>
  );
}
