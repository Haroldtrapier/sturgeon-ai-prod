import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import Dashboard from '../pages/dashboard'

// Mock Next.js router
jest.mock('next/router', () => ({
  useRouter: () => ({
    push: jest.fn(),
    pathname: '/dashboard',
    query: {},
    asPath: '/dashboard',
  }),
}))

// Mock Supabase client
jest.mock('../lib/supabase-client', () => ({
  getSupabaseClient: () => ({
    auth: {
      getUser: jest.fn().mockResolvedValue({
        data: {
          user: {
            id: 'test-user-id',
            email: 'test@example.com',
            created_at: '2026-01-01T00:00:00Z',
            user_metadata: { full_name: 'Test User' },
          },
        },
        error: null,
      }),
      onAuthStateChange: jest.fn(() => ({
        data: { subscription: { unsubscribe: jest.fn() } },
      })),
    },
  }),
}))

describe('Dashboard', () => {
  it('renders loading state initially', () => {
    render(<Dashboard />)
    expect(screen.getByText('Loading...')).toBeInTheDocument()
  })
})
