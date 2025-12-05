import React from 'react';

export default function Home() {
  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      height: '100vh', 
      fontFamily: 'sans-serif',
      flexDirection: 'column'
    }}>
      <h1>✅ Sturgeon AI is Live!</h1>
      <p>The frontend is successfully connected to Vercel.</p>
      
      <div style={{ marginTop: '20px', padding: '20px', border: '1px solid #ccc', borderRadius: '8px' }}>
        <h3>API Status:</h3>
        <ul>
          <li>
            {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
            <a href="/api">Check API Status (/api)</a>
          </li>
        </ul>
      </div>
    </div>
  );
}
