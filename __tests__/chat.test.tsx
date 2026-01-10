import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import Chat from '../pages/chat'

global.fetch = jest.fn()

jest.mock('next/router', () => ({
  useRouter: () => ({
    push: jest.fn(),
    pathname: '/chat',
    query: {},
    asPath: '/chat',
  }),
}))

describe('Chat Page', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders chat interface', () => {
    render(<Chat />)
    expect(screen.getByText(/AI Chat/i)).toBeInTheDocument()
  })

  it('sends message when form submitted', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ response: 'AI response text' }),
    })

    render(<Chat />)
    
    const input = screen.getByPlaceholderText(/Type your message/i)
    const sendButton = screen.getByRole('button', { name: /send/i })

    fireEvent.change(input, { target: { value: 'Hello AI' } })
    fireEvent.click(sendButton)

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/chat'),
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
          }),
        })
      )
    })
  })

  it('displays error on API failure', async () => {
    (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'))

    render(<Chat />)
    
    const input = screen.getByPlaceholderText(/Type your message/i)
    const sendButton = screen.getByRole('button', { name: /send/i })

    fireEvent.change(input, { target: { value: 'Test message' } })
    fireEvent.click(sendButton)

    await waitFor(() => {
      expect(screen.getByText(/error/i)).toBeInTheDocument()
    })
  })
})
