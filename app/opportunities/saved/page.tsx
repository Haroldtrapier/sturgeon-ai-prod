"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";

export default function SavedOpportunitiesPage() {
  const router = useRouter();
  const [opps, setOpps] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/login"); return; }
      const { data } = await supabase.from("opportunities").select("*").eq("user_id", user.id).order("created_at", { ascending: false });
      setOpps(data || []);
      setLoading(false);
    };
    init();
  }, [router]);

  async function removeOpp(id: string) {
    const supabase = createClient();
    await supabase.from("opportunities").delete().eq("id", id);
    setOpps(prev => prev.filter(o => o.id !== id));
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-lime-500" /></div>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <div><h1 className="text-3xl font-bold">Saved Opportunities</h1><p className="text-stone-500 mt-1">{opps.length} opportunities saved</p></div>
        <Link href="/opportunities" className="px-4 py-2 bg-lime-700 text-white rounded-lg hover:bg-lime-800 font-medium text-sm">Search More</Link>
      </div>
      {opps.length === 0 ? (
        <div className="text-center py-20 bg-white border border-stone-200 rounded-xl"><p className="text-stone-500 text-lg">No saved opportunities</p><p className="text-stone-8000 mt-2">Search and save opportunities to track them here</p></div>
      ) : (
        <div className="space-y-3">
          {opps.map(o => (
            <div key={o.id} className="p-4 bg-white border border-stone-200 rounded-xl flex items-center justify-between">
              <Link href={`/opportunities/${o.id}`} className="flex-1 min-w-0 hover:text-lime-700 transition-colors">
                <h3 className="font-medium text-sm truncate">{o.title}</h3>
                <div className="flex gap-3 mt-1 text-xs text-stone-500">
                  {o.agency_name && <span>{o.agency_name}</span>}
                  {o.naics_code && <span>NAICS: {o.naics_code}</span>}
                  {o.response_deadline && <span>Due: {new Date(o.response_deadline).toLocaleDateString()}</span>}
                </div>
              </Link>
              <button onClick={() => removeOpp(o.id)} className="ml-4 text-xs text-red-600 hover:text-red-700">Remove</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
