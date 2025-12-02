import React from 'react';

export const metadata = {
  title: 'Sturgeon AI',
  description: 'AI-powered government contracting platform',
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
