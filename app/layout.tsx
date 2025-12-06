import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Sturgeon AI',
  description: 'Government Contract Analysis System',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="bg-slate-950 text-white min-h-screen">
        <div className="container mx-auto px-4 py-8">
          {children}
        </div>
      </body>
    </html>
  )
}
