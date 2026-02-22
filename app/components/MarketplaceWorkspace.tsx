"use client";

import { useState, useEffect } from "react";
import { ExternalLink, Sparkles, Upload, FileText, Clock } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { apiPost } from "@/lib/api";

type MarketplaceWorkspaceProps = {
  name: string;
  loginUrl: string;
  description: string;
};

type Opportunity = {
  id: string;
  title: string;
  source: string;
  url?: string;
  raw_text?: string;
  created_at: string;
  analysis?: {
    summary?: string;
    requirements?: string[];
    risk_flags?: string[];
    suggested_naics?: string[];
    win_themes?: string[];
  };
};

export default function MarketplaceWorkspace({
  name,
  loginUrl,
  description,
}: MarketplaceWorkspaceProps) {
  const [opportunityUrl, setOpportunityUrl] = useState("");
  const [opportunityText, setOpportunityText] = useState("");
  const [importMode, setImportMode] = useState<"url" | "text">("url");
  const [saving, setSaving] = useState(false);
  const [analyzing, setAnalyzing] = useState<string | null>(null);
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [message, setMessage] = useState("");
  const [userId, setUserId] = useState<string | null>(null);

  const supabase = createClient();

  useEffect(() => {
    const loadUserAndOpportunities = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      
      setUserId(user.id);
      
      // Load user's opportunities for this marketplace
      const { data, error } = await supabase
        .from("opportunities")
        .select("*")
        .eq("user_id", user.id)
        .eq("source", name)
        .order("created_at", { ascending: false })
        .limit(10);

      if (!error && data) {
        setOpportunities(data as Opportunity[]);
      }
    };

    loadUserAndOpportunities();
  }, [name, supabase]);

  const handleSave = async () => {
    if (!userId) {
      setMessage("Please log in to save opportunities.");
      return;
    }

    const title = opportunityUrl || "Imported Opportunity";
    const content = importMode === "url" ? opportunityUrl : opportunityText;

    if (!content.trim()) {
      setMessage("Please provide a URL or paste opportunity text.");
      return;
    }

    setSaving(true);
    setMessage("");

    try {
      const { data, error } = await supabase
        .from("opportunities")
        .insert([
          {
            user_id: userId,
            source: name,
            title,
            url: importMode === "url" ? opportunityUrl : null,
            raw_text: importMode === "text" ? opportunityText : null,
          },
        ])
        .select()
        .single();

      if (error) throw error;

      setOpportunities([data as Opportunity, ...opportunities]);
      setOpportunityUrl("");
      setOpportunityText("");
      setMessage("Opportunity saved successfully!");
    } catch (err: any) {
      setMessage(`Error saving: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  const handleAnalyze = async (opp: Opportunity) => {
    if (!userId) return;

    setAnalyzing(opp.id);
    setMessage("");

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;

      const analysis = await apiPost<{
        summary: string;
        requirements: string[];
        risk_flags: string[];
        suggested_naics: string[];
        win_themes: string[];
      }>(
        "/analyze",
        {
          opportunity_id: opp.id,
          raw_text: opp.raw_text || opp.url,
        },
        token
      );

      // Save analysis to database
      const { error } = await supabase
        .from("opportunity_analysis")
        .upsert({
          opportunity_id: opp.id,
          user_id: userId,
          analysis_data: analysis,
          updated_at: new Date().toISOString(),
        });

      if (error) throw error;

      // Update local state
      setOpportunities(
        opportunities.map((o) =>
          o.id === opp.id ? { ...o, analysis } : o
        )
      );

      setMessage("Analysis complete!");
    } catch (err: any) {
      setMessage(`Analysis failed: ${err.message}`);
    } finally {
      setAnalyzing(null);
    }
  };

  return (
    <main className="min-h-screen bg-sand-50 text-stone-800 px-6 py-8">
      <section className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold mb-2">{name} + Harpoon AI</h1>
            <p className="text-stone-600">{description}</p>
          </div>
          <a
            href={loginUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center justify-center rounded-xl px-5 py-2.5 text-sm font-semibold text-slate-950 bg-lime-600 shadow-lg hover:bg-lime-600 transition"
          >
            <ExternalLink className="w-4 h-4 mr-2" />
            Open {name}
          </a>
        </div>

        {message && (
          <div className={`mb-4 p-3 rounded-lg ${
            message.includes("Error") || message.includes("failed")
              ? "bg-red-500/20 text-red-700"
              : "bg-lime-600/20 text-lime-600"
          }`}>
            {message}
          </div>
        )}

        {/* Import Panel */}
        <div className="rounded-2xl border border-stone-200 bg-white/60 p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Upload className="w-5 h-5" />
            Import Opportunity
          </h2>

          <div className="flex gap-2 mb-4">
            <button
              onClick={() => setImportMode("url")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                importMode === "url"
                  ? "bg-lime-600 text-slate-950"
                  : "bg-stone-100 text-stone-600 hover:bg-stone-200"
              }`}
            >
              Paste URL
            </button>
            <button
              onClick={() => setImportMode("text")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                importMode === "text"
                  ? "bg-lime-600 text-slate-950"
                  : "bg-stone-100 text-stone-600 hover:bg-stone-200"
              }`}
            >
              Paste Text
            </button>
          </div>

          {importMode === "url" ? (
            <input
              type="url"
              placeholder="Paste opportunity URL here..."
              value={opportunityUrl}
              onChange={(e) => setOpportunityUrl(e.target.value)}
              className="w-full px-4 py-3 bg-stone-100 border border-stone-300 rounded-lg text-stone-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-lime-500 mb-4"
            />
          ) : (
            <textarea
              placeholder="Paste opportunity text, solicitation details, or requirements here..."
              value={opportunityText}
              onChange={(e) => setOpportunityText(e.target.value)}
              rows={6}
              className="w-full px-4 py-3 bg-stone-100 border border-stone-300 rounded-lg text-stone-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-lime-500 mb-4 resize-none"
            />
          )}

          <button
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-3 bg-lime-600 text-slate-950 font-semibold rounded-lg hover:bg-lime-600 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            {saving ? "Saving..." : "Save to Harpoon"}
          </button>
        </div>

        {/* Recent Imports */}
        <div className="rounded-2xl border border-stone-200 bg-white/60 p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Recent Imports
          </h2>

          {opportunities.length === 0 ? (
            <p className="text-stone-500 text-sm">No opportunities imported yet.</p>
          ) : (
            <div className="space-y-4">
              {opportunities.map((opp) => (
                <div
                  key={opp.id}
                  className="border border-stone-300 rounded-lg p-4 bg-stone-100/40"
                >
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold text-stone-800">{opp.title}</h3>
                    <span className="text-xs text-stone-500 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(opp.created_at).toLocaleDateString()}
                    </span>
                  </div>

                  {opp.url && (
                    <a
                      href={opp.url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-sm text-lime-700 hover:text-lime-600 mb-2 inline-block"
                    >
                      {opp.url}
                    </a>
                  )}

                  {opp.analysis ? (
                    <div className="mt-3 p-3 bg-lime-600/10 border border-lime-500/30 rounded-lg">
                      <p className="text-sm text-lime-700 font-medium mb-2">Analysis:</p>
                      <p className="text-xs text-stone-600 mb-2">{opp.analysis.summary}</p>
                      {opp.analysis.requirements && opp.analysis.requirements.length > 0 && (
                        <div className="text-xs text-stone-500">
                          <span className="font-medium">Requirements:</span>{" "}
                          {opp.analysis.requirements.join(", ")}
                        </div>
                      )}
                    </div>
                  ) : (
                    <button
                      onClick={() => handleAnalyze(opp)}
                      disabled={analyzing === opp.id}
                      className="mt-2 px-4 py-2 bg-blue-500 text-white text-sm font-medium rounded-lg hover:bg-blue-400 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center gap-2"
                    >
                      <Sparkles className="w-4 h-4" />
                      {analyzing === opp.id ? "Analyzing..." : "Analyze"}
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
