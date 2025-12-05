import type { Opportunity } from './types';

/**
 * Search for opportunities on SAM.gov
 * 
 * @param params - Search parameters including query and optional NAICS code
 * @returns Array of opportunities matching the search criteria
 */
export async function searchSam(params: {
  query: string;
  naics?: string;
}): Promise<Opportunity[]> {
  try {
    const apiKey = process.env.SAM_GOV_API_KEY || process.env.NEXT_PUBLIC_SAM_GOV_API_KEY;
    
    if (!apiKey) {
      console.warn('SAM.gov API key not configured. Returning empty results.');
      return [];
    }

    const baseUrl = 'https://api.sam.gov/opportunities/v2/search';
    
    // Build query parameters
    const searchParams: Record<string, string> = {
      api_key: apiKey,
      limit: '50',
      keywords: params.query,
    };

    // Add NAICS code filter if provided
    if (params.naics) {
      searchParams.naicsCode = params.naics;
    }

    // Add posted date filter (opportunities from the last 30 days)
    // Format: MM/DD/YYYY to match Python backend format
    const postedFrom = new Date();
    postedFrom.setDate(postedFrom.getDate() - 30);
    const month = (postedFrom.getMonth() + 1).toString().padStart(2, '0');
    const day = postedFrom.getDate().toString().padStart(2, '0');
    const year = postedFrom.getFullYear();
    searchParams.postedFrom = `${month}/${day}/${year}`;

    const url = new URL(baseUrl);
    Object.entries(searchParams).forEach(([key, value]) => {
      url.searchParams.append(key, value);
    });

    // Set up abort controller for request timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      console.error(`SAM.gov API error: ${response.status} ${response.statusText}`);
      return [];
    }

    const data = await response.json();
    
    // Return the opportunities array from the response
    return data.opportunitiesData || [];
  } catch (error) {
    if (error instanceof Error) {
      console.error('Error searching SAM.gov:', error.message);
    } else {
      console.error('Unknown error searching SAM.gov:', error);
    }
    return [];
  }
}
