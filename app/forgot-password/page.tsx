"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleReset(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const supabase = createClient();
    const { error: err } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/update-password`,
    });

    if (err) {
      setError(err.message);
      setLoading(false);
      return;
    }

    setSent(true);
    setLoading(false);
  }

  if (sent) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="max-w-sm w-full text-center">
          <h1 className="text-2xl font-bold text-lime-700 mb-2">Check Your Email</h1>
          <p className="text-stone-500 text-sm">We sent a password reset link to <strong className="text-white">{email}</strong>. Follow the link to reset your password.</p>
          <button onClick={() => router.push("/login")} className="mt-6 text-sm text-lime-700 hover:underline">Back to login</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="max-w-sm w-full">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-lime-700">Harpoon AI</h1>
          <p className="text-stone-500 mt-2 text-sm">Reset your password</p>
        </div>

        <form onSubmit={handleReset} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-stone-600 mb-1">Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="you@company.com" className="w-full px-4 py-3 bg-white border border-stone-300 rounded-lg focus:ring-2 focus:ring-lime-500 focus:outline-none text-sm" />
          </div>

          {error && <p className="text-sm text-red-600 bg-red-900/20 border border-red-200 rounded-lg px-3 py-2">{error}</p>}

          <button type="submit" disabled={loading} className="w-full py-3 bg-lime-700 text-white rounded-lg hover:bg-lime-800 disabled:opacity-50 font-medium text-sm">
            {loading ? "Sending..." : "Send Reset Link"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-stone-500">
          Remember your password? <button onClick={() => router.push("/login")} className="text-lime-700 hover:underline font-medium">Sign in</button>
        </p>
      </div>
    </div>
  );
}
