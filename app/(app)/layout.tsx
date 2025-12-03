export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-slate-950">
      <div className="container mx-auto max-w-4xl px-4 py-8">
        {children}
      </div>
    </div>
  );
}
