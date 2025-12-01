import React from 'react';

export default function Home() {
  return (
    <div className="flex justify-center items-center min-h-screen flex-col font-sans">
      <h1 className="text-4xl font-bold">✅ Sturgeon AI is Live!</h1>
      <p className="mt-4">The frontend is successfully connected to Vercel.</p>
      
      <div className="mt-8 p-6 border border-gray-600 rounded-lg">
        <h3 className="text-xl font-semibold mb-4">API Status:</h3>
        <ul className="list-disc list-inside">
          <li>
            <a href="/api" className="text-blue-400 hover:text-blue-300 underline">
              Check API Status (/api)
            </a>
          </li>
        </ul>
      </div>
    </div>
  );
}
