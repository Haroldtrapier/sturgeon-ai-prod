'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Sparkles, Copy, Download, Loader2, 
  Mail, Linkedin, Twitter, FileText,
  Instagram, TrendingUp, Video, Newspaper,
  Users, Target, Gift, Calendar,
  MessageSquare, Award, Briefcase, ChevronDown
} from 'lucide-react';

// EXPANDED: 16 content types (was 8)
const CONTENT_TYPES = [
  // Original 8
  { value: 'email', label: 'Email Campaign', icon: Mail, description: 'Professional email with subject & body' },
  { value: 'linkedin', label: 'LinkedIn Post', icon: Linkedin, description: 'Engaging professional post' },
  { value: 'twitter', label: 'Twitter Thread', icon: Twitter, description: '5-7 tweet thread with hooks' },
  { value: 'facebook', label: 'Facebook Post', icon: FileText, description: 'Conversational social post' },
  { value: 'landing', label: 'Landing Page Copy', icon: FileText, description: 'Headlines, benefits & CTA' },
  { value: 'blog', label: 'Blog Post (SEO)', icon: Newspaper, description: 'SEO-optimized article' },
  { value: 'proposal', label: 'Proposal Summary', icon: Briefcase, description: 'Executive summary' },
  { value: 'capability', label: 'Capability Statement', icon: Award, description: 'Expertise showcase' },

  // NEW: 8 additional types
  { value: 'instagram', label: 'Instagram Caption', icon: Instagram, description: 'Visual-first post with hashtags' },
  { value: 'press', label: 'Press Release', icon: Newspaper, description: 'Professional announcement' },
  { value: 'case-study', label: 'Case Study', icon: Target, description: 'Success story with metrics' },
  { value: 'webinar', label: 'Webinar Script', icon: Users, description: 'Presentation outline' },
  { value: 'video', label: 'Video Script', icon: Video, description: 'Engaging video content' },
  { value: 'ad-copy', label: 'Ad Copy', icon: TrendingUp, description: 'Paid advertising text' },
  { value: 'newsletter', label: 'Newsletter', icon: Mail, description: 'Email newsletter content' },
  { value: 'one-pager', label: 'One-Pager', icon: FileText, description: 'Single-page overview' }
];

// EXPANDED: 8 tones (was 5)
const TONES = [
  // Original 5
  { value: 'professional', label: 'Professional', description: 'Formal business tone' },
  { value: 'conversational', label: 'Conversational', description: 'Friendly & approachable' },
  { value: 'technical', label: 'Technical', description: 'Expert & detailed' },
  { value: 'persuasive', label: 'Persuasive', description: 'Compelling & action-driven' },
  { value: 'educational', label: 'Educational', description: 'Informative & clear' },

  // NEW: 3 additional tones
  { value: 'inspirational', label: 'Inspirational', description: 'Motivational & uplifting' },
  { value: 'authoritative', label: 'Authoritative', description: 'Confident & commanding' },
  { value: 'empathetic', label: 'Empathetic', description: 'Understanding & supportive' }
];

export default function MarketingAgent() {
  const [contentType, setContentType] = useState('email');
  const [tone, setTone] = useState('professional');
  const [topic, setTopic] = useState('');
  const [additionalContext, setAdditionalContext] = useState('');
  const [targetAudience, setTargetAudience] = useState('');
  const [generatedContent, setGeneratedContent] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isDemoMode, setIsDemoMode] = useState(false);

  const selectedType = CONTENT_TYPES.find(t => t.value === contentType);
  const selectedTone = TONES.find(t => t.value === tone);

  const generateContent = async () => {
    if (!topic.trim()) {
      alert('Please enter a topic');
      return;
    }

    setIsGenerating(true);
    setGeneratedContent('');

    try {
      const response = await fetch('/api/marketing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          contentType, 
          tone, 
          topic,
          additionalContext,
          targetAudience
        }),
      });

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      setGeneratedContent(data.content);
      setIsDemoMode(data.demo || false);
    } catch (error: any) {
      setGeneratedContent(`❌ Error: ${error.message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const copyContent = () => {
    navigator.clipboard.writeText(generatedContent);
    alert('✅ Content copied to clipboard!');
  };

  const downloadContent = () => {
    const blob = new Blob([generatedContent], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${contentType}-${Date.now()}.md`;
    a.click();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-white p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <Sparkles className="w-10 h-10 text-blue-400" />
            <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
              Marketing Agent
            </h1>
          </div>
          <p className="text-xl text-slate-300">
            Generate professional marketing content with AI - 16 types, 8 tones
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Panel: Input Form */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-700">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <Target className="w-6 h-6 text-blue-400" />
                Configure Content
              </h2>

              {/* Content Type */}
              <div className="mb-6">
                <label className="block text-sm font-semibold mb-3 text-slate-300">
                  Content Type ({CONTENT_TYPES.length} options)
                </label>
                <div className="relative">
                  <select
                    value={contentType}
                    onChange={(e) => setContentType(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-600 rounded-xl px-4 py-3 text-white appearance-none cursor-pointer hover:border-blue-400 transition-colors"
                  >
                    {CONTENT_TYPES.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label} - {type.description}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
                </div>
                {selectedType && (
                  <div className="mt-2 flex items-center gap-2 text-sm text-slate-400">
                    {selectedType.icon && <selectedType.icon className="w-4 h-4" />}
                    {selectedType.description}
                  </div>
                )}
              </div>

              {/* Tone */}
              <div className="mb-6">
                <label className="block text-sm font-semibold mb-3 text-slate-300">
                  Tone ({TONES.length} options)
                </label>
                <div className="relative">
                  <select
                    value={tone}
                    onChange={(e) => setTone(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-600 rounded-xl px-4 py-3 text-white appearance-none cursor-pointer hover:border-blue-400 transition-colors"
                  >
                    {TONES.map((t) => (
                      <option key={t.value} value={t.value}>
                        {t.label} - {t.description}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
                </div>
                {selectedTone && (
                  <p className="mt-2 text-sm text-slate-400">
                    {selectedTone.description}
                  </p>
                )}
              </div>

              {/* Topic (Required) */}
              <div className="mb-6">
                <label className="block text-sm font-semibold mb-3 text-slate-300">
                  Topic / Brief <span className="text-red-400">*</span>
                </label>
                <textarea
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="Enter your topic or brief description..."
                  rows={3}
                  className="w-full bg-slate-900 border border-slate-600 rounded-xl px-4 py-3 text-white placeholder-slate-500 resize-none focus:outline-none focus:border-blue-400 transition-colors"
                />
              </div>

              {/* Target Audience (NEW) */}
              <div className="mb-6">
                <label className="block text-sm font-semibold mb-3 text-slate-300 flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Target Audience (optional)
                </label>
                <input
                  type="text"
                  value={targetAudience}
                  onChange={(e) => setTargetAudience(e.target.value)}
                  placeholder="e.g., Federal contractors, CTOs, Decision-makers"
                  className="w-full bg-slate-900 border border-slate-600 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-blue-400 transition-colors"
                />
              </div>

              {/* Additional Context (NEW) */}
              <div className="mb-6">
                <label className="block text-sm font-semibold mb-3 text-slate-300">
                  Additional Context (optional)
                </label>
                <textarea
                  value={additionalContext}
                  onChange={(e) => setAdditionalContext(e.target.value)}
                  placeholder="Add any specific requirements, keywords, or details..."
                  rows={2}
                  className="w-full bg-slate-900 border border-slate-600 rounded-xl px-4 py-3 text-white placeholder-slate-500 resize-none focus:outline-none focus:border-blue-400 transition-colors"
                />
              </div>

              {/* Generate Button */}
              <motion.button
                onClick={generateContent}
                disabled={isGenerating || !topic.trim()}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 disabled:from-slate-700 disabled:to-slate-700 text-white font-bold py-4 px-6 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg disabled:cursor-not-allowed"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    Generate Content
                  </>
                )}
              </motion.button>
            </div>
          </motion.div>

          {/* Right Panel: Output */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-700"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <FileText className="w-6 h-6 text-cyan-400" />
                Generated Content
              </h2>

              {generatedContent && (
                <div className="flex gap-2">
                  <motion.button
                    onClick={copyContent}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="p-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors"
                    title="Copy to clipboard"
                  >
                    <Copy className="w-5 h-5" />
                  </motion.button>
                  <motion.button
                    onClick={downloadContent}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="p-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors"
                    title="Download as file"
                  >
                    <Download className="w-5 h-5" />
                  </motion.button>
                </div>
              )}
            </div>

            {isDemoMode && generatedContent && (
              <div className="mb-4 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                <p className="text-yellow-400 text-sm font-semibold">
                  🔧 DEMO MODE: This is a sample. Enable production mode for real AI content.
                </p>
              </div>
            )}

            <div className="bg-slate-900/50 rounded-xl p-6 min-h-[600px] max-h-[600px] overflow-y-auto">
              {generatedContent ? (
                <div className="prose prose-invert max-w-none">
                  <pre className="whitespace-pre-wrap font-sans text-slate-200 leading-relaxed">
                    {generatedContent}
                  </pre>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-slate-500">
                  <Sparkles className="w-16 h-16 mb-4 opacity-30" />
                  <p className="text-lg">Configure and generate content to see results here</p>
                  <p className="text-sm mt-2">Choose from {CONTENT_TYPES.length} content types and {TONES.length} tones</p>
                </div>
              )}
            </div>
          </motion.div>
        </div>

        {/* Stats Footer */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4"
        >
          <div className="bg-slate-800/30 rounded-xl p-4 text-center border border-slate-700">
            <p className="text-3xl font-bold text-blue-400">{CONTENT_TYPES.length}</p>
            <p className="text-sm text-slate-400">Content Types</p>
          </div>
          <div className="bg-slate-800/30 rounded-xl p-4 text-center border border-slate-700">
            <p className="text-3xl font-bold text-cyan-400">{TONES.length}</p>
            <p className="text-sm text-slate-400">Tone Options</p>
          </div>
          <div className="bg-slate-800/30 rounded-xl p-4 text-center border border-slate-700">
            <p className="text-3xl font-bold text-green-400">10s</p>
            <p className="text-sm text-slate-400">Generation Time</p>
          </div>
          <div className="bg-slate-800/30 rounded-xl p-4 text-center border border-slate-700">
            <p className="text-3xl font-bold text-purple-400">AI</p>
            <p className="text-sm text-slate-400">Powered by GPT-4</p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
