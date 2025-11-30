import type { NextPage } from 'next'

const Home: NextPage = () => {
  return (
    <div style={{ 
      fontFamily: 'system-ui, -apple-system, sans-serif',
      padding: '2rem',
      maxWidth: '800px',
      margin: '0 auto'
    }}>
      <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>
        Sturgeon AI
      </h1>
      <p style={{ fontSize: '1.2rem', color: '#666', marginBottom: '2rem' }}>
        AI-powered government contracting platform
      </p>
      <div style={{ 
        background: '#f5f5f5', 
        padding: '1.5rem', 
        borderRadius: '8px' 
      }}>
        <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>
          Available API Endpoints
        </h2>
        <ul style={{ listStyle: 'none', padding: 0 }}>
          <li style={{ padding: '0.5rem 0' }}>
            <code>/api</code> - API Status
          </li>
          <li style={{ padding: '0.5rem 0' }}>
            <code>/api/opportunities/search</code> - Search Opportunities
          </li>
          <li style={{ padding: '0.5rem 0' }}>
            <code>/api/grants/search</code> - Search Grants
          </li>
          <li style={{ padding: '0.5rem 0' }}>
            <code>/api/ai/analyze-contract</code> - Analyze Contracts
          </li>
          <li style={{ padding: '0.5rem 0' }}>
            <code>/api/ai/generate-proposal</code> - Generate Proposals
          </li>
          <li style={{ padding: '0.5rem 0' }}>
            <code>/api/ai/match-opportunities</code> - Match Opportunities
          </li>
          <li style={{ padding: '0.5rem 0' }}>
            <code>/api/documents/upload</code> - Upload Documents
          </li>
          <li style={{ padding: '0.5rem 0' }}>
            <code>/api/health</code> - Health Check
          </li>
        </ul>
      </div>
    </div>
  )
}

export default Home
