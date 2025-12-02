export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto">{children}</div>
    </div>
  );
}
