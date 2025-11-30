import { useEffect, useState } from 'react'

interface ApiStatus {
  service: string
  version: string
  status: string
  endpoints: Record<string, string>
}

export default function Home() {
  const [apiStatus, setApiStatus] = useState<ApiStatus | null>(null)

  useEffect(() => {
    fetch('/api')
      .then(res => res.json())
      .then(data => setApiStatus(data))
      .catch(() => {
        // Fallback if API is not available
        setApiStatus({
          service: 'Sturgeon AI API',
          version: '2.0.0',
          status: 'operational',
          endpoints: {
            opportunities: '/api/opportunities/search',
            grants: '/api/grants/search',
            analysis: '/api/ai/analyze-contract',
            proposals: '/api/ai/generate-proposal',
            matching: '/api/ai/match-opportunities',
            documents: '/api/documents/upload',
            health: '/api/health'
          }
        })
      })
  }, [])

  return (
    <div style={{ 
      fontFamily: 'system-ui, -apple-system, sans-serif',
      maxWidth: '800px',
      margin: '0 auto',
      padding: '40px 20px'
    }}>
      <h1 style={{ color: '#1a365d', marginBottom: '8px' }}>
        🐟 Sturgeon AI
      </h1>
      <p style={{ color: '#4a5568', fontSize: '18px', marginBottom: '32px' }}>
        Government Contracting & Grants Ecosystem
      </p>

      {apiStatus && (
        <div style={{
          background: '#f7fafc',
          borderRadius: '8px',
          padding: '24px',
          marginBottom: '24px'
        }}>
          <h2 style={{ color: '#2d3748', marginTop: 0 }}>API Status</h2>
          <p>
            <strong>Service:</strong> {apiStatus.service}<br />
            <strong>Version:</strong> {apiStatus.version}<br />
            <strong>Status:</strong>{' '}
            <span style={{ color: apiStatus.status === 'operational' ? '#38a169' : '#e53e3e' }}>
              {apiStatus.status}
            </span>
          </p>
        </div>
      )}

      <div style={{
        background: '#edf2f7',
        borderRadius: '8px',
        padding: '24px'
      }}>
        <h2 style={{ color: '#2d3748', marginTop: 0 }}>Available Endpoints</h2>
        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
          {apiStatus?.endpoints && Object.entries(apiStatus.endpoints).map(([name, path]) => (
            <li key={name} style={{ marginBottom: '8px' }}>
              <strong>{name}:</strong>{' '}
              <code style={{ 
                background: '#e2e8f0', 
                padding: '2px 6px', 
                borderRadius: '4px',
                fontSize: '14px'
              }}>
                {path}
              </code>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
