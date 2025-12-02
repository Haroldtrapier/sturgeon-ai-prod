"use client";

import { useSession, signOut } from "next-auth/react";
import { Button } from "@/components/ui/Button";

export default function DashboardPage() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950">
        <div className="text-slate-50">Loading...</div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950">
        <div className="text-slate-50">Access Denied</div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-950">
      <div className="w-full max-w-md rounded-xl border border-slate-800 bg-slate-900/80 p-6">
        <h1 className="mb-4 text-2xl font-bold text-slate-50">Dashboard</h1>
        <p className="mb-4 text-slate-400">
          Welcome, {session.user?.email || "User"}!
        </p>
        <Button onClick={() => signOut()} className="w-full">
          Sign Out
        </Button>
      </div>
    </div>
  );
}
