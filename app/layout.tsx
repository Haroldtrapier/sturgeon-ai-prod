import './globals.css'

export const metadata = {
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
      <body className="bg-slate-950 text-white">
        <div className="min-h-screen p-8">
          {children}
        </div>
      </body>
    </html>
  )
}
