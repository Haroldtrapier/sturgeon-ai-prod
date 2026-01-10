import { APIClient } from '../lib/api'

global.fetch = jest.fn()

describe('APIClient', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('searches opportunities', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true, opportunities: [] }),
    })

    const result = await APIClient.searchOpportunities(['software'], {})
    
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/opportunities/search'),
      expect.objectContaining({
        method: 'POST',
      })
    )
    expect(result.success).toBe(true)
  })

  it('analyzes contract text', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true, analysis: {} }),
    })

    const result = await APIClient.analyzeContract('Test contract text')
    
    expect(result.success).toBe(true)
  })

  it('handles API errors', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 500,
    })

    await expect(APIClient.getProfile()).rejects.toThrow('API error: 500')
  })
})
