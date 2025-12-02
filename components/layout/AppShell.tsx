"use client";

import React from "react";

interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="app-shell">
      <header className="app-header">
        <h1>Sturgeon AI</h1>
      </header>
      <main className="app-main">{children}</main>
      <footer className="app-footer">
        <p>&copy; {new Date().getFullYear()} Sturgeon AI</p>
      </footer>
      <style jsx>{`
        .app-shell {
          display: flex;
          flex-direction: column;
          min-height: 100vh;
        }
        .app-header {
          background-color: #0070f3;
          color: white;
          padding: 1rem 2rem;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }
        .app-header h1 {
          margin: 0;
          font-size: 1.5rem;
        }
        .app-main {
          flex: 1;
          padding: 2rem;
        }
        .app-footer {
          background-color: #f5f5f5;
          padding: 1rem 2rem;
          text-align: center;
          border-top: 1px solid #e0e0e0;
        }
        .app-footer p {
          margin: 0;
          color: #666;
          font-size: 0.875rem;
        }
      `}</style>
    </div>
  );
}
