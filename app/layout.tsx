import React from "react";
import "./globals.css";

export const metadata = {
  title: "Sturgeon AI",
  description: "Company profile settings",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-slate-900 text-slate-50">{children}</body>
    </html>
  );
}
