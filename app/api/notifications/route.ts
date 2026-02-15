import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/client';

const BACKEND_URL = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

async function proxyToBackend(path: string, request: NextRequest, options?: { method?: string }) {
  const authHeader = request.headers.get('authorization');

  // If no auth header, try to get session from Supabase
  let token = authHeader;
  if (!token) {
    const userId = request.nextUrl.searchParams.get('userId');
    if (!userId) {
      return NextResponse.json({ notifications: [], unread_count: 0 });
    }
    // Without a token, we can't call the backend - return empty
    return NextResponse.json({ notifications: [], unread_count: 0 });
  }

  const response = await fetch(`${BACKEND_URL}/api/notifications${path}`, {
    method: options?.method || 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: token,
    },
  });

  if (!response.ok) {
    return NextResponse.json({ error: 'Backend error' }, { status: response.status });
  }

  const data = await response.json();
  return NextResponse.json(data);
}

export async function GET(request: NextRequest) {
  const unreadOnly = request.nextUrl.searchParams.get('unread_only') || 'false';
  return proxyToBackend(`?unread_only=${unreadOnly}`, request);
}
