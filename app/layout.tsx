import '../styles/globals.css';

export const metadata = {
  title: 'Sturgeon AI - Certifications',
  description: 'Track SBA and VA certifications',
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
