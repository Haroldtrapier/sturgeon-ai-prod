export default function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div>
      {/* App shell will be added here */}
      {children}
    </div>
  );
}
