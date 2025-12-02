import React from "react";

export function TopBar() {
  return (
    <header className="bg-slate-900 border-b border-slate-700 px-6 py-4">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold text-white">Dashboard</h1>
        <div className="flex items-center gap-4">
          {/* User menu or actions can be added here */}
        </div>
      </div>
    </header>
  );
}
