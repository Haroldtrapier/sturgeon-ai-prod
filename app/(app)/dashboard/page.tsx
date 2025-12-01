"use client";

import useSWR from "swr";
import { Card } from "@/components/ui/Card";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export default function DashboardPage() {
  const { data: wins } = useSWR("/api/wins", fetcher);
  const { data: opps } = useSWR("/api/opportunities/save", fetcher);
  const { data: profile } = useSWR("/api/profile", fetcher);

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold text-slate-50">Dashboard</h1>
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <div className="text-xs uppercase text-slate-400">Company</div>
          <div className="mt-1 text-sm text-slate-100">
            {profile?.profile?.companyName ?? "Set up your profile"}
          </div>
        </Card>
        <Card>
          <div className="text-xs uppercase text-slate-400">Saved Opps</div>
          <div className="mt-1 text-2xl font-semibold text-slate-50">
            {opps?.opportunities?.length ?? 0}
          </div>
        </Card>
        <Card>
          <div className="text-xs uppercase text-slate-400">Wins</div>
          <div className="mt-1 text-2xl font-semibold text-green-400">
            {wins?.wins?.length ?? 0}
          </div>
        </Card>
      </div>
      <Card>
        <div className="text-sm font-medium text-slate-100">
          Next steps
        </div>
        <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-300">
          <li>Complete your company profile (NAICS, PSC, certifications).</li>
          <li>Use ContractMatch to identify best-fit opportunities.</li>
          <li>Generate your first AI-assisted proposal.</li>
        </ul>
      </Card>
    </div>
  );
}
