import React from 'react';
import Link from 'next/link';

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-950">
      <div className="text-center">
        <h1 className="mb-4 text-4xl font-bold text-slate-50">✅ Sturgeon AI is Live!</h1>
        <p className="mb-6 text-lg text-slate-400">The frontend is successfully connected to Vercel.</p>
        
        <div className="mt-8 rounded-lg border border-slate-800 bg-slate-900/80 p-6">
          <h3 className="mb-4 text-xl font-semibold text-slate-50">Get Started:</h3>
          <Link 
            href="/signin"
            className="inline-flex items-center justify-center rounded-md bg-blue-600 px-6 py-3 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
          >
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
