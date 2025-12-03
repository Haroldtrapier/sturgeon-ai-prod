type Profile = {
  email: string;
  full_name?: string;
  id: string;
};

export class APIClient {
  private static baseURL = process.env.NEXT_PUBLIC_API_URL || '/api';

  static async getProfile(): Promise<Profile> {
    try {
      const response = await fetch(`${this.baseURL}/profile`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch profile: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching profile:', error);
      throw error;
    }
  }
}
