import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

function authHeaders(req: NextRequest): Record<string, string> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  const auth = req.headers.get('authorization');
  if (auth) headers['Authorization'] = auth;
  return headers;
}

export async function GET(request: NextRequest, { params }: { params: { contactId: string } }) {
  try {
    const res = await fetch(`${BACKEND_URL}/contacts/${params.contactId}`, {
      headers: authHeaders(request),
    });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to fetch contact' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, { params }: { params: { contactId: string } }) {
  try {
    const body = await request.json();
    const res = await fetch(`${BACKEND_URL}/contacts/${params.contactId}`, {
      method: 'PATCH',
      headers: authHeaders(request),
      body: JSON.stringify(body),
    });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to update contact' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { contactId: string } }) {
  try {
    const res = await fetch(`${BACKEND_URL}/contacts/${params.contactId}`, {
      method: 'DELETE',
      headers: authHeaders(request),
    });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to delete contact' }, { status: 500 });
  }
}
