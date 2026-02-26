import { NextResponse } from 'next/server';
import { OpenAI } from 'openai';
import { Anthropic } from '@anthropic-ai/sdk';

// DEMO MODE CHECK
const DEMO_MODE = process.env.NEXT_PUBLIC_DEMO_MODE === 'true';

// Mock responses for demo mode (no API charges)
const DEMO_RESPONSES = {
  'gpt-4': "📝 **[DEMO MODE - GPT-4]** This is a simulated response. In production, GPT-4 Turbo would provide intelligent analysis of government contracts, proposals, and compliance requirements. To enable real AI responses, set `NEXT_PUBLIC_DEMO_MODE=false` and add your OpenAI API key to `.env.local`.",
  'claude': "📝 **[DEMO MODE - Claude]** This is a simulated response. In production, Claude 3.5 Sonnet would provide cost-effective AI assistance for your government contracting needs. Claude is 3x cheaper than GPT-4 for input tokens! To enable real AI responses, set `NEXT_PUBLIC_DEMO_MODE=false` and add your Anthropic API key to `.env.local`."
};

// Initialize clients (only if not in demo mode)
const openai = !DEMO_MODE && process.env.OPENAI_API_KEY 
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null;

const anthropic = !DEMO_MODE && process.env.ANTHROPIC_API_KEY
  ? new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
  : null;

export async function POST(request: Request) {
  try {
    const { messages, model = 'claude' } = await request.json();

    // DEMO MODE: Return mock response immediately
    if (DEMO_MODE) {
      console.log('🔧 DEMO MODE: Returning mock response for', model);
      return NextResponse.json({
        message: DEMO_RESPONSES[model] || DEMO_RESPONSES['claude'],
        model: model,
        demo: true
      });
    }

    // PRODUCTION MODE: Use real APIs
    const userMessage = messages[messages.length - 1]?.content || '';

    if (model === 'gpt-4') {
      if (!openai) {
        return NextResponse.json(
          { error: 'OpenAI API key not configured. Add OPENAI_API_KEY to .env.local' },
          { status: 500 }
        );
      }

      const completion = await openai.chat.completions.create({
        model: 'gpt-4-turbo-preview',
        messages: [
          {
            role: 'system',
            content: 'You are a government contracting expert assistant. Provide clear, actionable advice on federal contracts, proposals, compliance, and SAM.gov opportunities.'
          },
          ...messages
        ],
        temperature: 0.7,
        max_tokens: 1000,
      });

      return NextResponse.json({
        message: completion.choices[0]?.message?.content || 'No response',
        model: 'gpt-4',
        demo: false
      });
    } 

    else if (model === 'claude') {
      if (!anthropic) {
        return NextResponse.json(
          { error: 'Anthropic API key not configured. Add ANTHROPIC_API_KEY to .env.local' },
          { status: 500 }
        );
      }

      const completion = await anthropic.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 1024,
        messages: [
          ...messages.map((m: any) => ({
            role: m.role,
            content: m.content
          }))
        ],
      });

      return NextResponse.json({
        message: completion.content[0]?.text || 'No response',
        model: 'claude',
        demo: false
      });
    }

    return NextResponse.json(
      { error: 'Invalid model specified' },
      { status: 400 }
    );

  } catch (error: any) {
    console.error('Chat API Error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to process request' },
      { status: 500 }
    );
  }
}
