import React from "react";
import { SideNav } from "./SideNav";
import { TopBar } from "./TopBar";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <div className="w-60">
        <SideNav />
      </div>
      <div className="flex flex-1 flex-col">
        <TopBar />
        <main className="flex-1 bg-slate-950 p-6">{children}</main>
      </div>
    </div>
  );
}
