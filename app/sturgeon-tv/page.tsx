"use client";

import { useState } from "react";

const CATEGORIES = ["All", "Getting Started", "Proposals", "Compliance", "Market Intel", "Advanced"];

const VIDEOS = [
  {
    title: "Getting Started with Sturgeon AI",
    description: "Complete platform walkthrough — from profile setup to your first AI-powered proposal.",
    category: "Getting Started",
    duration: "12 min",
    thumbnail: "rocket",
  },
  {
    title: "ContractMatch AI Engine",
    description: "How the AI matches your company profile to the best government opportunities.",
    category: "Getting Started",
    duration: "8 min",
    thumbnail: "target",
  },
  {
    title: "Writing Winning Proposals with AI",
    description: "Step-by-step guide to generating compliant, persuasive proposals using Sturgeon AI.",
    category: "Proposals",
    duration: "15 min",
    thumbnail: "edit",
  },
  {
    title: "Proposal Pricing Strategies",
    description: "Learn T&M, FFP, and CPFF pricing approaches for government contracts.",
    category: "Proposals",
    duration: "10 min",
    thumbnail: "dollar",
  },
  {
    title: "FAR Compliance Deep Dive",
    description: "Navigate Federal Acquisition Regulation requirements with AI assistance.",
    category: "Compliance",
    duration: "18 min",
    thumbnail: "shield",
  },
  {
    title: "CMMC Readiness Guide",
    description: "Prepare for Cybersecurity Maturity Model Certification requirements.",
    category: "Compliance",
    duration: "14 min",
    thumbnail: "lock",
  },
  {
    title: "Market Intelligence Dashboard",
    description: "Analyze agency spending, track competitors, and identify opportunities.",
    category: "Market Intel",
    duration: "11 min",
    thumbnail: "chart",
  },
  {
    title: "Competitor Analysis with AI",
    description: "Use USASpending data to understand your competitive landscape.",
    category: "Market Intel",
    duration: "9 min",
    thumbnail: "users",
  },
  {
    title: "Advanced Search & Filters",
    description: "Master SAM.gov, FPDS, and USASpending search to find hidden opportunities.",
    category: "Advanced",
    duration: "13 min",
    thumbnail: "search",
  },
  {
    title: "API Integration & Automation",
    description: "Set up automated alerts, pipeline tracking, and CRM integrations.",
    category: "Advanced",
    duration: "16 min",
    thumbnail: "zap",
  },
];

const ICONS: Record<string, string> = {
  rocket: "🚀", target: "🎯", edit: "✏️", dollar: "💰",
  shield: "🛡️", lock: "🔒", chart: "📊", users: "👥",
  search: "🔍", zap: "⚡",
};

export default function SturgeonTV() {
  const [category, setCategory] = useState("All");
  const filtered = category === "All" ? VIDEOS : VIDEOS.filter(v => v.category === category);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Sturgeon TV</h1>
        <p className="text-slate-400 mt-1">Training, tutorials, and government contracting breakdowns</p>
      </div>

      {/* Featured banner */}
      <div className="mb-8 p-6 bg-gradient-to-r from-emerald-900/40 to-blue-900/40 border border-emerald-800/50 rounded-xl">
        <div className="flex items-center gap-3 mb-2">
          <span className="px-2 py-0.5 bg-emerald-600 text-white text-xs font-medium rounded">NEW</span>
          <span className="text-xs text-slate-400">Latest Episode</span>
        </div>
        <h2 className="text-xl font-bold mb-1">Getting Started with Sturgeon AI</h2>
        <p className="text-sm text-slate-400 mb-4">Complete platform walkthrough — from profile setup to your first AI-powered proposal.</p>
        <div className="flex items-center gap-4">
          <span className="text-xs text-slate-500">12 min</span>
          <span className="text-xs text-slate-500">Getting Started</span>
        </div>
      </div>

      {/* Category filter */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {CATEGORIES.map(c => (
          <button
            key={c}
            onClick={() => setCategory(c)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              category === c
                ? "bg-emerald-600 text-white"
                : "bg-slate-800 text-slate-400 hover:text-white"
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      {/* Video grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((video, i) => (
          <div key={i} className="group p-5 bg-slate-900 border border-slate-800 rounded-xl hover:border-emerald-700/50 transition-colors cursor-pointer">
            {/* Thumbnail placeholder */}
            <div className="aspect-video bg-slate-800 rounded-lg mb-4 flex items-center justify-center text-4xl">
              {ICONS[video.thumbnail] || "🎬"}
            </div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2 py-0.5 bg-slate-800 text-slate-400 text-xs rounded">{video.category}</span>
              <span className="text-xs text-slate-500">{video.duration}</span>
            </div>
            <h3 className="font-medium text-sm mb-1 group-hover:text-emerald-400 transition-colors">{video.title}</h3>
            <p className="text-xs text-slate-400 leading-relaxed">{video.description}</p>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16 bg-slate-900 border border-slate-800 rounded-xl">
          <p className="text-slate-400">No videos in this category yet.</p>
        </div>
      )}

      {/* Coming soon notice */}
      <div className="mt-8 p-4 bg-slate-900/50 border border-slate-800 rounded-lg text-center">
        <p className="text-sm text-slate-400">Video content is being produced. Check back soon for full tutorials.</p>
        <p className="text-xs text-slate-500 mt-1">Have a topic request? Let us know via the Support page.</p>
      </div>
    </div>
  );
}
