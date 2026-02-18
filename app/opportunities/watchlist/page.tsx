"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function WatchlistPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [watchlist, setWatchlist] = useState<any[]>([]);

  useEffect(() => {
    const init = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/login"); return; }
      const { data } = await supabase.from("saved_opportunities").select("*").eq("user_id", user.id).eq("watchlist", true).order("created_at", { ascending: false });
      setWatchlist(data || []);
      setLoading(false);
    };
    init();
  }, [router]);

  async function removeFromWatchlist(id: string) {
    const supabase = createClient();
    await supabase.from("saved_opportunities").update({ watchlist: false }).eq("id", id);
    setWatchlist(prev => prev.filter(w => w.id !== id));
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-400" /></div>;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <div><h1 className="text-3xl font-bold">Watchlist</h1><p className="text-slate-400 mt-1">Track opportunities you&apos;re monitoring for updates</p></div>
        <span className="text-sm text-slate-400">{watchlist.length} items</span>
      </div>
      {watchlist.length > 0 ? (
        <div className="space-y-3">{watchlist.map(w => {
          const daysLeft = w.response_deadline ? Math.ceil((new Date(w.response_deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24)) : null;
          return (
            <div key={w.id} className="p-5 bg-slate-900 border border-slate-800 rounded-xl">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-medium cursor-pointer hover:text-emerald-400" onClick={() => w.opportunity_id && router.push(`/opportunities/${w.opportunity_id}`)}>{w.title || "Watched Opportunity"}</h3>
                  <div className="flex flex-wrap gap-3 mt-2 text-xs text-slate-400">
                    {w.agency && <span>{w.agency}</span>}
                    {w.naics_code && <span>NAICS: {w.naics_code}</span>}
                    {w.set_aside && <span className="text-amber-400">{w.set_aside}</span>}
                    {w.notice_id && <span>Notice: {w.notice_id}</span>}
                  </div>
                </div>
                <div className="flex items-center gap-3 ml-4">
                  {daysLeft !== null && <span className={`text-xs font-medium px-2 py-1 rounded ${daysLeft <= 3 ? "bg-red-900/30 text-red-400" : daysLeft <= 7 ? "bg-amber-900/30 text-amber-400" : "bg-emerald-900/30 text-emerald-400"}`}>{daysLeft > 0 ? `${daysLeft}d` : "Expired"}</span>}
                  <button onClick={() => removeFromWatchlist(w.id)} className="text-slate-500 hover:text-red-400 text-sm">Remove</button>
                </div>
              </div>
            </div>
          );
        })}</div>
      ) : (
        <div className="text-center py-16 bg-slate-900 border border-slate-800 rounded-xl">
          <p className="text-slate-400 mb-3">Your watchlist is empty</p>
          <button onClick={() => router.push("/opportunities")} className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm hover:bg-emerald-700">Browse Opportunities</button>
        </div>
      )}
    </div>
  );
}
