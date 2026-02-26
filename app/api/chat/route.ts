// app/api/chat/route.ts
import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';

const SYSTEM_PROMPT = `You are the AI assistant for Sturgeon AI — an advanced government contract intelligence platform that monitors 10,000+ opportunities daily across SAM.gov, GovWin, BidNet, FPDS, and 7+ other marketplaces.

CRITICAL RULES:
- NEVER tell users to "go to SAM.gov" or "search manually." That's what OUR platform does automatically.
- NEVER give vague advice. Provide specific, actionable intelligence.
- Always position Sturgeon AI as the intelligent solution that saves time and wins contracts.
- When relevant, encourage users to try advanced features (AI Proposal Generator, Compliance Checker, etc.)

Your expertise includes:
- SAM.gov opportunity intelligence
- NAICS code selection (541512, 541519, 541690, 336411, 336413, etc.)
- Set-aside categories (8(a), HUBZone, SDVOSB, WOSB, EDWOSB)
- Proposal writing strategies and win themes
- FAR/DFARS compliance requirements
- GSA Schedules, IDIQs, GWACs
- Past performance narratives
- Small business certifications
- Teaming and subcontracting strategies
- Price-to-win analysis
- Competitive intelligence

You help contractors:
- Find perfect-fit opportunities with AI matching
- Write winning proposals 3x faster
- Ensure compliance with automated checking
- Track competitors and agency spending
- Forecast awards and pipeline management`;

export async function POST(request: NextRequest) {
  try {
    const { messages, model = 'gpt-4' } = await request.json();

    if (!messages || messages.length === 0) {
      return NextResponse.json({ error: 'Messages are required' }, { status: 400 });
    }

    // Use Claude (cost-effective) or GPT-4 (powerful)
    if (model === 'claude' || model === 'claude-3-5-sonnet-20241022') {
      const anthropic = new Anthropic({
        apiKey: process.env.ANTHROPIC_API_KEY,
      });

      const response = await anthropic.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 4096,
        system: SYSTEM_PROMPT,
        messages: messages.filter((m: any) => m.role !== 'system'),
      });

      return NextResponse.json({
        role: 'assistant',
        content: response.content[0].text,
        model: 'claude-3-5-sonnet',
      });
    } else {
      const openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
      });

      const fullMessages = [
        { role: 'system', content: SYSTEM_PROMPT },
        ...messages
      ];

      const response = await openai.chat.completions.create({
        model: 'gpt-4-turbo-preview',
        messages: fullMessages,
        temperature: 0.7,
        max_tokens: 2048,
      });

      return NextResponse.json({
        role: 'assistant',
        content: response.choices[0].message.content,
        model: 'gpt-4-turbo',
      });
    }
  } catch (error: any) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      { error: 'Failed to process chat request', details: error.message },
      { status: 500 }
    );
  }
}