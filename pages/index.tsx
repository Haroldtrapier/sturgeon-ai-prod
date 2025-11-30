import React from 'react';

export default function Home() {
  return (
    <div style={{ padding: '50px', fontFamily: 'sans-serif' }}>
      <h1>Sturgeon AI is Running 🚀</h1>
      <p>The frontend is successfully deployed.</p>
      <p>Test your API: <a href="/api/status">/api/status</a></p>
    </div>
  );
}
