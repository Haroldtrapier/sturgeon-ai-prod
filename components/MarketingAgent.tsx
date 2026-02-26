// components/MarketingAgent.tsx
"use client";

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Copy, Download, Loader2 } from 'lucide-react';

const contentTypes = [
  'Email Campaign',
  'LinkedIn Post',
  'Twitter Thread',
  'Facebook Post',
  'Landing Page Copy',
  'Blog Post (SEO)',
  'Proposal Executive Summary',
  'Capability Statement',
];

const tones = ['Professional', 'Conversational', 'Technical', 'Persuasive', 'Educational'];

export default function MarketingAgent() {
  const [contentType, setContentType] = useState('Email Campaign');
  const [tone, setTone] = useState('Professional');
  const [topic, setTopic] = useState('');
  const [generated, setGenerated] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const generateContent = async () => {
    if (!topic.trim()) return;

    setIsLoading(true);
    try {
      const response = await fetch('/api/marketing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contentType, tone, topic }),
      });

      const data = await response.json();
      setGenerated(data.content);
    } catch (error) {
      console.error('Generation error:', error);
      setGenerated('Error generating content. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const copyContent = () => {
    navigator.clipboard.writeText(generated);
  };

  const downloadContent = () => {
    const blob = new Blob([generated], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${contentType.replace(/\s+/g, '_')}_${Date.now()}.txt`;
    a.click();
  };

  return (
    <div className="mx-auto max-w-5xl">
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        {/* Input Panel */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="rounded-2xl border border-gray-200 bg-white p-6 shadow-lg dark:border-gray-700 dark:bg-gray-800"
        >
          <div className="mb-6 flex items-center gap-3">
            <Sparkles className="h-6 w-6 text-purple-600" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Marketing Agent
            </h2>
          </div>

          {/* Content Type */}
          <div className="mb-4">
            <label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300">
              Content Type
            </label>
            <select
              value={contentType}
              onChange={(e) => setContentType(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            >
              {contentTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>

          {/* Tone */}
          <div className="mb-4">
            <label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300">
              Tone
            </label>
            <div className="flex flex-wrap gap-2">
              {tones.map(t => (
                <button
                  key={t}
                  onClick={() => setTone(t)}
                  className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
                    tone === t
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Topic Input */}
          <div className="mb-6">
            <label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300">
              Topic / Brief
            </label>
            <textarea
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g., Cybersecurity contract opportunities for small businesses..."
              rows={4}
              className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            />
          </div>

          {/* Generate Button */}
          <button
            onClick={generateContent}
            disabled={isLoading || !topic.trim()}
            className="w-full rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-3 font-semibold text-white shadow-lg transition hover:shadow-xl disabled:opacity-50"
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 className="h-5 w-5 animate-spin" />
                Generating...
              </span>
            ) : (
              'Generate Content'
            )}
          </button>
        </motion.div>

        {/* Output Panel */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="rounded-2xl border border-gray-200 bg-white p-6 shadow-lg dark:border-gray-700 dark:bg-gray-800"
        >
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Generated Content
            </h3>
            {generated && (
              <div className="flex gap-2">
                <button
                  onClick={copyContent}
                  className="rounded-lg bg-gray-100 p-2 text-gray-700 transition hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300"
                  title="Copy"
                >
                  <Copy className="h-4 w-4" />
                </button>
                <button
                  onClick={downloadContent}
                  className="rounded-lg bg-gray-100 p-2 text-gray-700 transition hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300"
                  title="Download"
                >
                  <Download className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>

          <div className="min-h-[400px] rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-600 dark:bg-gray-900">
            {generated ? (
              <pre className="whitespace-pre-wrap text-sm text-gray-900 dark:text-gray-100">
                {generated}
              </pre>
            ) : (
              <p className="text-center text-gray-400 mt-20">
                Your generated content will appear here...
              </p>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}