import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const keywords = searchParams.get('keywords') || searchParams.get('q') || '';
    const limit = searchParams.get('limit') || '50';
    
    // Forward to Railway backend SAM search endpoint
    const response = await fetch(`${BACKEND_URL}/sam/search`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(request.headers.get('authorization') && {
          'Authorization': request.headers.get('authorization')!,
        }),
      },
      body: JSON.stringify({
        keywords,
        limit: parseInt(limit),
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Backend error' }));
      return NextResponse.json(
        { error: errorData.detail || errorData.error || `Backend error: ${response.statusText}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    
    // Normalize response format
    return NextResponse.json({
      opportunities: data.opportunities || data.results || [],
      total: data.total || data.count || 0,
      source: 'sam.gov'
    });
    
  } catch (error: any) {
    console.error('Opportunities search error:', error);
    return NextResponse.json(
      { 
        error: error.message || 'Failed to search opportunities',
        opportunities: [],
        total: 0
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Forward to Railway backend
    const response = await fetch(`${BACKEND_URL}/sam/search`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(request.headers.get('authorization') && {
          'Authorization': request.headers.get('authorization')!,
        }),
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Backend error' }));
      return NextResponse.json(
        { error: errorData.detail || errorData.error || `Backend error: ${response.statusText}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
    
  } catch (error: any) {
    console.error('Opportunities search error:', error);
    return NextResponse.json(
      { 
        error: error.message || 'Failed to search opportunities',
        opportunities: [],
        total: 0
      },
      { status: 500 }
    );
  }
}
