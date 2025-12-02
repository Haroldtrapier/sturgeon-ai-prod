import "../styles/globals.css";

export const metadata = {
  title: "Sturgeon AI",
  description: "Government contracting intelligence platform",
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
