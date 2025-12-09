import React from "react";
import clsx from "clsx";

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export function Card({ children, className }: CardProps) {
  return (
    <div
      className={clsx(
        "rounded-lg border border-slate-800 bg-slate-900 p-4 shadow-sm",
        className
      )}
    >
      {children}
    </div>
  );
}
