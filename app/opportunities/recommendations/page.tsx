"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

interface Recommendation {
  id: string;
  title: string;
  agency: string;
  match_score: number;
  reason: string;
  deadline: string;
  set_aside: string;
  estimated_value: string;
}

export default function RecommendationsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState("");
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [generating, setGenerating] = useState(false);
  const API = process.env.NEXT_PUBLIC_API_URL || "";

  useEffect(() => {
    const init = async () => {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { router.push("/login"); return; }
      setToken(session.access_token);

      // Load existing matched opportunities
      const { data } = await supabase
        .from("saved_opportunities")
        .select("*, opportunities(*)")
        .eq("user_id", session.user.id)
        .order("match_score", { ascending: false })
        .limit(20);

      if (data && data.length > 0) {
        setRecommendations(data.map(s => ({
          id: s.opportunities?.id || s.id,
          title: s.opportunities?.title || "Untitled",
          agency: s.opportunities?.agency || "",
          match_score: s.match_score || 0,
          reason: s.match_reason || "Profile match based on NAICS, certifications, and past performance",
          deadline: s.opportunities?.deadline || "",
          set_aside: s.opportunities?.set_aside || "",
          estimated_value: s.opportunities?.estimated_value || "",
        })));
      }
      setLoading(false);
    };
    init();
  }, [router]);

  async function generateRecommendations() {
    setGenerating(true);
    try {
      const res = await fetch(`${API}/api/opportunities/match`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({}),
      });
      if (res.ok) {
        const d = await res.json();
        if (d.matches) {
          setRecommendations(d.matches.map((m: Record<string, unknown>) => ({
            id: m.id || "",
            title: m.title || "Untitled",
            agency: m.agency || "",
            match_score: (m.match_score as number) || (m.score as number) || 0,
            reason: (m.reason as string) || "AI-recommended based on your profile",
            deadline: (m.deadline as string) || "",
            set_aside: (m.set_aside as string) || "",
            estimated_value: (m.estimated_value as string) || "",
          })));
        }
      }
    } catch {}
    setGenerating(false);
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-lime-500" /></div>;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">AI Recommendations</h1>
          <p className="text-stone-500 mt-1">Opportunities tailored to your capabilities</p>
        </div>
        <button onClick={generateRecommendations} disabled={generating} className="px-6 py-2.5 bg-lime-700 text-white rounded-lg hover:bg-lime-800 disabled:opacity-50 font-medium text-sm">
          {generating ? "Generating..." : "Refresh Recommendations"}
        </button>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="p-4 bg-white border border-stone-200 rounded-xl text-center">
          <p className="text-2xl font-bold text-lime-700">{recommendations.length}</p>
          <p className="text-xs text-stone-500">Recommendations</p>
        </div>
        <div className="p-4 bg-white border border-stone-200 rounded-xl text-center">
          <p className="text-2xl font-bold text-blue-600">{recommendations.filter(r => r.match_score >= 80).length}</p>
          <p className="text-xs text-stone-500">High Match (80%+)</p>
        </div>
        <div className="p-4 bg-white border border-stone-200 rounded-xl text-center">
          <p className="text-2xl font-bold text-purple-600">{recommendations.length > 0 ? `${Math.round(recommendations.reduce((s, r) => s + r.match_score, 0) / recommendations.length)}%` : "—"}</p>
          <p className="text-xs text-stone-500">Avg Match Score</p>
        </div>
      </div>

      {recommendations.length === 0 ? (
        <div className="p-12 bg-white border border-stone-200 rounded-xl text-center">
          <p className="text-stone-500 mb-2">No recommendations yet</p>
          <p className="text-xs text-stone-8000 mb-4">Click &quot;Refresh Recommendations&quot; to run the ContractMatch engine against your profile</p>
          <button onClick={() => router.push("/profile")} className="px-4 py-2 bg-stone-100 rounded-lg text-sm hover:bg-stone-200">Complete Your Profile</button>
        </div>
      ) : (
        <div className="space-y-3">
          {recommendations.map(r => (
            <div key={r.id} className="p-4 bg-white border border-stone-200 rounded-xl hover:border-lime-200 transition-colors">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-sm flex-1 mr-4">{r.title}</h3>
                <div className={`px-2.5 py-1 rounded-lg text-xs font-bold ${r.match_score >= 80 ? "bg-lime-50 text-lime-700" : r.match_score >= 60 ? "bg-yellow-50 text-yellow-600" : "bg-stone-200 text-stone-500"}`}>
                  {r.match_score}% match
                </div>
              </div>
              <p className="text-xs text-stone-500 mb-2">{r.reason}</p>
              <div className="flex items-center gap-4 text-xs text-stone-8000">
                {r.agency && <span>{r.agency}</span>}
                {r.set_aside && <span className="px-1.5 py-0.5 bg-stone-100 rounded">{r.set_aside}</span>}
                {r.deadline && <span>Due: {new Date(r.deadline).toLocaleDateString()}</span>}
                {r.estimated_value && <span>${Number(r.estimated_value).toLocaleString()}</span>}
              </div>
              <div className="flex gap-2 mt-3">
                <button onClick={() => router.push(`/opportunities/${r.id}`)} className="px-3 py-1.5 bg-lime-700 text-white rounded text-xs hover:bg-lime-800">View Details</button>
                <button onClick={() => router.push(`/opportunities/analysis?id=${r.id}`)} className="px-3 py-1.5 bg-stone-100 border border-stone-300 rounded text-xs hover:bg-stone-200">Analyze</button>
                <button onClick={() => router.push(`/proposals/create?opportunity_id=${r.id}`)} className="px-3 py-1.5 bg-stone-100 border border-stone-300 rounded text-xs hover:bg-stone-200">Start Proposal</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
