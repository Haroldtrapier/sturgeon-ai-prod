import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { getSupabaseClient } from '../lib/supabase-client';

type User = {
  id: string;
  email: string;
  full_name?: string;
  created_at: string;
  email_confirmed_at?: string;
};

type DashboardStats = {
  savedOpportunities: number;
  proposals: number;
  certifications: number;
  unreadNotifications: number;
};

const TOOLS = [
  { href: '/opportunities', label: 'Opportunities', desc: 'Search & save', color: 'text-blue-500', icon: 'M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z' },
  { href: '/proposals', label: 'Proposals', desc: 'Draft & manage', color: 'text-emerald-500', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
  { href: '/compliance', label: 'Compliance', desc: 'Check & extract', color: 'text-purple-500', icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z' },
  { href: '/certifications', label: 'Certifications', desc: 'Track status', color: 'text-amber-500', icon: 'M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z' },
  { href: '/agents', label: 'AI Agents', desc: '10 specialists', color: 'text-indigo-500', icon: 'M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z' },
  { href: '/marketplaces', label: 'Marketplaces', desc: 'SAM, GovWin, DIBBS', color: 'text-emerald-500', icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4' },
  { href: '/market-intelligence', label: 'Market Intel', desc: 'Trends & vendors', color: 'text-cyan-500', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' },
  { href: '/submission', label: 'Submission', desc: 'Package & submit', color: 'text-rose-500', icon: 'M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12' },
];

const BOTTOM_LINKS = [
  { href: '/profile', label: 'Profile' },
  { href: '/notifications', label: 'Notifications' },
  { href: '/settings', label: 'Settings' },
  { href: '/billing', label: 'Billing' },
  { href: '/support', label: 'Support' },
  { href: '/sturgeon-tv', label: 'Sturgeon TV' },
];

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [stats, setStats] = useState<DashboardStats>({ savedOpportunities: 0, proposals: 0, certifications: 0, unreadNotifications: 0 });
  const [loading, setLoading] = useState(true);
  const [loggingOut, setLoggingOut] = useState(false);

  const API = process.env.NEXT_PUBLIC_API_URL || '';

  useEffect(() => {
    const supabase = getSupabaseClient();

    const getUser = async () => {
      const { data: { user: authUser }, error } = await supabase.auth.getUser();
      if (error || !authUser) { router.push('/login'); return; }

      setUser({
        id: authUser.id,
        email: authUser.email!,
        full_name: authUser.user_metadata?.full_name,
        created_at: authUser.created_at!,
        email_confirmed_at: authUser.email_confirmed_at,
      });

      // Fetch stats from Supabase
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.access_token) {
        const t = session.access_token;
        const [opps, props, certs, notifs] = await Promise.allSettled([
          supabase.from('opportunities').select('id', { count: 'exact', head: true }).eq('user_id', authUser.id),
          fetch(`${API}/proposals/`, { headers: { Authorization: `Bearer ${t}` } }).then(r => r.ok ? r.json() : { proposals: [] }),
          fetch(`${API}/api/certifications/`, { headers: { Authorization: `Bearer ${t}` } }).then(r => r.ok ? r.json() : { certifications: [] }),
          fetch(`${API}/api/notifications/unread-count`, { headers: { Authorization: `Bearer ${t}` } }).then(r => r.ok ? r.json() : { count: 0 }),
        ]);
        setStats({
          savedOpportunities: opps.status === 'fulfilled' ? (opps.value.count || 0) : 0,
          proposals: props.status === 'fulfilled' ? (props.value.proposals?.length || 0) : 0,
          certifications: certs.status === 'fulfilled' ? (certs.value.certifications?.length || 0) : 0,
          unreadNotifications: notifs.status === 'fulfilled' ? (notifs.value.count || 0) : 0,
        });
      }
      setLoading(false);
    };

    getUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_OUT') router.push('/login');
    });
    return () => { subscription.unsubscribe(); };
  }, [router, API]);

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      const response = await fetch('/api/auth/logout', { method: 'POST' });
      if (response.ok) router.push('/login');
      else setLoggingOut(false);
    } catch { setLoggingOut(false); }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-400" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50">
      {/* Header */}
      <header className="bg-slate-900 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <Link href="/dashboard" className="flex items-center gap-2">
            <span className="text-2xl">&#x1F41F;</span>
            <span className="text-xl font-bold text-emerald-400">Sturgeon AI</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/notifications" className="relative text-slate-400 hover:text-slate-200">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
              {stats.unreadNotifications > 0 && <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-xs flex items-center justify-center">{stats.unreadNotifications}</span>}
            </Link>
            <button onClick={handleLogout} disabled={loggingOut} className="px-4 py-2 text-sm font-medium text-white bg-slate-800 rounded-lg hover:bg-slate-700 disabled:opacity-50">
              {loggingOut ? 'Logging out...' : 'Logout'}
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold">Welcome back, {user?.full_name || 'User'}</h1>
          <p className="text-slate-400 mt-1">Here&apos;s your government contracting overview</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Link href="/opportunities" className="p-4 bg-slate-900 border border-slate-800 rounded-xl hover:border-blue-600 transition-colors">
            <p className="text-2xl font-bold text-blue-400">{stats.savedOpportunities}</p>
            <p className="text-sm text-slate-400">Saved Opportunities</p>
          </Link>
          <Link href="/proposals" className="p-4 bg-slate-900 border border-slate-800 rounded-xl hover:border-emerald-600 transition-colors">
            <p className="text-2xl font-bold text-emerald-400">{stats.proposals}</p>
            <p className="text-sm text-slate-400">Proposals</p>
          </Link>
          <Link href="/certifications" className="p-4 bg-slate-900 border border-slate-800 rounded-xl hover:border-amber-600 transition-colors">
            <p className="text-2xl font-bold text-amber-400">{stats.certifications}</p>
            <p className="text-sm text-slate-400">Certifications</p>
          </Link>
          <Link href="/notifications" className="p-4 bg-slate-900 border border-slate-800 rounded-xl hover:border-red-600 transition-colors">
            <p className="text-2xl font-bold text-red-400">{stats.unreadNotifications}</p>
            <p className="text-sm text-slate-400">Unread Alerts</p>
          </Link>
        </div>

        {/* Tools Grid */}
        <h2 className="text-lg font-semibold mb-4">Tools</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {TOOLS.map((tool) => (
            <Link key={tool.href} href={tool.href} className="p-4 bg-slate-900 border border-slate-800 rounded-xl hover:border-slate-600 transition-colors group">
              <div className="flex items-center gap-3">
                <svg className={`h-6 w-6 ${tool.color}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={tool.icon} />
                </svg>
                <div>
                  <p className="text-sm font-medium group-hover:text-emerald-400 transition-colors">{tool.label}</p>
                  <p className="text-xs text-slate-500">{tool.desc}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Bottom Links */}
        <div className="flex flex-wrap gap-3">
          {BOTTOM_LINKS.map((link) => (
            <Link key={link.href} href={link.href} className="px-4 py-2 bg-slate-900 border border-slate-800 rounded-lg text-sm text-slate-400 hover:text-emerald-400 hover:border-slate-700 transition-colors">
              {link.label}
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}
