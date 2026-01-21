'use client';

import { useState } from 'react';
import { useDebouncedValue } from '@/lib/hooks/useDebouncedValue';

interface MarketplaceImportProps {
  source: string;
  sourceName: string;
  loginUrl: string;
  description: string;
}

export default function MarketplaceImport({ source, sourceName, loginUrl, description }: MarketplaceImportProps) {
  const [url, setUrl] = useState('');
  const [rawText, setRawText] = useState('');
  const [status, setStatus] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const debouncedUrl = useDebouncedValue(url, 500);

  async function handleImport() {
    if (!url.trim() && !rawText.trim()) {
      setStatus('Please enter a URL or paste opportunity text');
      return;
    }

    setLoading(true);
    setStatus('Saving to Sturgeon AI...');

    try {
      const response = await fetch('/api/opportunities/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          source,
          sourceUrl: url || null,
          rawText: rawText || null,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setStatus(`Error: ${data.error}`);
        setLoading(false);
        return;
      }

      setStatus('✅ Saved successfully! Ready for AI analysis.');
      setUrl('');
      setRawText('');
      
      // Clear success message after 3 seconds
      setTimeout(() => setStatus(''), 3000);
    } catch (err: any) {
      setStatus(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-emerald-400 mb-2">{sourceName}</h1>
          <p className="text-slate-300 mb-4">{description}</p>
          <a 
            href={loginUrl} 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-block px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm transition-colors"
          >
            Open {sourceName} →
          </a>
        </div>

        <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-6 space-y-4">
          <h2 className="text-xl font-semibold mb-4">Import Opportunity</h2>
          
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Opportunity URL
            </label>
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder={`Paste ${sourceName} opportunity URL...`}
              className="w-full px-4 py-3 bg-slate-950 border border-slate-700 rounded-lg text-slate-100 placeholder-slate-500 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition"
            />
          </div>

          <div className="text-center text-slate-500 text-sm">OR</div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Paste Opportunity Text
            </label>
            <textarea
              value={rawText}
              onChange={(e) => setRawText(e.target.value)}
              placeholder="Copy and paste the full opportunity details here..."
              rows={8}
              className="w-full px-4 py-3 bg-slate-950 border border-slate-700 rounded-lg text-slate-100 placeholder-slate-500 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition resize-none"
            />
          </div>

          <button
            onClick={handleImport}
            disabled={loading || (!url.trim() && !rawText.trim())}
            className="w-full px-6 py-3 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-700 disabled:cursor-not-allowed rounded-lg font-semibold transition-colors"
          >
            {loading ? 'Saving...' : 'Save to Sturgeon AI'}
          </button>

          {status && (
            <div className={`p-3 rounded-lg text-sm ${
              status.startsWith('✅') 
                ? 'bg-emerald-900/50 text-emerald-300 border border-emerald-800' 
                : status.startsWith('Error') 
                ? 'bg-red-900/50 text-red-300 border border-red-800'
                : 'bg-blue-900/50 text-blue-300 border border-blue-800'
            }`}>
              {status}
            </div>
          )}
        </div>

        <div className="mt-8 bg-slate-900/50 border border-slate-800 rounded-xl p-6">
          <h3 className="text-lg font-semibold mb-3 text-emerald-400">How It Works</h3>
          <ol className="space-y-2 text-slate-300 text-sm">
            <li className="flex gap-2">
              <span className="text-emerald-400 font-bold">1.</span>
              <span>Log into {sourceName} in a separate tab</span>
            </li>
            <li className="flex gap-2">
              <span className="text-emerald-400 font-bold">2.</span>
              <span>Find an opportunity that matches your capabilities</span>
            </li>
            <li className="flex gap-2">
              <span className="text-emerald-400 font-bold">3.</span>
              <span>Copy the URL or paste the full text above</span>
            </li>
            <li className="flex gap-2">
              <span className="text-emerald-400 font-bold">4.</span>
              <span>Click "Save to Sturgeon AI" to import it</span>
            </li>
            <li className="flex gap-2">
              <span className="text-emerald-400 font-bold">5.</span>
              <span>Use the AI Assistant to analyze and draft responses</span>
            </li>
          </ol>
        </div>
      </div>
    </div>
  );
}
