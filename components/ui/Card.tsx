import React from "react";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export function Card({ className = "", children, ...props }: CardProps) {
  return (
    <div
      className={`rounded-lg border border-slate-700 bg-slate-800 p-6 shadow-lg ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
