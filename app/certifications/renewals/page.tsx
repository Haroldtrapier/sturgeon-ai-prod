"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function CertRenewalsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [certifications, setCertifications] = useState<any[]>([]);

  const RENEWAL_INFO = [
    { type: "SAM.gov Registration", frequency: "Annual", leadTime: "60 days before expiration", notes: "Must renew within 365 days or registration becomes inactive" },
    { type: "SDVOSB (VetCert)", frequency: "Every 3 years", leadTime: "90 days before", notes: "SBA may conduct unannounced program examinations" },
    { type: "8(a)", frequency: "Annual review", leadTime: "Ongoing", notes: "9-year program; annual reviews required; trigger events must be reported" },
    { type: "HUBZone", frequency: "Every 3 years", leadTime: "90 days before", notes: "Must recertify; employees must still reside in HUBZone" },
    { type: "WOSB/EDWOSB", frequency: "Every 3 years (SBA)", leadTime: "90 days before", notes: "Must maintain eligibility requirements continuously" },
    { type: "GSA Schedule", frequency: "Every 5 years (base) + options", leadTime: "6 months before", notes: "Requires current pricing, sales reporting, and option exercise" },
  ];

  useEffect(() => {
    const init = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/login"); return; }
      const { data } = await supabase.from("certifications").select("*").eq("user_id", user.id).order("expiration_date", { ascending: true });
      setCertifications(data || []);
      setLoading(false);
    };
    init();
  }, [router]);

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-400" /></div>;

  const upcoming = certifications.filter(c => c.expiration_date).map(c => ({ ...c, daysLeft: Math.ceil((new Date(c.expiration_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24)) }));

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8"><h1 className="text-3xl font-bold">Renewal Tracker</h1><p className="text-slate-400 mt-1">Track certification and registration renewal dates</p></div>
      {upcoming.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-3">Your Certifications</h2>
          <div className="space-y-3">{upcoming.map(c => (
            <div key={c.id} className={`p-4 bg-slate-900 border rounded-xl ${c.daysLeft <= 30 ? "border-red-600" : c.daysLeft <= 90 ? "border-amber-600" : "border-slate-800"}`}>
              <div className="flex items-center justify-between">
                <div><h3 className="font-medium">{c.type}</h3><p className="text-xs text-slate-400 mt-1">Expires: {new Date(c.expiration_date).toLocaleDateString()}</p></div>
                <span className={`text-sm font-bold ${c.daysLeft <= 30 ? "text-red-400" : c.daysLeft <= 90 ? "text-amber-400" : "text-emerald-400"}`}>{c.daysLeft > 0 ? `${c.daysLeft} days` : "EXPIRED"}</span>
              </div>
            </div>
          ))}</div>
        </div>
      )}
      <div>
        <h2 className="text-lg font-semibold mb-3">Renewal Schedule Reference</h2>
        <div className="space-y-3">{RENEWAL_INFO.map(r => (
          <div key={r.type} className="p-4 bg-slate-900 border border-slate-800 rounded-xl">
            <h3 className="font-semibold text-sm text-emerald-400">{r.type}</h3>
            <div className="grid grid-cols-3 gap-3 mt-2 text-xs text-slate-400">
              <div><span className="text-slate-500">Frequency:</span> {r.frequency}</div>
              <div><span className="text-slate-500">Lead Time:</span> {r.leadTime}</div>
              <div><span className="text-slate-500">Notes:</span> {r.notes}</div>
            </div>
          </div>
        ))}</div>
      </div>
    </div>
  );
}
