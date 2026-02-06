"use client";

import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useEffect, useState } from "react";
import { backend } from "@/lib/backend";

interface ComplianceRequirement {
  id: string;
  requirement: string;
  section_ref: string;
  status: "missing" | "partial" | "addressed";
}

interface ProposalSection {
  id: string;
  section_name: string;
  content: string;
  created_at: string;
}

interface ProposalData {
  proposal: {
    id: string;
    title: string;
    status: string;
    opportunities: {
      title: string;
      agency: string;
    };
  };
  sections: ProposalSection[];
  compliance_matrix: ComplianceRequirement[];
  stats: {
    total_requirements: number;
    addressed: number;
    missing: number;
    sections_count: number;
  };
}

export default function ProposalBuilder() {
  const { id } = useParams();
  const [data, setData] = useState<ProposalData | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [newSectionName, setNewSectionName] = useState("");

  useEffect(() => {
    loadProposal();
  }, [id]);

  async function loadProposal() {
    try {
      const response = await backend.get(`/proposals/${id}`);
      setData(response.data);
    } catch (error) {
      console.error("Failed to load proposal:", error);
    } finally {
      setLoading(false);
    }
  }

  async function generateSection() {
    if (!newSectionName.trim()) {
      alert("Please enter a section name");
      return;
    }

    setGenerating(true);

    try {
      await backend.post(`/proposals/${id}/generate`, {
        section_name: newSectionName,
      });

      setNewSectionName("");
      await loadProposal(); // Reload to show new section
    } catch (error) {
      console.error("Failed to generate section:", error);
      alert("Failed to generate section. Please try again.");
    } finally {
      setGenerating(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading proposal...</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">Proposal not found</h2>
          <p className="mt-2 text-gray-600">The proposal you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }

  const { proposal, sections, compliance_matrix, stats } = data;
  const coveragePercent = stats.total_requirements > 0
    ? Math.round((stats.addressed / stats.total_requirements) * 100)
    : 0;

  return (
    <main className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{proposal.title}</h1>
              <p className="mt-1 text-gray-600">
                {proposal.opportunities.agency} - {proposal.opportunities.title}
              </p>
            </div>
            <div className="text-right">
              <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                {proposal.status.toUpperCase()}
              </div>
            </div>
          </div>

          {/* Stats Bar */}
          <div className="mt-6 grid grid-cols-4 gap-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-600">Total Requirements</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total_requirements}</p>
            </div>
            <div className="bg-green-50 rounded-lg p-4">
              <p className="text-sm text-green-700">Addressed</p>
              <p className="text-2xl font-bold text-green-900">{stats.addressed}</p>
            </div>
            <div className="bg-yellow-50 rounded-lg p-4">
              <p className="text-sm text-yellow-700">Missing</p>
              <p className="text-2xl font-bold text-yellow-900">{stats.missing}</p>
            </div>
            <div className="bg-blue-50 rounded-lg p-4">
              <p className="text-sm text-blue-700">Coverage</p>
              <p className="text-2xl font-bold text-blue-900">{coveragePercent}%</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column: Compliance Matrix */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">📋 Compliance Matrix</h2>
            
            {compliance_matrix.length === 0 ? (
              <p className="text-gray-500 italic">No requirements extracted yet.</p>
            ) : (
              <div className="space-y-3 max-h-[600px] overflow-y-auto">
                {compliance_matrix.map((req) => (
                  <div
                    key={req.id}
                    className={`p-3 rounded-lg border-l-4 ${
                      req.status === "addressed"
                        ? "bg-green-50 border-green-500"
                        : req.status === "partial"
                        ? "bg-yellow-50 border-yellow-500"
                        : "bg-red-50 border-red-500"
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      <span className="text-xl mt-0.5">
                        {req.status === "addressed" ? "✅" : req.status === "partial" ? "⚠️" : "❌"}
                      </span>
                      <div className="flex-1">
                        {req.section_ref && (
                          <span className="text-xs font-mono text-gray-500 bg-gray-100 px-2 py-1 rounded">
                            {req.section_ref}
                          </span>
                        )}
                        <p className="text-sm text-gray-800 mt-1">{req.requirement}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right Column: Proposal Sections */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">📝 Proposal Sections</h2>

            {/* Generate New Section */}
            <div className="mb-6 p-4 bg-blue-50 rounded-lg">
              <h3 className="font-semibold text-blue-900 mb-2">Generate New Section</h3>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newSectionName}
                  onChange={(e) => setNewSectionName(e.target.value)}
                  placeholder="e.g., Technical Approach, Management Plan"
                  className="flex-1 px-3 py-2 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={generating}
                />
                <button
                  onClick={generateSection}
                  disabled={generating}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                >
                  {generating ? "Generating..." : "Generate"}
                </button>
              </div>
            </div>

            {/* Existing Sections */}
            {sections.length === 0 ? (
              <p className="text-gray-500 italic">No sections generated yet. Create one above!</p>
            ) : (
              <div className="space-y-4 max-h-[500px] overflow-y-auto">
                {sections.map((section) => (
                  <div key={section.id} className="border border-gray-200 rounded-lg p-4">
                    <h3 className="font-bold text-gray-900 mb-2">{section.section_name}</h3>
                    <div className="prose prose-sm max-w-none text-gray-700">
                      <pre className="whitespace-pre-wrap font-sans text-sm">{section.content}</pre>
                    </div>
                    <div className="mt-3 text-xs text-gray-500">
                      Generated: {new Date(section.created_at).toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}