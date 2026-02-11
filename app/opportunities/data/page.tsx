"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function OpportunityDataPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const oppId = searchParams?.get("id");
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState("");
  const [opportunity, setOpportunity] = useState<Record<string, unknown> | null>(null);
  const API = process.env.NEXT_PUBLIC_API_URL || "";

  useEffect(() => {
    const init = async () => {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { router.push("/login"); return; }
      setToken(session.access_token);

      if (oppId) {
        const { data } = await supabase
          .from("opportunities")
          .select("*")
          .eq("id", oppId)
          .single();
        if (data) setOpportunity(data);
      }
      setLoading(false);
    };
    init();
  }, [router, oppId]);

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-400" /></div>;

  const FIELD_GROUPS = [
    {
      title: "Basic Information",
      fields: ["title", "notice_id", "solicitation_number", "type", "status"],
    },
    {
      title: "Agency & Location",
      fields: ["agency", "sub_agency", "office", "place_of_performance", "state"],
    },
    {
      title: "Classification",
      fields: ["naics_code", "naics_description", "set_aside", "product_service_code", "classification_code"],
    },
    {
      title: "Dates & Deadlines",
      fields: ["posted_date", "deadline", "response_deadline", "archive_date", "award_date"],
    },
    {
      title: "Financial",
      fields: ["estimated_value", "award_amount", "base_value", "option_value"],
    },
    {
      title: "Contact & Links",
      fields: ["point_of_contact", "email", "phone", "url", "sam_url"],
    },
  ];

  function formatValue(key: string, val: unknown): string {
    if (val === null || val === undefined) return "—";
    if (typeof val === "object") return JSON.stringify(val);
    if (key.includes("date") || key === "deadline") {
      try { return new Date(val as string).toLocaleString(); } catch { return String(val); }
    }
    if (key.includes("value") || key.includes("amount")) {
      const n = Number(val);
      return isNaN(n) ? String(val) : `$${n.toLocaleString()}`;
    }
    return String(val);
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Opportunity Data</h1>
        <p className="text-slate-400 mt-1">{opportunity ? (opportunity.title as string) : "Raw data view for opportunity records"}</p>
      </div>

      {!opportunity ? (
        <div className="p-12 bg-slate-900 border border-slate-800 rounded-xl text-center">
          <p className="text-slate-400 mb-2">No opportunity selected</p>
          <p className="text-xs text-slate-500 mb-4">Navigate here from an opportunity detail page to view raw data</p>
          <button onClick={() => router.push("/opportunities")} className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 text-sm">Browse Opportunities</button>
        </div>
      ) : (
        <>
          <div className="flex gap-2 mb-6">
            <button onClick={() => router.push(`/opportunities/${oppId}`)} className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm hover:bg-slate-700">Back to Details</button>
            <button onClick={() => router.push(`/opportunities/analysis?id=${oppId}`)} className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm hover:bg-emerald-700">AI Analysis</button>
            <button onClick={() => { navigator.clipboard.writeText(JSON.stringify(opportunity, null, 2)); }} className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm hover:bg-slate-700">Copy JSON</button>
          </div>

          {FIELD_GROUPS.map(group => {
            const hasData = group.fields.some(f => opportunity[f] !== null && opportunity[f] !== undefined);
            if (!hasData) return null;
            return (
              <div key={group.title} className="mb-6">
                <h2 className="text-sm font-semibold text-slate-400 mb-2">{group.title}</h2>
                <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
                  {group.fields.filter(f => opportunity[f] !== null && opportunity[f] !== undefined).map(field => (
                    <div key={field} className="flex border-b border-slate-800/50 last:border-0">
                      <div className="w-48 shrink-0 px-4 py-2.5 bg-slate-800/30 text-xs text-slate-400 font-mono">{field}</div>
                      <div className="flex-1 px-4 py-2.5 text-sm text-slate-300 break-all">{formatValue(field, opportunity[field])}</div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}

          <details className="mt-6">
            <summary className="text-sm text-slate-400 cursor-pointer hover:text-emerald-400">View Raw JSON</summary>
            <pre className="mt-2 p-4 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-400 overflow-x-auto">{JSON.stringify(opportunity, null, 2)}</pre>
          </details>
        </>
      )}
    </div>
  );
}
