import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({ 
    ok: true, 
    service: 'sturgeon-ai-frontend',
    timestamp: new Date().toISOString(),
    env: {
      hasSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      hasSupabaseKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      hasBackendUrl: !!(process.env.BACKEND_URL || process.env.NEXT_PUBLIC_API_URL),
    }
  });
}
