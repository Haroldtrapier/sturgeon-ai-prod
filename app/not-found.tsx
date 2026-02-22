"use client";

import { useRouter } from "next/navigation";

export default function NotFound() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-lime-700 mb-4">404</h1>
        <h2 className="text-2xl font-semibold mb-2">Page Not Found</h2>
        <p className="text-stone-500 mb-8 max-w-md">The page you&apos;re looking for doesn&apos;t exist or has been moved.</p>
        <div className="flex justify-center gap-3">
          <button onClick={() => router.back()} className="px-6 py-2.5 bg-stone-100 border border-stone-300 rounded-lg hover:bg-stone-200 text-sm">Go Back</button>
          <button onClick={() => router.push("/dashboard")} className="px-6 py-2.5 bg-lime-700 text-white rounded-lg hover:bg-lime-800 text-sm font-medium">Dashboard</button>
        </div>
      </div>
    </div>
  );
}
