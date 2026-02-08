"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

interface JobRun {
  id: string;
  job_name: string;
  status: string;
  created_at: string;
  finished_at?: string;
  error?: string;
}

export default function AdminPage() {
  const router = useRouter();
  const [stats, setStats] = useState<any>(null);
  const [jobRuns, setJobRuns] = useState<JobRun[]>([]);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState("");
  const [message, setMessage] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const API = process.env.NEXT_PUBLIC_API_URL || "";

  useEffect(() => {
    const init = async () => {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { router.push("/login"); return; }
      setToken(session.access_token);
      await Promise.all([fetchStats(session.access_token), fetchJobs(session.access_token)]);
      setLoading(false);
    };
    init();
  }, [router]);

  async function fetchStats(t: string) {
    try {
      const res = await fetch(`${API}/admin/stats`, { headers: { Authorization: `Bearer ${t}` } });
      if (res.ok) setStats(await res.json());
      else if (res.status === 403) { setMessage("Admin access required."); }
    } catch { /* empty */ }
  }

  async function fetchJobs(t: string) {
    try {
      const params = new URLSearchParams({ limit: "50" });
      if (statusFilter) params.set("status", statusFilter);
      const res = await fetch(`${API}/admin/job-runs?${params}`, { headers: { Authorization: `Bearer ${t}` } });
      if (res.ok) {
        const data = await res.json();
        setJobRuns(data.job_runs || []);
      }
    } catch { /* empty */ }
  }

  async function rerunJob(id: string) {
    try {
      const res = await fetch(`${API}/admin/job-runs/${id}/rerun`, { method: "POST", headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) { setMessage("Job rerun queued."); await fetchJobs(token); }
      else { setMessage("Failed to rerun job."); }
    } catch { setMessage("Error rerunning job."); }
  }

  const statusColor: Record<string, string> = {
    success: "bg-emerald-600/20 text-emerald-400",
    failed: "bg-red-600/20 text-red-400",
    running: "bg-blue-600/20 text-blue-400",
    queued: "bg-yellow-600/20 text-yellow-400",
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-400" /></div>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <p className="text-slate-400 mt-1">System monitoring and job management</p>
      </div>

      {message && <div className="mb-6 p-4 bg-slate-800 border border-slate-700 rounded-lg text-sm">{message}</div>}

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl text-center">
            <p className="text-2xl font-bold text-blue-400">{stats.users || 0}</p>
            <p className="text-sm text-slate-400">Users</p>
          </div>
          <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl text-center">
            <p className="text-2xl font-bold text-purple-400">{stats.proposals || 0}</p>
            <p className="text-sm text-slate-400">Proposals</p>
          </div>
          <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl text-center">
            <p className="text-2xl font-bold text-emerald-400">{stats.jobs?.success || 0}</p>
            <p className="text-sm text-slate-400">Jobs Succeeded</p>
          </div>
          <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl text-center">
            <p className="text-2xl font-bold text-red-400">{stats.jobs?.failed || 0}</p>
            <p className="text-sm text-slate-400">Jobs Failed</p>
          </div>
          <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl text-center">
            <p className="text-2xl font-bold text-yellow-400">{stats.jobs?.queued || 0}</p>
            <p className="text-sm text-slate-400">Queued</p>
          </div>
        </div>
      )}

      {/* Job Runs */}
      <div className="p-6 bg-slate-900 border border-slate-800 rounded-xl">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Job Runs</h2>
          <div className="flex gap-2">
            {["", "success", "failed", "running", "queued"].map((s) => (
              <button key={s} onClick={() => { setStatusFilter(s); }} className={`px-3 py-1 rounded text-xs font-medium ${statusFilter === s ? "bg-emerald-600 text-white" : "bg-slate-800 text-slate-400"}`}>{s || "All"}</button>
            ))}
          </div>
        </div>

        {jobRuns.length === 0 ? (
          <p className="text-slate-500 py-8 text-center">No job runs found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-700 text-slate-400">
                  <th className="text-left py-3 px-2">Job</th>
                  <th className="text-left py-3 px-2">Status</th>
                  <th className="text-left py-3 px-2">Started</th>
                  <th className="text-left py-3 px-2">Finished</th>
                  <th className="text-left py-3 px-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {jobRuns.map((j) => (
                  <tr key={j.id} className="border-b border-slate-800">
                    <td className="py-3 px-2 font-medium">{j.job_name}</td>
                    <td className="py-3 px-2"><span className={`px-2 py-1 text-xs rounded ${statusColor[j.status] || "bg-slate-700 text-slate-400"}`}>{j.status}</span></td>
                    <td className="py-3 px-2 text-slate-400">{new Date(j.created_at).toLocaleString()}</td>
                    <td className="py-3 px-2 text-slate-400">{j.finished_at ? new Date(j.finished_at).toLocaleString() : "-"}</td>
                    <td className="py-3 px-2">
                      {j.status === "failed" && (
                        <button onClick={() => rerunJob(j.id)} className="text-xs text-emerald-400 hover:text-emerald-300">Rerun</button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
