export default function Home() {
  return (
    <main>
      <section style={{ marginBottom: 40 }}>
        <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 12 }}>Welcome to Sturgeon AI</h1>
        <p style={{ fontSize: 16, color: "#666", lineHeight: 1.6, maxWidth: 700 }}>
          Contract research, proposal drafting, and compliance support for government opportunities. 
          Specialized agents help you research agencies, write technical proposals, check compliance requirements, 
          plan capture strategies, and navigate certifications.
        </p>
      </section>

      <section style={{ marginBottom: 40 }}>
        <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 16 }}>Get Started</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: 20 }}>
          <FeatureCard
            title="Agent Console"
            description="Chat with specialized contracting agents for research, proposals, compliance, and capture strategy."
            href="/agent"
            cta="Start Chat"
          />
          <FeatureCard
            title="Find Opportunities"
            description="Search and track federal contract opportunities that match your capabilities."
            href="/opportunities"
            cta="Browse Opportunities"
          />
          <FeatureCard
            title="Create Proposals"
            description="Draft technical proposals with AI assistance, templates, and compliance checking."
            href="/proposals"
            cta="New Proposal"
          />
        </div>
      </section>

      <section style={{ marginBottom: 40 }}>
        <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 16 }}>Available Agents</h2>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <AgentRow name="Contract Research" description="Opportunity summaries, agency intelligence, next steps" />
          <AgentRow name="Proposal Writer" description="Technical approach, executive summaries, proposal outlines" />
          <AgentRow name="Compliance Checker" description="Extract requirements, build compliance matrices" />
          <AgentRow name="Capture Strategy" description="Win themes, discriminators, competitive positioning" />
          <AgentRow name="Certifications" description="SBA, SDVOSB, WOSB, HUBZone guidance" />
        </div>
      </section>

      <section style={{ padding: 24, backgroundColor: "#f9f9f9", borderRadius: 8, border: "1px solid #e5e5e5" }}>
        <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 8 }}>Ready to win more contracts?</h3>
        <p style={{ fontSize: 14, color: "#666", marginBottom: 16 }}>Start with your first opportunity or proposal.</p>
        <a
          href="/agent"
          style={{
            display: "inline-block",
            padding: "12px 24px",
            backgroundColor: "#0070f3",
            color: "white",
            textDecoration: "none",
            borderRadius: 6,
            fontSize: 14,
            fontWeight: 500
          }}
        >
          Get Started
        </a>
      </section>
    </main>
  );
}

function FeatureCard({ title, description, href, cta }: { title: string; description: string; href: string; cta: string }) {
  return (
    <div style={{ padding: 20, border: "1px solid #ddd", borderRadius: 8, display: "flex", flexDirection: "column" }}>
      <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 8 }}>{title}</h3>
      <p style={{ fontSize: 14, color: "#666", marginBottom: 16, flex: 1 }}>{description}</p>
      <a
        href={href}
        style={{
          display: "inline-block",
          padding: "8px 16px",
          backgroundColor: "#0070f3",
          color: "white",
          textDecoration: "none",
          borderRadius: 4,
          fontSize: 13,
          fontWeight: 500,
          textAlign: "center"
        }}
      >
        {cta}
      </a>
    </div>
  );
}

function AgentRow({ name, description }: { name: string; description: string }) {
  return (
    <div style={{ padding: 12, backgroundColor: "#fafafa", borderRadius: 6, border: "1px solid #eee" }}>
      <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 4 }}>{name}</div>
      <div style={{ fontSize: 13, color: "#666" }}>{description}</div>
    </div>
  );
}
