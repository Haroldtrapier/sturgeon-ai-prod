import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Forward SAM.gov search request to Railway backend
    const response = await fetch(`${BACKEND_URL}/sam/search`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Forward authorization if present
        ...(request.headers.get('authorization') && {
          'Authorization': request.headers.get('authorization')!,
        }),
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
      return NextResponse.json(
        { error: errorData.detail || errorData.error || `Backend error: ${response.statusText}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
    
  } catch (error: any) {
    console.error('SAM.gov search API error:', error);
    return NextResponse.json(
      { 
        error: error.message || 'Failed to search SAM.gov',
        details: `Backend URL: ${BACKEND_URL}/sam/search`
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  // Support GET requests with query parameters
  const searchParams = request.nextUrl.searchParams;
  const keywords = searchParams.get('keywords') || searchParams.get('q');
  
  if (!keywords) {
    return NextResponse.json(
      { error: 'Missing required parameter: keywords' },
      { status: 400 }
    );
  }
  
  const searchRequest = {
    keywords,
    limit: parseInt(searchParams.get('limit') || '10'),
    postedFrom: searchParams.get('postedFrom'),
    postedTo: searchParams.get('postedTo'),
    responseDeadlineFrom: searchParams.get('responseDeadlineFrom'),
    responseDeadlineTo: searchParams.get('responseDeadlineTo'),
    noticeType: searchParams.get('noticeType'),
    organizationId: searchParams.get('organizationId'),
  };
  
  try {
    const response = await fetch(`${BACKEND_URL}/sam/search`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(request.headers.get('authorization') && {
          'Authorization': request.headers.get('authorization')!,
        }),
      },
      body: JSON.stringify(searchRequest),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
      return NextResponse.json(
        { error: errorData.detail || errorData.error || `Backend error: ${response.statusText}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
    
  } catch (error: any) {
    console.error('SAM.gov search API error:', error);
    return NextResponse.json(
      { 
        error: error.message || 'Failed to search SAM.gov',
        details: `Backend URL: ${BACKEND_URL}/sam/search`
      },
      { status: 500 }
    );
  }
}