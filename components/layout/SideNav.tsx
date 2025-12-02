"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/proposals", label: "Proposals" },
  { href: "/contractmatch", label: "ContractMatch" },
  { href: "/documents", label: "Documents" },
  { href: "/capability", label: "Capability Statement" },
  { href: "/certifications", label: "Certifications" },
  { href: "/wins", label: "Wins" },
  { href: "/opportunities", label: "Saved Opps" },
  { href: "/alerts", label: "Alerts" },
  { href: "/marketplaces", label: "Marketplaces" },
  { href: "/billing", label: "Billing" },
  { href: "/settings", label: "Settings" },
];

export function SideNav() {
  const pathname = usePathname();
  return (
    <aside className="flex h-full flex-col border-r border-slate-800 bg-slate-950/60 p-4">
      <div className="mb-8 text-lg font-semibold tracking-tight">
        Sturgeon AI
      </div>
      <nav className="space-y-1 text-sm">
        {links.map((link) => {
          const active = pathname.startsWith(link.href);
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`block rounded-md px-3 py-2 ${
                active
                  ? "bg-blue-600 text-white"
                  : "text-slate-300 hover:bg-slate-800 hover:text-white"
              }`}
            >
              {link.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
