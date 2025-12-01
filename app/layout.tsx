import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sturgeon AI – Government Contracting & Grants",
  description: "Sturgeon AI platform for government contracting and grants",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-950 text-slate-50">
        {children}
      </body>
    </html>
  );
}
