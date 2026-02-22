"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

interface Role {
  name: string;
  description: string;
  permissions: string[];
}

export default function PermissionsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [activeRole, setActiveRole] = useState("admin");

  useEffect(() => {
    const init = async () => {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { router.push("/login"); return; }
      setLoading(false);
    };
    init();
  }, [router]);

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-lime-500" /></div>;

  const ROLES: Role[] = [
    {
      name: "admin",
      description: "Full access to all features and settings",
      permissions: ["manage_users", "manage_billing", "manage_settings", "view_audit_log", "manage_integrations", "create_proposals", "edit_proposals", "delete_proposals", "search_opportunities", "manage_certifications", "view_analytics", "export_data", "manage_team", "api_access"],
    },
    {
      name: "manager",
      description: "Manage proposals and team, limited admin access",
      permissions: ["create_proposals", "edit_proposals", "delete_proposals", "search_opportunities", "manage_certifications", "view_analytics", "export_data", "manage_team"],
    },
    {
      name: "analyst",
      description: "Research and opportunity analysis, read-only proposals",
      permissions: ["search_opportunities", "view_analytics", "export_data", "create_proposals", "edit_proposals"],
    },
    {
      name: "viewer",
      description: "Read-only access to shared resources",
      permissions: ["search_opportunities", "view_analytics"],
    },
  ];

  const ALL_PERMISSIONS = [
    { key: "manage_users", label: "Manage Users", category: "Admin" },
    { key: "manage_billing", label: "Manage Billing", category: "Admin" },
    { key: "manage_settings", label: "Manage Settings", category: "Admin" },
    { key: "view_audit_log", label: "View Audit Log", category: "Admin" },
    { key: "manage_integrations", label: "Manage Integrations", category: "Admin" },
    { key: "create_proposals", label: "Create Proposals", category: "Proposals" },
    { key: "edit_proposals", label: "Edit Proposals", category: "Proposals" },
    { key: "delete_proposals", label: "Delete Proposals", category: "Proposals" },
    { key: "search_opportunities", label: "Search Opportunities", category: "Opportunities" },
    { key: "manage_certifications", label: "Manage Certifications", category: "Compliance" },
    { key: "view_analytics", label: "View Analytics", category: "Analytics" },
    { key: "export_data", label: "Export Data", category: "Analytics" },
    { key: "manage_team", label: "Manage Team", category: "Team" },
    { key: "api_access", label: "API Access", category: "System" },
  ];

  const active = ROLES.find(r => r.name === activeRole) || ROLES[0];
  const categories = [...Array.from(new Set(ALL_PERMISSIONS.map(p => p.category)))];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Permissions & Roles</h1>
        <p className="text-stone-500 mt-1">Manage role-based access control</p>
      </div>

      <div className="flex gap-2 mb-6">
        {ROLES.map(r => (
          <button key={r.name} onClick={() => setActiveRole(r.name)} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors capitalize ${activeRole === r.name ? "bg-lime-700 text-white" : "bg-stone-100 text-stone-500 hover:text-stone-900"}`}>
            {r.name}
          </button>
        ))}
      </div>

      <div className="mb-6 p-4 bg-white border border-stone-200 rounded-xl">
        <h2 className="font-semibold capitalize">{active.name} Role</h2>
        <p className="text-sm text-stone-500 mt-1">{active.description}</p>
        <p className="text-xs text-lime-700 mt-2">{active.permissions.length} of {ALL_PERMISSIONS.length} permissions enabled</p>
      </div>

      {categories.map(cat => (
        <div key={cat} className="mb-6">
          <h3 className="text-sm font-semibold text-stone-500 mb-2">{cat}</h3>
          <div className="space-y-2">
            {ALL_PERMISSIONS.filter(p => p.category === cat).map(p => (
              <div key={p.key} className="flex items-center justify-between p-3 bg-white border border-stone-200 rounded-lg">
                <span className="text-sm">{p.label}</span>
                <span className={`text-xs font-medium px-2 py-0.5 rounded ${active.permissions.includes(p.key) ? "bg-lime-50 text-lime-700" : "bg-stone-100 text-stone-8000"}`}>
                  {active.permissions.includes(p.key) ? "Enabled" : "Disabled"}
                </span>
              </div>
            ))}
          </div>
        </div>
      ))}

      <p className="text-xs text-stone-8000 mt-4">Custom roles are available on Enterprise plans. Contact sales to configure custom permission sets.</p>
    </div>
  );
}
