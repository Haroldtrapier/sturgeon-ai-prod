import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Sturgeon AI',
  description: 'AI-powered contract analysis and proposal generation',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-900">
        {children}
      </body>
    </html>
  )
}
