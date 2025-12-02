import React from 'react';

export const metadata = {
  title: 'Sturgeon AI',
  description: 'Government Contract Analysis System',
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
