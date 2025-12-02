import React from "react";

export const Card: React.FC<{ className?: string; children: React.ReactNode }> = ({
  className = "",
  children,
}) => (
  <div className={`rounded-xl border border-slate-800 bg-slate-900/60 p-4 ${className}`}>
    {children}
  </div>
);
