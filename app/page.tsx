import Link from 'next/link'

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh]">
      <h1 className="text-4xl font-bold mb-4">✅ Sturgeon AI is Live!</h1>
      <p className="text-lg text-slate-300 mb-8">The frontend is successfully connected to Vercel.</p>
      
      <div className="mt-8 p-8 border border-slate-700 rounded-lg bg-slate-900/50">
        <h3 className="text-xl font-semibold mb-4">API Status:</h3>
        <ul className="space-y-2">
          <li>
            <Link href="/api" className="text-blue-400 hover:text-blue-300 underline">
              Check API Status (/api)
            </Link>
          </li>
        </ul>
      </div>
    </div>
  )
}
