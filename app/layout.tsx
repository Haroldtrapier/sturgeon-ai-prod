import '../styles/globals.css'

export const metadata = {
  title: 'Sturgeon AI',
  description: 'Government Contracting & Grants Ecosystem',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
