import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (!authHeader) {
    return NextResponse.json({ count: 0, unread_count: 0 });
  }

  try {
    const response = await fetch(`${BACKEND_URL}/api/notifications/unread-count`, {
      headers: { Authorization: authHeader },
    });

    if (!response.ok) {
      return NextResponse.json({ count: 0, unread_count: 0 });
    }

    const data = await response.json();
    return NextResponse.json({ count: data.unread_count || 0, unread_count: data.unread_count || 0 });
  } catch {
    return NextResponse.json({ count: 0, unread_count: 0 });
  }
}
