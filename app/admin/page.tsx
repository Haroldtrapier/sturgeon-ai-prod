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
    success: "bg-lime-700/20 text-lime-700",
    failed: "bg-red-600/20 text-red-600",
    running: "bg-blue-600/20 text-blue-600",
    queued: "bg-yellow-600/20 text-yellow-600",
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-lime-500" /></div>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <p className="text-stone-500 mt-1">System monitoring and job management</p>
      </div>

      {message && <div className="mb-6 p-4 bg-stone-100 border border-stone-300 rounded-lg text-sm">{message}</div>}

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <div className="p-4 bg-white border border-stone-200 rounded-xl text-center">
            <p className="text-2xl font-bold text-blue-600">{stats.users || 0}</p>
            <p className="text-sm text-stone-500">Users</p>
          </div>
          <div className="p-4 bg-white border border-stone-200 rounded-xl text-center">
            <p className="text-2xl font-bold text-purple-600">{stats.proposals || 0}</p>
            <p className="text-sm text-stone-500">Proposals</p>
          </div>
          <div className="p-4 bg-white border border-stone-200 rounded-xl text-center">
            <p className="text-2xl font-bold text-lime-700">{stats.jobs?.success || 0}</p>
            <p className="text-sm text-stone-500">Jobs Succeeded</p>
          </div>
          <div className="p-4 bg-white border border-stone-200 rounded-xl text-center">
            <p className="text-2xl font-bold text-red-600">{stats.jobs?.failed || 0}</p>
            <p className="text-sm text-stone-500">Jobs Failed</p>
          </div>
          <div className="p-4 bg-white border border-stone-200 rounded-xl text-center">
            <p className="text-2xl font-bold text-yellow-600">{stats.jobs?.queued || 0}</p>
            <p className="text-sm text-stone-500">Queued</p>
          </div>
        </div>
      )}

      {/* Job Runs */}
      <div className="p-6 bg-white border border-stone-200 rounded-xl">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Job Runs</h2>
          <div className="flex gap-2">
            {["", "success", "failed", "running", "queued"].map((s) => (
              <button key={s} onClick={() => { setStatusFilter(s); }} className={`px-3 py-1 rounded text-xs font-medium ${statusFilter === s ? "bg-lime-700 text-white" : "bg-stone-100 text-stone-500"}`}>{s || "All"}</button>
            ))}
          </div>
        </div>

        {jobRuns.length === 0 ? (
          <p className="text-stone-8000 py-8 text-center">No job runs found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-stone-300 text-stone-500">
                  <th className="text-left py-3 px-2">Job</th>
                  <th className="text-left py-3 px-2">Status</th>
                  <th className="text-left py-3 px-2">Started</th>
                  <th className="text-left py-3 px-2">Finished</th>
                  <th className="text-left py-3 px-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {jobRuns.map((j) => (
                  <tr key={j.id} className="border-b border-stone-200">
                    <td className="py-3 px-2 font-medium">{j.job_name}</td>
                    <td className="py-3 px-2"><span className={`px-2 py-1 text-xs rounded ${statusColor[j.status] || "bg-stone-200 text-stone-500"}`}>{j.status}</span></td>
                    <td className="py-3 px-2 text-stone-500">{new Date(j.created_at).toLocaleString()}</td>
                    <td className="py-3 px-2 text-stone-500">{j.finished_at ? new Date(j.finished_at).toLocaleString() : "-"}</td>
                    <td className="py-3 px-2">
                      {j.status === "failed" && (
                        <button onClick={() => rerunJob(j.id)} className="text-xs text-lime-700 hover:text-lime-600">Rerun</button>
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
