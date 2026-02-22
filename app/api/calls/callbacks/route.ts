import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export async function GET(request: NextRequest) {
  try {
    const headers: Record<string, string> = {};
    const auth = request.headers.get('authorization');
    if (auth) headers['Authorization'] = auth;

    const res = await fetch(`${BACKEND_URL}/calls/callbacks`, { headers });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to fetch callbacks' }, { status: 500 });
  }
}
