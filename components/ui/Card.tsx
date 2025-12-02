import React from "react";

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export function Card({ children, className = "" }: CardProps) {
  return (
    <div
      className={`rounded-lg bg-slate-800 p-6 shadow-lg ${className}`}
    >
      {children}
    </div>
  );
}
