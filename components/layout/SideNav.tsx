import React from "react";

export function SideNav() {
  return (
    <nav className="h-screen bg-slate-900 border-r border-slate-700 p-4">
      <div className="flex flex-col h-full">
        <div className="mb-8">
          <h2 className="text-xl font-bold text-white">Sturgeon AI</h2>
        </div>
        <div className="flex-1">
          {/* Navigation items can be added here */}
        </div>
      </div>
    </nav>
  );
}
