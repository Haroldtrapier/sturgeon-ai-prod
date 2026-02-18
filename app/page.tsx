"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

/* ─── Animated counter hook ─────────────────────────────────────── */
function useCountUp(end: number, duration = 2000, start = false) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!start) return;
    let startTime: number;
    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      setCount(Math.floor(progress * end));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [end, duration, start]);
  return count;
}

/* ─── Intersection Observer hook ────────────────────────────────── */
function useInView(threshold = 0.2) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setInView(true); }, { threshold });
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, inView };
}

/* ─── FAQ Accordion Item ────────────────────────────────────────── */
function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-slate-800 rounded-xl overflow-hidden transition-colors hover:border-slate-700">
      <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between px-6 py-5 text-left">
        <span className="font-semibold text-sm sm:text-base pr-4">{q}</span>
        <svg className={`w-5 h-5 text-slate-400 flex-shrink-0 transition-transform duration-300 ${open ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
      </button>
      <div className={`overflow-hidden transition-all duration-300 ${open ? "max-h-96" : "max-h-0"}`}>
        <p className="px-6 pb-5 text-sm text-slate-400 leading-relaxed">{a}</p>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   LANDING PAGE
   ═══════════════════════════════════════════════════════════════════ */
export default function LandingPage() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);
  const [scrolled, setScrolled] = useState(false);
  const [annual, setAnnual] = useState(true);

  const statsView = useInView(0.3);
  const featuresView = useInView(0.1);
  const howItWorksView = useInView(0.1);

  const stat1 = useCountUp(10000, 2000, statsView.inView);
  const stat2 = useCountUp(6, 800, statsView.inView);
  const stat3 = useCountUp(85, 1500, statsView.inView);

  useEffect(() => {
    const check = async () => {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      if (session) { router.push("/dashboard"); return; }
      setChecking(false);
    };
    check();
  }, [router]);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (checking) return <div className="min-h-screen flex items-center justify-center bg-slate-950"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-400" /></div>;

  const goSignup = () => router.push("/signup");
  const goLogin = () => router.push("/login");

  const FEATURES = [
    {
      icon: (
        <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0112 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5" /></svg>
      ),
      title: "AI-Powered Proposals",
      desc: "Generate compliant, winning proposals in minutes. 6 specialized AI agents trained on thousands of successful government contracts.",
      color: "emerald",
    },
    {
      icon: (
        <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" /></svg>
      ),
      title: "Smart Contract Matching",
      desc: "ContractMatch engine scans SAM.gov, eBuy, and FPDS daily. Get scored matches tailored to your NAICS codes and certifications.",
      color: "blue",
    },
    {
      icon: (
        <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" /></svg>
      ),
      title: "Compliance Automation",
      desc: "FAR/DFARS clause guidance, CMMC readiness tracking, SAM.gov monitoring, and certification management in one unified platform.",
      color: "purple",
    },
    {
      icon: (
        <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" /></svg>
      ),
      title: "Market Intelligence",
      desc: "Competitor analysis, pricing research, agency spending trends, and set-aside analytics powered by AI and real-time data.",
      color: "amber",
    },
    {
      icon: (
        <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m5.231 13.481L15 17.25m-4.5-15H5.625c-.621 0-1.125.504-1.125 1.125v16.5c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9zm3.75 11.625a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" /></svg>
      ),
      title: "Deep Research Tools",
      desc: "NAICS lookup, past performance research, vendor analysis, FPDS contract history, and USASpending data at your fingertips.",
      color: "rose",
    },
    {
      icon: (
        <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" /></svg>
      ),
      title: "Team Collaboration",
      desc: "Multi-user proposal editing, review workflows, role-based permissions, and team dashboards for your capture team.",
      color: "cyan",
    },
  ];

  const colorMap: Record<string, { bg: string; text: string; border: string }> = {
    emerald: { bg: "bg-emerald-500/10", text: "text-emerald-400", border: "border-emerald-500/20" },
    blue: { bg: "bg-blue-500/10", text: "text-blue-400", border: "border-blue-500/20" },
    purple: { bg: "bg-purple-500/10", text: "text-purple-400", border: "border-purple-500/20" },
    amber: { bg: "bg-amber-500/10", text: "text-amber-400", border: "border-amber-500/20" },
    rose: { bg: "bg-rose-500/10", text: "text-rose-400", border: "border-rose-500/20" },
    cyan: { bg: "bg-cyan-500/10", text: "text-cyan-400", border: "border-cyan-500/20" },
  };

  const HOW_IT_WORKS = [
    { step: "01", title: "Set Up Your Profile", desc: "Add your NAICS codes, certifications (SDVOSB, 8(a), HUBZone), past performance, and company capabilities." },
    { step: "02", title: "Discover Opportunities", desc: "ContractMatch scans SAM.gov daily and scores every opportunity against your profile. No more manual searching." },
    { step: "03", title: "Generate Proposals", desc: "Paste the RFP, and our AI extracts requirements, builds compliance matrices, and generates proposal sections." },
    { step: "04", title: "Win Contracts", desc: "Review, collaborate with your team, export to DOCX, and submit. Track your win rate with built-in analytics." },
  ];

  const TESTIMONIALS = [
    { name: "Sarah Mitchell", role: "CEO, VetForce Solutions", text: "Sturgeon AI cut our proposal turnaround from 2 weeks to 2 days. We've won 3 contracts in our first quarter using it.", avatar: "SM" },
    { name: "James Rodriguez", role: "BD Director, ClearPath Federal", text: "The ContractMatch engine surfaces opportunities we were missing entirely. Our pipeline grew 40% in the first month.", avatar: "JR" },
    { name: "Dr. Angela Chen", role: "Founder, TechBridge Gov", text: "As a small 8(a) firm, we couldn't afford a full capture team. Sturgeon AI gives us enterprise-level capabilities at a fraction of the cost.", avatar: "AC" },
  ];

  const FAQS = [
    { q: "How does the AI generate proposals?", a: "Sturgeon AI uses 6 specialized agents trained on government contracting. When you paste an RFP, the system extracts SHALL/MUST requirements, builds a compliance matrix, and generates section-by-section proposal content aligned with evaluation criteria. You review, edit, and export." },
    { q: "Is my data secure?", a: "Absolutely. All data is encrypted at rest and in transit. We use Supabase (PostgreSQL) with row-level security policies, meaning users can only access their own data. We never share your proposals or company information." },
    { q: "What certifications does Sturgeon AI support?", a: "We support all major small business certifications: SDVOSB, VOSB, 8(a), HUBZone, WOSB, EDWOSB, and SDB. The platform tracks certification status, expiry dates, and factors them into opportunity matching." },
    { q: "Can I try it before committing?", a: "Yes. Sign up for a free account with no credit card required. You get 5 AI queries per day, basic opportunity search, and 1 proposal per month. Upgrade anytime." },
    { q: "How does ContractMatch work?", a: "ContractMatch connects to SAM.gov's API and scores every new opportunity against your company profile including NAICS codes, certifications, set-aside preferences, past performance, and keywords. You get daily alerts for high-scoring matches." },
    { q: "Do you integrate with SAM.gov?", a: "Yes, we integrate directly with SAM.gov's official API for real-time opportunity data, entity validation, and set-aside information. We also pull data from USASpending.gov and FPDS for contract history and market intelligence." },
  ];

  const PLANS = [
    {
      name: "Starter",
      monthlyPrice: 97,
      annualPrice: 77,
      desc: "For individual contractors getting started",
      features: ["5 AI queries per day", "Basic opportunity search", "1 proposal per month", "SAM.gov integration", "Email support"],
      cta: "Start Free",
    },
    {
      name: "Professional",
      monthlyPrice: 197,
      annualPrice: 157,
      desc: "For growing firms winning more contracts",
      features: ["Unlimited AI queries", "ContractMatch engine", "Unlimited proposals", "All research & intelligence tools", "Compliance automation", "Team collaboration (5 users)", "Priority support"],
      cta: "Start Free Trial",
      popular: true,
    },
    {
      name: "Enterprise",
      monthlyPrice: 397,
      annualPrice: 317,
      desc: "For large teams and high-volume capture",
      features: ["Everything in Professional", "20+ team members", "API access", "Custom AI training", "White label option", "Dedicated success manager", "Custom integrations"],
      cta: "Contact Sales",
    },
  ];

  const LOGOS = ["Department of Defense", "NASA", "GSA", "DHS", "VA", "HHS"];

  return (
    <div className="min-h-screen bg-slate-950 text-white overflow-x-hidden">

      {/* ─── Sticky Navigation ──────────────────────────────────── */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? "bg-slate-950/90 backdrop-blur-xl border-b border-slate-800/50 shadow-xl shadow-black/20" : "bg-transparent"}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16 sm:h-20">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
            </div>
            <span className="text-xl font-bold tracking-tight">Sturgeon<span className="text-emerald-400"> AI</span></span>
          </div>

          <div className="hidden md:flex items-center gap-8 text-sm text-slate-400">
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-white transition-colors">How It Works</a>
            <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
            <a href="#faq" className="hover:text-white transition-colors">FAQ</a>
          </div>

          <div className="flex items-center gap-3">
            <button onClick={goLogin} className="px-4 py-2 text-sm text-slate-300 hover:text-white transition-colors hidden sm:inline-block">Log In</button>
            <button onClick={goSignup} className="px-5 py-2.5 text-sm bg-emerald-600 text-white rounded-lg hover:bg-emerald-500 transition-all font-semibold shadow-lg shadow-emerald-600/25 hover:shadow-emerald-500/30">Get Started Free</button>
          </div>
        </div>
      </nav>

      {/* ─── Hero Section ───────────────────────────────────────── */}
      <section className="relative pt-32 sm:pt-40 pb-20 sm:pb-32 hero-gradient">
        {/* Floating orbs */}
        <div className="absolute top-20 left-[10%] w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl animate-float pointer-events-none" />
        <div className="absolute top-40 right-[15%] w-56 h-56 bg-blue-500/8 rounded-full blur-3xl animate-float-delayed pointer-events-none" />
        <div className="absolute bottom-10 left-[40%] w-64 h-64 bg-purple-500/6 rounded-full blur-3xl animate-pulse-glow pointer-events-none" />

        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium mb-8 animate-fade-in">
            <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
            Now with Claude AI &amp; GPT-4o Intelligence
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold leading-[1.1] tracking-tight animate-slide-up">
            Win Government Contracts{" "}
            <span className="bg-gradient-to-r from-emerald-400 via-cyan-400 to-blue-400 bg-clip-text text-transparent">
              with AI Intelligence
            </span>
          </h1>

          {/* Subheadline */}
          <p className="text-lg sm:text-xl text-slate-400 mt-6 max-w-2xl mx-auto leading-relaxed animate-slide-up" style={{ animationDelay: "200ms" }}>
            The all-in-one platform for small businesses competing in federal contracting.
            AI-powered proposals, smart contract matching, and compliance automation.
          </p>

          {/* CTA buttons */}
          <div className="flex flex-col sm:flex-row justify-center gap-4 mt-10 animate-slide-up" style={{ animationDelay: "400ms" }}>
            <button onClick={goSignup} className="group px-8 py-4 bg-emerald-600 text-white rounded-xl hover:bg-emerald-500 font-semibold text-lg shadow-2xl shadow-emerald-600/30 hover:shadow-emerald-500/40 transition-all hover:-translate-y-0.5">
              Start Free Trial
              <svg className="inline-block w-5 h-5 ml-2 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
            </button>
            <button onClick={() => document.getElementById("how-it-works")?.scrollIntoView({ behavior: "smooth" })} className="px-8 py-4 bg-slate-800/80 text-slate-200 rounded-xl hover:bg-slate-700 font-semibold text-lg border border-slate-700 hover:border-slate-600 transition-all">
              See How It Works
            </button>
          </div>

          <p className="text-xs text-slate-500 mt-4">No credit card required. Free plan available.</p>
        </div>

        {/* Dashboard preview mockup */}
        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mt-16 animate-slide-up" style={{ animationDelay: "600ms" }}>
          <div className="rounded-2xl overflow-hidden border border-slate-800 shadow-2xl shadow-black/50">
            <div className="bg-slate-900 px-4 py-3 flex items-center gap-2 border-b border-slate-800">
              <div className="flex gap-1.5"><div className="w-3 h-3 rounded-full bg-red-500/80" /><div className="w-3 h-3 rounded-full bg-yellow-500/80" /><div className="w-3 h-3 rounded-full bg-green-500/80" /></div>
              <div className="flex-1 flex justify-center"><div className="px-6 py-1 bg-slate-800 rounded-md text-xs text-slate-400">app.sturgeon.ai/dashboard</div></div>
            </div>
            <div className="bg-slate-950 p-6 sm:p-8">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                {[
                  { label: "Active Opportunities", value: "847", change: "+12%" },
                  { label: "Match Score", value: "94%", change: "Excellent" },
                  { label: "Proposals In Progress", value: "3", change: "Due in 5 days" },
                  { label: "Win Rate", value: "38%", change: "+8% vs avg" },
                ].map(s => (
                  <div key={s.label} className="p-4 bg-slate-900/80 rounded-xl border border-slate-800">
                    <p className="text-xs text-slate-500 mb-1">{s.label}</p>
                    <p className="text-2xl font-bold text-white">{s.value}</p>
                    <p className="text-xs text-emerald-400 mt-1">{s.change}</p>
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2 p-4 bg-slate-900/80 rounded-xl border border-slate-800 h-32 flex items-center justify-center text-slate-600 text-sm">Opportunity Pipeline Chart</div>
                <div className="p-4 bg-slate-900/80 rounded-xl border border-slate-800 h-32 flex items-center justify-center text-slate-600 text-sm">AI Agent Activity</div>
              </div>
            </div>
          </div>
          <div className="absolute inset-0 -z-10 bg-gradient-to-t from-transparent via-emerald-500/5 to-transparent blur-3xl" />
        </div>
      </section>

      {/* ─── Trusted by agencies bar ────────────────────────────── */}
      <section className="border-y border-slate-800/50 bg-slate-900/30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
          <p className="text-center text-xs text-slate-500 uppercase tracking-widest mb-6">Trusted by contractors working with</p>
          <div className="flex flex-wrap justify-center gap-8 sm:gap-12 items-center">
            {LOGOS.map(name => (
              <span key={name} className="text-sm font-semibold text-slate-600 tracking-wide">{name}</span>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Stats Section ──────────────────────────────────────── */}
      <section ref={statsView.ref} className="py-16 sm:py-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 sm:gap-12">
            {[
              { value: `${stat1.toLocaleString()}+`, label: "Contracts Analyzed Daily" },
              { value: `${stat2}`, label: "Specialized AI Agents" },
              { value: `${stat3}%`, label: "Time Saved on Proposals" },
              { value: "24/7", label: "Opportunity Monitoring" },
            ].map((s, i) => (
              <div key={s.label} className={`text-center ${statsView.inView ? "animate-count-up" : "opacity-0"}`} style={{ animationDelay: `${i * 150}ms` }}>
                <p className="text-3xl sm:text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">{s.value}</p>
                <p className="text-sm text-slate-400 mt-2">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Features Section ───────────────────────────────────── */}
      <section id="features" ref={featuresView.ref} className="py-16 sm:py-24">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <p className="text-emerald-400 text-sm font-semibold tracking-wide uppercase mb-3">Platform Features</p>
            <h2 className="text-3xl sm:text-4xl font-extrabold">Everything You Need to Win</h2>
            <p className="text-slate-400 mt-3 max-w-xl mx-auto">Six powerful modules working together to give your small business an unfair advantage in federal contracting.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {FEATURES.map((f, i) => {
              const c = colorMap[f.color];
              return (
                <div
                  key={f.title}
                  className={`group glass-card gradient-border rounded-2xl p-7 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-black/20 ${featuresView.inView ? "animate-slide-up" : "opacity-0"}`}
                  style={{ animationDelay: `${i * 100}ms` }}
                >
                  <div className={`w-12 h-12 rounded-xl ${c.bg} ${c.text} border ${c.border} flex items-center justify-center mb-5 transition-transform group-hover:scale-110`}>
                    {f.icon}
                  </div>
                  <h3 className="font-bold text-lg mb-2">{f.title}</h3>
                  <p className="text-sm text-slate-400 leading-relaxed">{f.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ─── How It Works Section ───────────────────────────────── */}
      <section id="how-it-works" ref={howItWorksView.ref} className="py-16 sm:py-24 bg-slate-900/30 border-y border-slate-800/50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <p className="text-emerald-400 text-sm font-semibold tracking-wide uppercase mb-3">How It Works</p>
            <h2 className="text-3xl sm:text-4xl font-extrabold">From RFP to Award in 4 Steps</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {HOW_IT_WORKS.map((item, i) => (
              <div
                key={item.step}
                className={`relative p-8 rounded-2xl bg-slate-950 border border-slate-800 hover:border-slate-700 transition-all group ${howItWorksView.inView ? "animate-slide-up" : "opacity-0"}`}
                style={{ animationDelay: `${i * 150}ms` }}
              >
                <span className="text-6xl font-black text-emerald-500/10 absolute top-4 right-6 group-hover:text-emerald-500/20 transition-colors">{item.step}</span>
                <h3 className="text-lg font-bold mb-2 relative">{item.title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed relative">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Testimonials Section ───────────────────────────────── */}
      <section className="py-16 sm:py-24">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <p className="text-emerald-400 text-sm font-semibold tracking-wide uppercase mb-3">Testimonials</p>
            <h2 className="text-3xl sm:text-4xl font-extrabold">Trusted by Government Contractors</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t) => (
              <div key={t.name} className="glass-card rounded-2xl p-7 hover:-translate-y-1 transition-all duration-300">
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, j) => (
                    <svg key={j} className="w-4 h-4 text-amber-400" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                  ))}
                </div>
                <p className="text-sm text-slate-300 leading-relaxed mb-6">&ldquo;{t.text}&rdquo;</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center text-xs font-bold text-white">{t.avatar}</div>
                  <div>
                    <p className="text-sm font-semibold">{t.name}</p>
                    <p className="text-xs text-slate-500">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Pricing Section ────────────────────────────────────── */}
      <section id="pricing" className="py-16 sm:py-24 bg-slate-900/30 border-y border-slate-800/50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <p className="text-emerald-400 text-sm font-semibold tracking-wide uppercase mb-3">Pricing</p>
            <h2 className="text-3xl sm:text-4xl font-extrabold">Simple, Transparent Pricing</h2>
            <p className="text-slate-400 mt-3">No hidden fees. Cancel anytime.</p>

            <div className="inline-flex items-center gap-3 mt-6 bg-slate-800 rounded-full p-1">
              <button onClick={() => setAnnual(false)} className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${!annual ? "bg-emerald-600 text-white shadow-lg" : "text-slate-400 hover:text-white"}`}>Monthly</button>
              <button onClick={() => setAnnual(true)} className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${annual ? "bg-emerald-600 text-white shadow-lg" : "text-slate-400 hover:text-white"}`}>Annual <span className="text-emerald-300 text-xs ml-1">Save 20%</span></button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
            {PLANS.map(p => {
              const price = annual ? p.annualPrice : p.monthlyPrice;
              return (
                <div key={p.name} className={`relative rounded-2xl p-8 transition-all duration-300 hover:-translate-y-1 ${p.popular ? "bg-gradient-to-b from-emerald-950/50 to-slate-950 border-2 border-emerald-500/40 shadow-2xl shadow-emerald-500/10" : "glass-card"}`}>
                  {p.popular && (
                    <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                      <span className="px-4 py-1 bg-emerald-500 text-white text-xs font-bold rounded-full shadow-lg shadow-emerald-500/30 uppercase tracking-wide">Most Popular</span>
                    </div>
                  )}

                  <h3 className="text-lg font-bold">{p.name}</h3>
                  <p className="text-sm text-slate-500 mt-1">{p.desc}</p>

                  <div className="mt-5 mb-6">
                    <span className="text-4xl font-extrabold">${price}</span>
                    <span className="text-slate-400 text-sm">/month</span>
                    {annual && <p className="text-xs text-emerald-400 mt-1">Billed annually (${price * 12}/year)</p>}
                  </div>

                  <button onClick={goSignup} className={`w-full py-3 rounded-xl font-semibold text-sm transition-all ${p.popular ? "bg-emerald-600 text-white hover:bg-emerald-500 shadow-lg shadow-emerald-600/25" : "bg-slate-800 text-slate-200 hover:bg-slate-700 border border-slate-700"}`}>
                    {p.cta}
                  </button>

                  <ul className="mt-7 space-y-3">
                    {p.features.map(f => (
                      <li key={f} className="flex items-start gap-3 text-sm">
                        <svg className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                        <span className="text-slate-300">{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ─── FAQ Section ────────────────────────────────────────── */}
      <section id="faq" className="py-16 sm:py-24">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <p className="text-emerald-400 text-sm font-semibold tracking-wide uppercase mb-3">FAQ</p>
            <h2 className="text-3xl sm:text-4xl font-extrabold">Frequently Asked Questions</h2>
          </div>

          <div className="space-y-3">
            {FAQS.map(f => <FAQItem key={f.q} q={f.q} a={f.a} />)}
          </div>
        </div>
      </section>

      {/* ─── Final CTA Section ──────────────────────────────────── */}
      <section className="py-20 sm:py-28 relative overflow-hidden">
        <div className="absolute inset-0 hero-gradient pointer-events-none" />
        <div className="absolute top-10 left-[20%] w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-10 right-[20%] w-80 h-80 bg-blue-500/8 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold leading-tight">Ready to Win More<br /><span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">Government Contracts?</span></h2>
          <p className="text-lg text-slate-400 mt-4 max-w-xl mx-auto">Join hundreds of small businesses using Sturgeon AI to compete and win in federal contracting.</p>
          <div className="flex flex-col sm:flex-row justify-center gap-4 mt-8">
            <button onClick={goSignup} className="group px-10 py-4 bg-emerald-600 text-white rounded-xl hover:bg-emerald-500 font-semibold text-lg shadow-2xl shadow-emerald-600/30 hover:shadow-emerald-500/40 transition-all hover:-translate-y-0.5">
              Get Started Free
              <svg className="inline-block w-5 h-5 ml-2 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
            </button>
          </div>
          <p className="text-xs text-slate-500 mt-4">No credit card required. Free plan available.</p>
        </div>
      </section>

      {/* ─── Footer ─────────────────────────────────────────────── */}
      <footer className="border-t border-slate-800 bg-slate-950">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                </div>
                <span className="text-lg font-bold">Sturgeon AI</span>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">AI-powered government contracting intelligence for small businesses.</p>
            </div>

            <div>
              <h4 className="text-sm font-semibold mb-4 text-slate-300">Platform</h4>
              <ul className="space-y-2 text-sm text-slate-500">
                <li><button onClick={() => router.push("/pro/features")} className="hover:text-emerald-400 transition-colors">Features</button></li>
                <li><button onClick={() => router.push("/pro/pricing")} className="hover:text-emerald-400 transition-colors">Pricing</button></li>
                <li><button onClick={() => router.push("/system/documentation")} className="hover:text-emerald-400 transition-colors">Documentation</button></li>
                <li><button onClick={() => router.push("/system/status")} className="hover:text-emerald-400 transition-colors">Status</button></li>
              </ul>
            </div>

            <div>
              <h4 className="text-sm font-semibold mb-4 text-slate-300">Resources</h4>
              <ul className="space-y-2 text-sm text-slate-500">
                <li><button onClick={() => router.push("/support")} className="hover:text-emerald-400 transition-colors">Support</button></li>
                <li><button onClick={() => router.push("/system/help")} className="hover:text-emerald-400 transition-colors">Help Center</button></li>
                <li><button onClick={() => router.push("/system/integrations")} className="hover:text-emerald-400 transition-colors">Integrations</button></li>
              </ul>
            </div>

            <div>
              <h4 className="text-sm font-semibold mb-4 text-slate-300">Company</h4>
              <ul className="space-y-2 text-sm text-slate-500">
                <li><button onClick={() => router.push("/system/security")} className="hover:text-emerald-400 transition-colors">Security</button></li>
                <li><button onClick={() => router.push("/login")} className="hover:text-emerald-400 transition-colors">Sign In</button></li>
                <li><button onClick={goSignup} className="hover:text-emerald-400 transition-colors">Sign Up</button></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-slate-800 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs text-slate-600">&copy; {new Date().getFullYear()} Sturgeon AI. All rights reserved.</p>
            <div className="flex gap-6 text-xs text-slate-600">
              <span className="hover:text-slate-400 cursor-pointer">Privacy Policy</span>
              <span className="hover:text-slate-400 cursor-pointer">Terms of Service</span>
              <span className="hover:text-slate-400 cursor-pointer">SDVOSB Certified</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
