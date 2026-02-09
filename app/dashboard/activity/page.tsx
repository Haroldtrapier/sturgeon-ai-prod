"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function ActivityPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [activities, setActivities] = useState<any[]>([]);

  useEffect(() => {
    const init = async () => {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { router.push("/login"); return; }
      try {
        const { data } = await supabase.from("analytics_events").select("*").eq("user_id", session.user.id).order("created_at", { ascending: false }).limit(50);
        setActivities(data || []);
      } catch {}
      setLoading(false);
    };
    init();
  }, [router]);

  const typeIcon: Record<string, string> = { search: "M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z", save: "M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z", create: "M12 4v16m8-8H4", chat: "M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" };
  const typeColor: Record<string, string> = { search: "text-blue-400", save: "text-emerald-400", create: "text-purple-400", chat: "text-amber-400" };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-400" /></div>;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8"><h1 className="text-3xl font-bold">Activity Feed</h1><p className="text-slate-400 mt-1">Your recent platform activity</p></div>
      {activities.length === 0 ? (
        <div className="text-center py-20 bg-slate-900 border border-slate-800 rounded-xl"><p className="text-slate-400 text-lg">No activity recorded yet</p><p className="text-slate-500 mt-2">Start searching for opportunities or chatting with AI agents</p></div>
      ) : (
        <div className="space-y-1">
          {activities.map((a, i) => (
            <div key={i} className="flex items-start gap-4 p-4 bg-slate-900 border border-slate-800 rounded-lg">
              <svg className={`w-5 h-5 mt-0.5 flex-shrink-0 ${typeColor[a.event_type] || "text-slate-400"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={typeIcon[a.event_type] || typeIcon.create} /></svg>
              <div className="flex-1 min-w-0">
                <p className="text-sm">{a.event_data?.description || a.event_type || "Activity"}</p>
                <p className="text-xs text-slate-500 mt-1">{new Date(a.created_at).toLocaleString()}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
