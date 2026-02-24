const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://sturgeonai.org/api';

export interface APIResponse<T> {
  data?: T;
  error?: string;
  success: boolean;
}

class APIClient {
  private baseURL: string;

  constructor(baseURL: string = API_BASE_URL) {
    this.baseURL = baseURL;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<APIResponse<T>> {
    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        ...options,
        headers: {'Content-Type': 'application/json', ...options.headers},
      });
      const data = await response.json();
      if (!response.ok) return { success: false, error: data.message || 'Request failed' };
      return { success: true, data };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Network error' };
    }
  }

  async getOpportunities(params?: { search?: string; limit?: number }) {
    const query = new URLSearchParams(params as any).toString();
    return this.request(`/opportunities?${query}`);
  }

  async getOpportunityById(id: string) { return this.request(`/opportunities/${id}`); }
  async getProposals() { return this.request('/proposals'); }
  async createProposal(data: any) { return this.request('/proposals', { method: 'POST', body: JSON.stringify(data) }); }
  async sendMessage(message: string) { return this.request('/chat', { method: 'POST', body: JSON.stringify({ message }) }); }
  async getAnalytics() { return this.request('/analytics'); }
  async getMarketIntel() { return this.request('/market-intelligence'); }
}

export const apiClient = new APIClient();
export default apiClient;