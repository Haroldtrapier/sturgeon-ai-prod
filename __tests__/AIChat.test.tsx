import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import AIChat from '../components/AIChat'

global.fetch = jest.fn()

describe('AIChat Component', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders chat input', () => {
    render(<AIChat />)
    expect(screen.getByPlaceholderText(/message/i)).toBeInTheDocument()
  })

  it('displays chat history', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ response: 'Test response' }),
    })

    render(<AIChat />)
    
    const input = screen.getByPlaceholderText(/message/i)
    fireEvent.change(input, { target: { value: 'Hello' } })
    
    const form = input.closest('form')
    if (form) {
      fireEvent.submit(form)
    }
  })

  it('handles empty message submission', () => {
    render(<AIChat />)
    
    const input = screen.getByPlaceholderText(/message/i)
    const form = input.closest('form')
    
    if (form) {
      fireEvent.submit(form)
    }
    
    // Empty messages should not trigger API call
    expect(global.fetch).not.toHaveBeenCalled()
  })
})
