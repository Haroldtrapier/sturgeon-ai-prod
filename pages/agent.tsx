import { useState } from 'react'

type ChatMessage = { id: string; role: 'user' | 'assistant'; content: string }

export default function AgentPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const sendMessage = async () => {
    if (!input.trim()) return
    const newMessage: ChatMessage = { id: crypto.randomUUID(), role: 'user', content: input }
    setMessages((prev) => [...prev, newMessage])
    setInput('')
    setIsLoading(true)

    try {
      const res = await fetch('/api/agent/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: newMessage.content }),
      })

      if (!res.ok) {
        // Handle error responses
        const errorText = await res.text()
        let errorMessage = 'Sorry, I encountered an error processing your request.'
        try {
          const errorJson = JSON.parse(errorText)
          if (errorJson.error) {
            errorMessage = errorJson.error
          }
          if (errorJson.details) {
            errorMessage += ': ' + errorJson.details
          }
        } catch {
          // If not JSON, use the text directly or default message
          errorMessage = errorText || errorMessage
        }
        setMessages((prev) => [...prev, { id: crypto.randomUUID(), role: 'assistant', content: errorMessage }])
        setIsLoading(false)
        return
      }

      if (!res.body) {
        setMessages((prev) => [...prev, { id: crypto.randomUUID(), role: 'assistant', content: 'Error: No response from server.' }])
        setIsLoading(false)
        return
      }

      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let assistantContent = ''
      const assistantMessageId = crypto.randomUUID()

      while (true) {
        const { value, done } = await reader.read()
        if (done) break
        assistantContent += decoder.decode(value, { stream: true })
        setMessages((prev) => {
          const copy = [...prev]
          const last = copy[copy.length - 1]
          if (last && last.role === 'assistant' && last.id === assistantMessageId) {
            last.content = assistantContent
            return copy
          }
          return [...copy, { id: assistantMessageId, role: 'assistant', content: assistantContent }]
        })
      }

      setIsLoading(false)
    } catch (error) {
      console.error('Error sending message:', error)
      setMessages((prev) => [...prev, { id: crypto.randomUUID(), role: 'assistant', content: 'Sorry, I encountered an error. Please try again.' }])
      setIsLoading(false)
    }
  }

  return (
    <div className="flex flex-col h-screen max-w-3xl mx-auto py-8">
      <h1 className="text-2xl font-semibold mb-4">Sturgeon AI Assistant</h1>
      <div className="flex-1 border rounded-md p-4 overflow-y-auto space-y-3 bg-gray-50">
        {messages.map((m) => (
          <div key={m.id} className={m.role === 'user' ? 'text-right' : 'text-left'}>
            <div
              className={
                'inline-block px-3 py-2 rounded-lg ' +
                (m.role === 'user' ? 'bg-blue-600 text-white' : 'bg-white text-gray-900 border border-gray-200')
              }
            >
              {m.content}
            </div>
          </div>
        ))}
        {isLoading && <div className="text-sm text-gray-600">Assistant is thinking…</div>}
      </div>
      <div className="mt-4 flex gap-2">
        <input
          className="flex-1 border border-gray-300 rounded-md px-3 py-2"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault()
              sendMessage()
            }
          }}
          placeholder="Ask Sturgeon AI about your opportunities, proposals, or strategy…"
        />
        <button
          onClick={sendMessage}
          className="px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={isLoading}
        >
          Send
        </button>
      </div>
    </div>
  )
}
