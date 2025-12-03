interface CheckoutSessionParams {
  price_id: string;
  success_url: string;
  cancel_url: string;
}

interface CheckoutSession {
  url: string;
}

export class APIClient {
  private static baseUrl = process.env.NEXT_PUBLIC_API_URL || '/api';

  static async createCheckoutSession(
    params: CheckoutSessionParams
  ): Promise<CheckoutSession> {
    const response = await fetch(`${this.baseUrl}/checkout/create-session`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Failed to create checkout session' }));
      throw new Error(error.message || 'Failed to create checkout session');
    }

    return response.json();
  }
}
