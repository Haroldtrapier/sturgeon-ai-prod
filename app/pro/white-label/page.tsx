"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function WhiteLabelPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => { const init = async () => { const supabase = createClient(); const { data: { session } } = await supabase.auth.getSession(); if (!session) { router.push("/login"); return; } setLoading(false); }; init(); }, [router]);

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-400" /></div>;

  const FEATURES = [
    { title: "Custom Branding", desc: "Your logo, colors, and domain" },
    { title: "Custom Domain", desc: "app.yourcompany.com" },
    { title: "White-Labeled Emails", desc: "Notifications from your brand" },
    { title: "Custom AI Persona", desc: "Train agents with your content" },
    { title: "Client Management", desc: "Multi-tenant client dashboard" },
    { title: "Revenue Share", desc: "Resell at your own pricing" },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="text-center mb-12"><h1 className="text-3xl font-bold">White Label Solution</h1><p className="text-slate-400 mt-2">Offer Sturgeon AI under your own brand</p></div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {FEATURES.map(f => (
          <div key={f.title} className="p-5 bg-slate-900 border border-slate-800 rounded-xl">
            <h3 className="font-semibold text-sm text-emerald-400">{f.title}</h3>
            <p className="text-xs text-slate-400 mt-1">{f.desc}</p>
          </div>
        ))}
      </div>
      <div className="p-8 bg-slate-900 border border-emerald-800 rounded-xl text-center">
        <h2 className="text-xl font-bold mb-2">Enterprise White Label</h2>
        <p className="text-slate-400 mb-1">Starting at $397/month</p>
        <p className="text-sm text-slate-500 mb-6">Available on Enterprise plans. Includes custom branding, domain, and dedicated support.</p>
        <div className="flex justify-center gap-4">
          <button onClick={() => router.push("/support")} className="px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 font-medium">Contact Sales</button>
          <button onClick={() => router.push("/pro/pricing")} className="px-6 py-3 bg-slate-800 text-slate-300 rounded-lg hover:bg-slate-700">View Plans</button>
        </div>
      </div>
    </div>
  );
}
