import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import AgentPage from '../app/agent/page'

global.fetch = jest.fn()

describe('AgentPage', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders agent chat interface', () => {
    render(<AgentPage />)
    expect(screen.getByText('AI Assistant (AgentKit)')).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/Ask your AI assistant/i)).toBeInTheDocument()
  })

  it('sends message when button clicked', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ response: 'Test response from agent' }),
    })

    render(<AgentPage />)
    
    const input = screen.getByPlaceholderText(/Ask your AI assistant/i)
    const sendButton = screen.getByText('Send')

    fireEvent.change(input, { target: { value: 'Test message' } })
    fireEvent.click(sendButton)

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/agent/ask'),
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        })
      )
    })
  })

  it('displays error message on API failure', async () => {
    (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('API error'))

    render(<AgentPage />)
    
    const input = screen.getByPlaceholderText(/Ask your AI assistant/i)
    const sendButton = screen.getByText('Send')

    fireEvent.change(input, { target: { value: 'Test message' } })
    fireEvent.click(sendButton)

    await waitFor(() => {
      expect(screen.getByText(/Error connecting to AI agent/i)).toBeInTheDocument()
    })
  })
})
