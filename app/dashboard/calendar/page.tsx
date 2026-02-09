"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function CalendarPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [deadlines, setDeadlines] = useState<any[]>([]);

  useEffect(() => {
    const init = async () => {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { router.push("/login"); return; }
      try {
        const { data } = await supabase.from("opportunities").select("id, title, agency_name, response_deadline").eq("user_id", session.user.id).not("response_deadline", "is", null).gte("response_deadline", new Date().toISOString()).order("response_deadline", { ascending: true }).limit(30);
        setDeadlines(data || []);
      } catch {}
      setLoading(false);
    };
    init();
  }, [router]);

  function daysUntil(date: string) {
    const diff = Math.ceil((new Date(date).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    return diff;
  }

  function urgencyColor(days: number) {
    if (days <= 3) return "border-red-500 bg-red-500/10";
    if (days <= 7) return "border-yellow-500 bg-yellow-500/10";
    if (days <= 14) return "border-blue-500 bg-blue-500/10";
    return "border-slate-700 bg-slate-900";
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-400" /></div>;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8"><h1 className="text-3xl font-bold">Deadlines & Calendar</h1><p className="text-slate-400 mt-1">Upcoming opportunity response deadlines</p></div>
      {deadlines.length === 0 ? (
        <div className="text-center py-20 bg-slate-900 border border-slate-800 rounded-xl"><p className="text-slate-400 text-lg">No upcoming deadlines</p><p className="text-slate-500 mt-2">Save opportunities with response deadlines to see them here</p></div>
      ) : (
        <div className="space-y-3">
          {deadlines.map(d => {
            const days = daysUntil(d.response_deadline);
            return (
              <div key={d.id} className={`p-4 border-l-4 rounded-lg ${urgencyColor(days)}`}>
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-sm">{d.title}</h3>
                    <p className="text-xs text-slate-400 mt-1">{d.agency_name || "Agency not specified"}</p>
                  </div>
                  <div className="text-right">
                    <p className={`text-lg font-bold ${days <= 3 ? "text-red-400" : days <= 7 ? "text-yellow-400" : "text-slate-300"}`}>{days}d</p>
                    <p className="text-xs text-slate-500">{new Date(d.response_deadline).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
