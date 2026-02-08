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
      await fetch(`${API}/api/notifications/mark-all-read`, { method: "PUT", headers: { Authorization: `Bearer ${token}` } });
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setMessage("All notifications marked as read.");
    } catch { /* empty */ }
  }

  const typeIcon: Record<string, string> = {
    deadline: "clock", opportunity: "briefcase", compliance: "shield", proposal: "file-text", system: "bell",
  };

  const typeColor: Record<string, string> = {
    deadline: "text-yellow-400", opportunity: "text-blue-400", compliance: "text-purple-400", proposal: "text-emerald-400", system: "text-slate-400",
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-400" /></div>;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Notifications</h1>
          <p className="text-slate-400 mt-1">{unreadCount} unread notification{unreadCount !== 1 ? "s" : ""}</p>
        </div>
        {unreadCount > 0 && (
          <button onClick={markAllRead} className="px-4 py-2 bg-slate-800 text-slate-300 rounded-lg hover:bg-slate-700 text-sm font-medium">Mark All Read</button>
        )}
      </div>

      {message && <div className="mb-6 p-4 bg-slate-800 border border-slate-700 rounded-lg text-sm">{message}</div>}

      <div className="flex gap-2 mb-6">
        <button onClick={() => setFilter("all")} className={`px-3 py-1.5 rounded-lg text-sm font-medium ${filter === "all" ? "bg-emerald-600 text-white" : "bg-slate-800 text-slate-400"}`}>All</button>
        <button onClick={() => setFilter("unread")} className={`px-3 py-1.5 rounded-lg text-sm font-medium ${filter === "unread" ? "bg-emerald-600 text-white" : "bg-slate-800 text-slate-400"}`}>Unread ({unreadCount})</button>
      </div>

      {notifications.length === 0 ? (
        <div className="text-center py-20 bg-slate-900 border border-slate-800 rounded-xl">
          <p className="text-slate-400 text-lg">No notifications</p>
          <p className="text-slate-500 mt-2">You're all caught up</p>
        </div>
      ) : (
        <div className="space-y-2">
          {notifications.filter((n) => filter === "all" || !n.read).map((n) => (
            <div key={n.id} onClick={() => !n.read && markRead(n.id)} className={`p-4 rounded-xl border cursor-pointer transition-colors ${n.read ? "bg-slate-900/50 border-slate-800/50" : "bg-slate-900 border-slate-700 hover:border-emerald-600"}`}>
              <div className="flex items-start gap-4">
                <div className={`mt-1 w-2 h-2 rounded-full flex-shrink-0 ${n.read ? "bg-slate-600" : "bg-emerald-400"}`} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h3 className={`font-medium text-sm ${n.read ? "text-slate-400" : "text-slate-100"}`}>{n.title}</h3>
                    <span className="text-xs text-slate-500 flex-shrink-0 ml-4">{new Date(n.created_at).toLocaleDateString()}</span>
                  </div>
                  <p className={`text-sm mt-1 ${n.read ? "text-slate-500" : "text-slate-300"}`}>{n.message}</p>
                  <span className={`text-xs mt-2 inline-block ${typeColor[n.type] || "text-slate-500"}`}>{n.type}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
