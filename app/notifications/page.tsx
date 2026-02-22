"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  read: boolean;
  created_at: string;
  data?: any;
}

export default function NotificationsPage() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState("");
  const [filter, setFilter] = useState<"all" | "unread">("all");
  const [message, setMessage] = useState("");

  const API = process.env.NEXT_PUBLIC_API_URL || "";

  useEffect(() => {
    const init = async () => {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { router.push("/login"); return; }
      setToken(session.access_token);
      await fetchNotifications(session.access_token);
    };
    init();
  }, [router]);

  async function fetchNotifications(t: string) {
    try {
      const res = await fetch(`${API}/api/notifications/?unread_only=${filter === "unread"}`, { headers: { Authorization: `Bearer ${t}` } });
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.notifications || []);
      }
    } catch { /* empty */ }
    setLoading(false);
  }

  async function markRead(id: string) {
    try {
      await fetch(`${API}/api/notifications/${id}/read`, { method: "PUT", headers: { Authorization: `Bearer ${token}` } });
      setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, read: true } : n));
    } catch { /* empty */ }
  }

  async function markAllRead() {
    try {
      await fetch(`${API}/api/notifications/read-all`, { method: "PUT", headers: { Authorization: `Bearer ${token}` } });
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setMessage("All notifications marked as read.");
    } catch { /* empty */ }
  }

  const typeIcon: Record<string, string> = {
    deadline: "clock", opportunity: "briefcase", compliance: "shield", proposal: "file-text", system: "bell",
  };

  const typeColor: Record<string, string> = {
    deadline: "text-yellow-600", opportunity: "text-blue-600", compliance: "text-purple-600", proposal: "text-lime-700", system: "text-stone-500",
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-lime-500" /></div>;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Notifications</h1>
          <p className="text-stone-500 mt-1">{unreadCount} unread notification{unreadCount !== 1 ? "s" : ""}</p>
        </div>
        {unreadCount > 0 && (
          <button onClick={markAllRead} className="px-4 py-2 bg-stone-100 text-stone-600 rounded-lg hover:bg-stone-200 text-sm font-medium">Mark All Read</button>
        )}
      </div>

      {message && <div className="mb-6 p-4 bg-stone-100 border border-stone-300 rounded-lg text-sm">{message}</div>}

      <div className="flex gap-2 mb-6">
        <button onClick={() => setFilter("all")} className={`px-3 py-1.5 rounded-lg text-sm font-medium ${filter === "all" ? "bg-lime-700 text-white" : "bg-stone-100 text-stone-500"}`}>All</button>
        <button onClick={() => setFilter("unread")} className={`px-3 py-1.5 rounded-lg text-sm font-medium ${filter === "unread" ? "bg-lime-700 text-white" : "bg-stone-100 text-stone-500"}`}>Unread ({unreadCount})</button>
      </div>

      {notifications.length === 0 ? (
        <div className="text-center py-20 bg-white border border-stone-200 rounded-xl">
          <p className="text-stone-500 text-lg">No notifications</p>
          <p className="text-stone-8000 mt-2">You're all caught up</p>
        </div>
      ) : (
        <div className="space-y-2">
          {notifications.filter((n) => filter === "all" || !n.read).map((n) => (
            <div key={n.id} onClick={() => !n.read && markRead(n.id)} className={`p-4 rounded-xl border cursor-pointer transition-colors ${n.read ? "bg-stone-100 border-stone-200" : "bg-white border-stone-300 hover:border-lime-600"}`}>
              <div className="flex items-start gap-4">
                <div className={`mt-1 w-2 h-2 rounded-full flex-shrink-0 ${n.read ? "bg-slate-600" : "bg-lime-600"}`} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h3 className={`font-medium text-sm ${n.read ? "text-stone-500" : "text-stone-700"}`}>{n.title}</h3>
                    <span className="text-xs text-stone-8000 flex-shrink-0 ml-4">{new Date(n.created_at).toLocaleDateString()}</span>
                  </div>
                  <p className={`text-sm mt-1 ${n.read ? "text-stone-8000" : "text-stone-600"}`}>{n.message}</p>
                  <span className={`text-xs mt-2 inline-block ${typeColor[n.type] || "text-stone-8000"}`}>{n.type}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
