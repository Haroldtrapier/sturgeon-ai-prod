import React from "react";

export default function AppPage() {
  return (
    <div>
      <h2>Welcome to Sturgeon AI</h2>
      <p>This is the main app page wrapped in the AppShell layout.</p>
      <div style={{ marginTop: "2rem" }}>
        <h3>Features:</h3>
        <ul>
          <li>App Router enabled</li>
          <li>AppShell layout component</li>
          <li>Modern Next.js 14 structure</li>
        </ul>
      </div>
    </div>
  );
}
