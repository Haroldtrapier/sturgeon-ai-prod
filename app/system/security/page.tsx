"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function SecurityPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [sessions, setSessions] = useState<{ id: string; device: string; ip: string; last_active: string; current: boolean }[]>([]);
  const [changingPassword, setChangingPassword] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState(false);

  useEffect(() => {
    const init = async () => {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { router.push("/login"); return; }

      setSessions([
        { id: "current", device: "Current Browser", ip: "—", last_active: new Date().toISOString(), current: true },
      ]);
      setLoading(false);
    };
    init();
  }, [router]);

  async function changePassword(e: React.FormEvent) {
    e.preventDefault();
    setPasswordError(null);
    setPasswordSuccess(false);

    if (newPassword.length < 8) { setPasswordError("Password must be at least 8 characters"); return; }
    if (newPassword !== confirmPassword) { setPasswordError("Passwords do not match"); return; }

    setChangingPassword(true);
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) { setPasswordError(error.message); }
    else { setPasswordSuccess(true); setNewPassword(""); setConfirmPassword(""); }
    setChangingPassword(false);
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-lime-500" /></div>;

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Security Settings</h1>
        <p className="text-stone-500 mt-1">Manage passwords, sessions, and security preferences</p>
      </div>

      <div className="space-y-6">
        <form onSubmit={changePassword} className="p-6 bg-white border border-stone-200 rounded-xl space-y-4">
          <h2 className="text-lg font-semibold">Change Password</h2>
          <div>
            <label className="block text-sm text-stone-500 mb-1">New Password</label>
            <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="Min 8 characters" className="w-full px-4 py-2 bg-stone-100 border border-stone-300 rounded-lg text-sm focus:ring-2 focus:ring-lime-500 focus:outline-none" />
          </div>
          <div>
            <label className="block text-sm text-stone-500 mb-1">Confirm Password</label>
            <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="Confirm new password" className="w-full px-4 py-2 bg-stone-100 border border-stone-300 rounded-lg text-sm focus:ring-2 focus:ring-lime-500 focus:outline-none" />
          </div>
          {passwordError && <p className="text-sm text-red-600">{passwordError}</p>}
          {passwordSuccess && <p className="text-sm text-lime-700">Password updated successfully</p>}
          <button type="submit" disabled={changingPassword} className="px-6 py-2 bg-lime-700 text-white rounded-lg hover:bg-lime-800 disabled:opacity-50 text-sm font-medium">
            {changingPassword ? "Updating..." : "Update Password"}
          </button>
        </form>

        <div className="p-6 bg-white border border-stone-200 rounded-xl">
          <h2 className="text-lg font-semibold mb-4">Two-Factor Authentication</h2>
          <p className="text-sm text-stone-500 mb-4">Add an extra layer of security to your account with 2FA.</p>
          <div className="flex items-center justify-between p-4 bg-stone-100 rounded-lg">
            <div>
              <p className="text-sm font-medium">Authenticator App</p>
              <p className="text-xs text-stone-500">Use Google Authenticator, Authy, or similar</p>
            </div>
            <span className="px-2 py-0.5 rounded text-xs font-medium bg-stone-200 text-stone-500">Not Configured</span>
          </div>
          <p className="text-xs text-stone-8000 mt-3">2FA setup is managed through your Supabase authentication provider.</p>
        </div>

        <div className="p-6 bg-white border border-stone-200 rounded-xl">
          <h2 className="text-lg font-semibold mb-4">Active Sessions</h2>
          <div className="space-y-3">
            {sessions.map(s => (
              <div key={s.id} className="flex items-center justify-between p-3 bg-stone-100 rounded-lg">
                <div>
                  <p className="text-sm font-medium">{s.device}</p>
                  <p className="text-xs text-stone-500">Last active: {new Date(s.last_active).toLocaleString()}</p>
                </div>
                {s.current ? (
                  <span className="px-2 py-0.5 rounded text-xs font-medium bg-lime-50 text-lime-700">Current</span>
                ) : (
                  <button className="px-3 py-1 bg-red-50 text-red-600 rounded text-xs hover:bg-red-50">Revoke</button>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="p-6 bg-white border border-red-900/50 rounded-xl">
          <h2 className="text-lg font-semibold text-red-600 mb-2">Danger Zone</h2>
          <p className="text-sm text-stone-500 mb-4">Permanently delete your account and all associated data.</p>
          <button onClick={() => router.push("/settings")} className="px-4 py-2 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm hover:bg-red-50">
            Delete Account
          </button>
        </div>
      </div>
    </div>
  );
}
