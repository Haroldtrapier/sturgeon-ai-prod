import React from "react";
import { clsx } from "clsx";

type ButtonProps = {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  variant?: "primary" | "ghost";
  className?: string;
  type?: "button" | "submit" | "reset";
};

export function Button({
  children,
  onClick,
  disabled = false,
  variant = "primary",
  className,
  type = "button",
}: ButtonProps) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={clsx(
        "rounded-md px-4 py-2 text-sm font-medium transition-colors",
        "focus:outline-none focus:ring-2 focus:ring-offset-2",
        {
          "bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500":
            variant === "primary" && !disabled,
          "bg-transparent text-slate-400 hover:bg-slate-800 hover:text-slate-300":
            variant === "ghost" && !disabled,
          "cursor-not-allowed opacity-50": disabled,
        },
        className
      )}
    >
      {children}
    </button>
  );
}
