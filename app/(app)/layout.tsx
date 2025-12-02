export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-slate-950">
      <div className="mx-auto max-w-4xl p-6">
        {children}
      </div>
    </div>
  );
}
