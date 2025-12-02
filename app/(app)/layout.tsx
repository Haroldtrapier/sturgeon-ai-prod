export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-slate-900 p-8">
      <div className="mx-auto max-w-7xl">{children}</div>
    </div>
  );
}
