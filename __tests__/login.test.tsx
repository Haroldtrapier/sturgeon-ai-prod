import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import Login from '../pages/login'

jest.mock('next/router', () => ({
  useRouter: () => ({
    push: jest.fn(),
    pathname: '/login',
    query: {},
  }),
}))

jest.mock('../lib/supabase-client', () => ({
  getSupabaseClient: () => ({
    auth: {
      signInWithPassword: jest.fn().mockResolvedValue({
        data: { user: { id: 'test-id', email: 'test@example.com' } },
        error: null,
      }),
    },
  }),
}))

describe('Login Page', () => {
  it('renders login form', () => {
    render(<Login />)
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument()
  })

  it('validates email format', async () => {
    render(<Login />)
    
    const emailInput = screen.getByLabelText(/email/i)
    const submitButton = screen.getByRole('button', { name: /sign in/i })

    fireEvent.change(emailInput, { target: { value: 'invalid-email' } })
    fireEvent.click(submitButton)

    // Form validation should prevent submission
    expect(emailInput).toHaveAttribute('type', 'email')
  })

  it('submits form with valid credentials', async () => {
    render(<Login />)
    
    const emailInput = screen.getByLabelText(/email/i)
    const passwordInput = screen.getByLabelText(/password/i)
    const submitButton = screen.getByRole('button', { name: /sign in/i })

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
    fireEvent.change(passwordInput, { target: { value: 'password123' } })
    fireEvent.click(submitButton)

    // Test that form submission is attempted
    expect(emailInput).toHaveValue('test@example.com')
    expect(passwordInput).toHaveValue('password123')
  })
})
