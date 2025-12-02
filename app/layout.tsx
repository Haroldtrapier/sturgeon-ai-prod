import "./globals.css";

export const metadata = {
  title: "Sturgeon AI",
  description: "AI-powered contract matching and proposal generation",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
