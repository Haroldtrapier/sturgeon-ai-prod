"use client";

import { signOut } from "next-auth/react";
import { Button } from "../ui/Button";

export function TopBar() {
  return (
    <header className="flex items-center justify-between border-b border-slate-800 bg-slate-950/60 px-6 py-3">
      <div className="text-sm font-medium text-slate-200">
        Sturgeon AI – Government Contracting & Grants
      </div>
      <div className="flex items-center gap-3 text-sm text-slate-400">
        <Button variant="ghost" onClick={() => signOut()}>
          Sign out
        </Button>
      </div>
    </header>
  );
}
