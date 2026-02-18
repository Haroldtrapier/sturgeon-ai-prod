"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function SSOPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { router.push("/login"); return; }
      setLoading(false);
    };
    init();
  }, [router]);

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-400" /></div>;

  const SSO_PROVIDERS = [
    { id: "saml", name: "SAML 2.0", desc: "Enterprise SSO via SAML protocol. Compatible with Okta, Azure AD, OneLogin.", status: "available" },
    { id: "oidc", name: "OpenID Connect", desc: "Standard OIDC authentication. Compatible with Auth0, Keycloak, PingFederate.", status: "available" },
    { id: "azure_ad", name: "Azure Active Directory", desc: "Direct integration with Microsoft Azure AD / Entra ID.", status: "available" },
    { id: "okta", name: "Okta", desc: "Direct integration with Okta Identity Platform.", status: "available" },
    { id: "google_workspace", name: "Google Workspace", desc: "SSO via Google Workspace organizational accounts.", status: "configured" },
    { id: "github", name: "GitHub", desc: "SSO via GitHub organizational accounts.", status: "configured" },
  ];

  const statusBadge = (s: string) => {
    switch (s) {
      case "configured": return "bg-emerald-900/50 text-emerald-400";
      case "available": return "bg-slate-700 text-slate-400";
      default: return "bg-slate-700 text-slate-500";
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Single Sign-On (SSO)</h1>
        <p className="text-slate-400 mt-1">Configure enterprise SSO and identity provider integrations</p>
      </div>

      <div className="p-4 bg-blue-900/20 border border-blue-800 rounded-xl mb-6">
        <p className="text-sm text-blue-400">SAML and OIDC SSO configuration is available on Enterprise plans. Google and GitHub OAuth are available on all plans.</p>
      </div>

      <div className="space-y-3">
        {SSO_PROVIDERS.map(p => (
          <div key={p.id} className="p-5 bg-slate-900 border border-slate-800 rounded-xl">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold">{p.name}</h3>
              <span className={`px-2 py-0.5 rounded text-xs font-medium capitalize ${statusBadge(p.status)}`}>{p.status === "configured" ? "Active" : "Available"}</span>
            </div>
            <p className="text-sm text-slate-400 mb-3">{p.desc}</p>
            {p.status === "configured" ? (
              <div className="flex gap-2">
                <button className="px-3 py-1.5 bg-slate-800 border border-slate-700 rounded text-xs hover:bg-slate-700">Settings</button>
                <button className="px-3 py-1.5 bg-red-900/30 border border-red-800 text-red-400 rounded text-xs hover:bg-red-900/50">Disconnect</button>
              </div>
            ) : (
              <button className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-xs hover:bg-emerald-700 font-medium">
                Configure
              </button>
            )}
          </div>
        ))}
      </div>

      <div className="mt-6 p-6 bg-slate-900 border border-slate-800 rounded-xl">
        <h2 className="text-lg font-semibold mb-3">SAML Configuration</h2>
        <div className="space-y-3 text-sm">
          <div>
            <label className="block text-slate-400 mb-1">Entity ID / Issuer</label>
            <div className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg font-mono text-xs text-slate-300">https://app.sturgeon-ai.com/auth/saml/metadata</div>
          </div>
          <div>
            <label className="block text-slate-400 mb-1">ACS URL (Reply URL)</label>
            <div className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg font-mono text-xs text-slate-300">https://app.sturgeon-ai.com/auth/saml/acs</div>
          </div>
          <div>
            <label className="block text-slate-400 mb-1">SLO URL</label>
            <div className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg font-mono text-xs text-slate-300">https://app.sturgeon-ai.com/auth/saml/slo</div>
          </div>
        </div>
        <p className="text-xs text-slate-500 mt-3">Provide these URLs to your identity provider when configuring SAML SSO.</p>
      </div>
    </div>
  );
}
