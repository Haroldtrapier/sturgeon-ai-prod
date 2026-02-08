import '../styles/globals.css';
import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Sturgeon AI - Government Contracting Intelligence',
  description: 'AI-powered platform for government contract analysis, proposal generation, and opportunity matching',
};

const navItems = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/opportunities', label: 'Opportunities' },
  { href: '/proposals', label: 'Proposals' },
  { href: '/agents', label: 'AI Agents' },
  { href: '/marketplaces', label: 'Marketplaces' },
  { href: '/compliance', label: 'Compliance' },
  { href: '/market-intelligence', label: 'Market Intel' },
];

const moreItems = [
  { href: '/certifications', label: 'Certs' },
  { href: '/notifications', label: 'Alerts' },
  { href: '/settings', label: 'Settings' },
];

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-950 text-slate-50">
        <nav className="fixed top-0 left-0 right-0 z-50 bg-slate-900/95 backdrop-blur border-b border-slate-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <Link href="/dashboard" className="flex items-center gap-2">
                <span className="text-2xl">&#x1F41F;</span>
                <span className="text-xl font-bold text-emerald-400">Sturgeon AI</span>
              </Link>
              <div className="hidden md:flex items-center gap-4">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="text-sm text-slate-300 hover:text-emerald-400 transition-colors"
                  >
                    {item.label}
                  </Link>
                ))}
                <span className="w-px h-5 bg-slate-700" />
                {moreItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="text-xs text-slate-400 hover:text-emerald-400 transition-colors"
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </nav>
        <main className="pt-20 pb-8">
          {children}
        </main>
      </body>
    </html>
  );
}
