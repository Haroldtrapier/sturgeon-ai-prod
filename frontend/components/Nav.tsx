"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const items = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/agent", label: "Agent Console" },
  { href: "/opportunities", label: "Opportunities" },
  { href: "/proposals", label: "Proposals" },
  { href: "/compliance", label: "Compliance" }
];

export default function Nav() {
  const path = usePathname();

  return (
    <nav style={{ display: "flex", gap: 18, borderBottom: "1px solid #ddd", paddingBottom: 12, marginBottom: 24 }}>
      {items.map(i => (
        <Link
          key={i.href}
          href={i.href}
          style={{
            fontWeight: path.startsWith(i.href) ? 700 : 400,
            textDecoration: "none",
            color: path.startsWith(i.href) ? "#0070f3" : "inherit"
          }}
        >
          {i.label}
        </Link>
      ))}
      <span style={{ marginLeft: "auto" }}>
        <Link href="/settings" style={{ textDecoration: "none", color: "inherit" }}>Settings</Link>
      </span>
    </nav>
  );
}
