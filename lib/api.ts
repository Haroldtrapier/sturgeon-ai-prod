type Profile = {
  email: string;
  full_name?: string;
  id: string;
};

class API {
  private baseUrl: string;

  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_API_URL || '';
  }

  async getProfile(): Promise<Profile> {
    // Mock implementation - returns dummy data
    // In a real application, this would make an API call
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          email: 'user@sturgeonai.com',
          full_name: 'John Doe',
          id: '123e4567-e89b-12d3-a456-426614174000',
        });
      }, 500);
    });
  }
}

export const APIClient = new API();
