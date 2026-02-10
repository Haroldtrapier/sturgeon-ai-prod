"use client";

import { useEffect } from "react";

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error("Application error:", error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-red-400 mb-4">Something went wrong</h1>
        <p className="text-slate-400 mb-8 max-w-md">An unexpected error occurred. Please try again or contact support if the issue persists.</p>
        <div className="flex justify-center gap-3">
          <button onClick={reset} className="px-6 py-2.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 text-sm font-medium">Try Again</button>
          <a href="/dashboard" className="px-6 py-2.5 bg-slate-800 border border-slate-700 rounded-lg hover:bg-slate-700 text-sm">Dashboard</a>
        </div>
      </div>
    </div>
  );
}
