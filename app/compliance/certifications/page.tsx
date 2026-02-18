"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

interface Cert {
  id: string;
  cert_type: string;
  status: string;
  issue_date: string;
  expiry_date: string;
}

export default function ComplianceCertificationsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [certs, setCerts] = useState<Cert[]>([]);

  useEffect(() => {
    const init = async () => {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { router.push("/login"); return; }

      const { data } = await supabase.from("certifications").select("*").order("expiry_date", { ascending: true });
      if (data) setCerts(data as Cert[]);
      setLoading(false);
    };
    init();
  }, [router]);

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-400" /></div>;

  const REQUIRED_CERTS = [
    { type: "SAM.gov Registration", required: true, desc: "Required for all federal contractors. Must be active and renewed annually." },
    { type: "SDVOSB", required: false, desc: "Service-Disabled Veteran-Owned Small Business. Verified by SBA VetCert." },
    { type: "8(a) Business Development", required: false, desc: "SBA program for socially/economically disadvantaged businesses. 9-year term." },
    { type: "HUBZone", required: false, desc: "Historically Underutilized Business Zone certification from SBA." },
    { type: "WOSB/EDWOSB", required: false, desc: "Women-Owned Small Business. Certified through SBA or approved third party." },
    { type: "GSA Schedule", required: false, desc: "General Services Administration Multiple Award Schedule contract." },
    { type: "CMMC Level 2", required: false, desc: "Cybersecurity Maturity Model Certification for DoD contractors." },
  ];

  function getCertStatus(type: string) {
    const cert = certs.find(c => c.cert_type?.toLowerCase().includes(type.toLowerCase().split(" ")[0]));
    if (!cert) return { status: "missing", label: "Not Obtained", cert: null };
    const expiry = new Date(cert.expiry_date);
    const daysLeft = Math.floor((expiry.getTime() - Date.now()) / 86400000);
    if (daysLeft < 0) return { status: "expired", label: "Expired", cert };
    if (daysLeft < 60) return { status: "expiring", label: `Expires in ${daysLeft}d`, cert };
    return { status: "active", label: "Active", cert };
  }

  const statusStyle = (s: string) => s === "active" ? "bg-emerald-900/50 text-emerald-400" : s === "expiring" ? "bg-yellow-900/50 text-yellow-400" : s === "expired" ? "bg-red-900/50 text-red-400" : "bg-slate-700 text-slate-500";

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Compliance Certifications</h1>
          <p className="text-slate-400 mt-1">Track certification status for proposal compliance</p>
        </div>
        <button onClick={() => router.push("/certifications")} className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 text-sm font-medium">Manage Certifications</button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
        <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl text-center">
          <p className="text-2xl font-bold text-emerald-400">{REQUIRED_CERTS.filter(c => getCertStatus(c.type).status === "active").length}</p>
          <p className="text-xs text-slate-400">Active</p>
        </div>
        <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl text-center">
          <p className="text-2xl font-bold text-yellow-400">{REQUIRED_CERTS.filter(c => getCertStatus(c.type).status === "expiring").length}</p>
          <p className="text-xs text-slate-400">Expiring Soon</p>
        </div>
        <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl text-center">
          <p className="text-2xl font-bold text-red-400">{REQUIRED_CERTS.filter(c => getCertStatus(c.type).status === "expired").length}</p>
          <p className="text-xs text-slate-400">Expired</p>
        </div>
        <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl text-center">
          <p className="text-2xl font-bold text-slate-400">{REQUIRED_CERTS.filter(c => getCertStatus(c.type).status === "missing").length}</p>
          <p className="text-xs text-slate-400">Not Obtained</p>
        </div>
      </div>

      <div className="space-y-3">
        {REQUIRED_CERTS.map(c => {
          const s = getCertStatus(c.type);
          return (
            <div key={c.type} className="p-4 bg-slate-900 border border-slate-800 rounded-xl">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-sm">{c.type}</h3>
                  {c.required && <span className="text-[10px] px-1.5 py-0.5 bg-blue-900/50 text-blue-400 rounded">Required</span>}
                </div>
                <span className={`px-2 py-0.5 rounded text-xs font-medium ${statusStyle(s.status)}`}>{s.label}</span>
              </div>
              <p className="text-xs text-slate-400">{c.desc}</p>
              {s.cert && s.cert.expiry_date && (
                <p className="text-xs text-slate-500 mt-1">Expires: {new Date(s.cert.expiry_date).toLocaleDateString()}</p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
