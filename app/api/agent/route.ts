import { NextRequest, NextResponse } from 'next/server';

// Get the backend URL from environment variables
const BACKEND_URL = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Transform request body to match backend expected format
    const backendPayload = {
      message: body.message,
      context: {
        agentType: body.agentType || 'general',
        systemPrompt: body.systemPrompt,
        ...(body.context || {})
      },
      userId: body.userId
    };
    
    // Forward the request to the Railway backend
    const response = await fetch(`${BACKEND_URL}/agent/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Forward authorization header if present
        ...(request.headers.get('authorization') && {
          'Authorization': request.headers.get('authorization')!,
        }),
      },
      body: JSON.stringify(backendPayload),
    });

    // Check if the response is ok
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
      return NextResponse.json(
        { error: errorData.error || errorData.detail || `Backend error: ${response.statusText}` },
        { status: response.status }
      );
    }

    // Parse and return the backend response
    const data = await response.json();
    return NextResponse.json(data);
    
  } catch (error: any) {
    console.error('API route error:', error);
    return NextResponse.json(
      { 
        error: error.message || 'Failed to connect to AI backend',
        reply: 'I apologize, but I\'m having trouble connecting to the AI service. Please try again in a moment.',
        details: `Backend URL: ${BACKEND_URL}/agent/chat`
      },
      { status: 500 }
    );
  }
}