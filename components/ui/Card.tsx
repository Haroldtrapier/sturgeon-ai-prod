import React from "react";
import { clsx } from "clsx";

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export function Card({ children, className }: CardProps) {
  return (
    <div
      className={clsx(
        "rounded-lg border border-slate-800 bg-slate-900/50 p-6 shadow-lg backdrop-blur-sm",
        className
      )}
    >
      {children}
    </div>
  );
}
