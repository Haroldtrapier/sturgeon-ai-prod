export default function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-slate-950">
      <div className="container mx-auto max-w-4xl p-6">
        {children}
      </div>
    </div>
  )
}
