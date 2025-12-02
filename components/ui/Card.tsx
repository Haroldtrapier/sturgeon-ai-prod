import React from "react";

interface CardProps {
  children: React.ReactNode;
}

export function Card({ children }: CardProps) {
  return (
    <div className="rounded-lg border border-slate-700 bg-slate-800 p-6">
      {children}
    </div>
  );
}
