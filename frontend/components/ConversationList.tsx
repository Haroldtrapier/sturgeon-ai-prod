"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function ConversationList({ onSelect, selectedId }: { onSelect: (id: string) => void; selectedId?: string }) {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadConversations();
  }, []);

  async function loadConversations() {
    const { data } = await supabase
      .from("conversations")
      .select("id, title, created_at")
      .order("created_at", { ascending: false })
      .limit(20);
    
    setItems(data || []);
    setLoading(false);
  }

  if (loading) {
    return (
      <aside style={{ width: 240, borderRight: "1px solid #ddd", paddingRight: 16, height: "calc(100vh - 200px)", overflowY: "auto" }}>
        <h4 style={{ fontSize: 14, fontWeight: 600, marginBottom: 12 }}>Conversation History</h4>
        <p style={{ fontSize: 13, color: "#666" }}>Loading...</p>
      </aside>
    );
  }

  return (
    <aside style={{ width: 240, borderRight: "1px solid #ddd", paddingRight: 16, height: "calc(100vh - 200px)", overflowY: "auto" }}>
      <h4 style={{ fontSize: 14, fontWeight: 600, marginBottom: 12 }}>Conversation History</h4>
      
      {items.length === 0 ? (
        <p style={{ fontSize: 13, color: "#999" }}>No conversations yet. Start chatting to save history.</p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {items.map(c => (
            <div
              key={c.id}
              onClick={() => onSelect(c.id)}
              style={{
                cursor: "pointer",
                padding: 10,
                borderRadius: 6,
                backgroundColor: selectedId === c.id ? "#f0f0f0" : "transparent",
                border: selectedId === c.id ? "1px solid #ddd" : "1px solid transparent",
                fontSize: 13
              }}
            >
              <div style={{ fontWeight: 500, marginBottom: 4, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {c.title || "New conversation"}
              </div>
              <div style={{ fontSize: 11, color: "#999" }}>
                {new Date(c.created_at).toLocaleDateString()}
              </div>
            </div>
          ))}
        </div>
      )}
    </aside>
  );
}
