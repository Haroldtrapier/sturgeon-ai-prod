import React from "react";
import clsx from "clsx";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  className?: string;
  variant?: "primary" | "secondary";
}

export function Button({
  children,
  className,
  variant = "primary",
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      className={clsx(
        "rounded-md px-4 py-2 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2",
        {
          "bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500":
            variant === "primary" && !disabled,
          "bg-slate-700 text-slate-200 hover:bg-slate-600 focus:ring-slate-500":
            variant === "secondary" && !disabled,
          "cursor-not-allowed opacity-50": disabled,
        },
        className
      )}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
}
