// app/chat/page.tsx
"use client";

import AIChat from '@/components/AIChat';

export default function ChatPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30 dark:from-gray-900 dark:to-gray-800">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
            AI Assistant
          </h1>
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">
            Ask anything about government contracting, opportunities, proposals, and compliance
          </p>
        </div>
        
        <AIChat />
      </div>
    </div>
  );
}