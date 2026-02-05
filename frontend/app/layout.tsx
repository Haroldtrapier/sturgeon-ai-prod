import Nav from "@/components/Nav";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, fontFamily: "system-ui, sans-serif", backgroundColor: "#fafafa" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: 24, backgroundColor: "white", minHeight: "100vh" }}>
          <header style={{ marginBottom: 16 }}>
            <h2 style={{ margin: 0, fontSize: 20, fontWeight: 600 }}>Sturgeon AI</h2>
            <p style={{ margin: 0, fontSize: 13, color: "#666", marginTop: 4 }}>Contract research, proposal drafting, and compliance support for government opportunities</p>
          </header>
          <Nav />
          <main style={{ marginTop: 24 }}>{children}</main>
        </div>
      </body>
    </html>
  );
}
