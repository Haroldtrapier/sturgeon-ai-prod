import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';

export async function POST(req: Request) {
  try {
    const { message, context, agentType, systemPrompt } = await req.json();

    if (!message) {
      return NextResponse.json({ error: 'Missing message' }, { status: 400 });
    }

    // Verify authenticated user
    const cookieStore = cookies();
    const supabase = createClient(cookieStore);
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Call backend agent service
    const backendUrl = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_API_URL;
    
    if (!backendUrl) {
      // Fallback: simple echo response if backend not configured
      console.warn('BACKEND_URL not set, using fallback response');
      return NextResponse.json({ 
        reply: `I received your message: "${message}". The AI backend is not yet configured. Please set BACKEND_URL environment variable.`,
        fallback: true
      });
    }

    // Forward to backend agent with specialized agent info
    const backendResponse = await fetch(`${backendUrl}/agent/chat`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${user.id}` // Pass user ID for context
      },
      body: JSON.stringify({ 
        message, 
        context: {
          ...context,
          agentType: agentType || 'general',
          systemPrompt: systemPrompt || 'You are a helpful AI assistant for Sturgeon AI.'
        },
        userId: user.id 
      }),
    });

    if (!backendResponse.ok) {
      const errorData = await backendResponse.json().catch(() => ({}));
      return NextResponse.json({ 
        error: errorData?.error ?? 'Agent service failed',
        status: backendResponse.status 
      }, { status: backendResponse.status });
    }

    const data = await backendResponse.json();
    return NextResponse.json({ 
      reply: data.reply || data.response || 'No response from agent',
      agentType: agentType || 'general',
      ...data
    });

  } catch (err: any) {
    console.error('Agent error:', err);
    return NextResponse.json({ 
      error: err?.message ?? 'Agent request failed',
      details: err?.cause?.message
    }, { status: 500 });
  }
}
