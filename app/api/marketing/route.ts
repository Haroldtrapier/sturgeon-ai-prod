// app/api/marketing/route.ts
import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

export async function POST(request: NextRequest) {
  try {
    const { contentType, tone, topic } = await request.json();

    if (!topic) {
      return NextResponse.json({ error: 'Topic is required' }, { status: 400 });
    }

    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const prompt = `Generate ${contentType} content about: ${topic}

Tone: ${tone}
Industry: Government Contracting
Platform: Sturgeon AI - AI-powered contract intelligence

Requirements:
- Make it compelling and conversion-focused
- Include specific details about government contracting
- Highlight Sturgeon AI's capabilities (AI matching, 11 marketplaces, 98.5% accuracy, $2.3B+ won)
- Professional formatting
- Call-to-action when appropriate

Generate high-quality ${contentType} now:`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        { role: 'system', content: 'You are an expert marketing content writer for government contracting SaaS.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.8,
      max_tokens: 2048,
    });

    return NextResponse.json({
      content: response.choices[0].message.content,
      contentType,
      tone,
    });
  } catch (error: any) {
    console.error('Marketing API error:', error);
    return NextResponse.json(
      { error: 'Failed to generate content', details: error.message },
      { status: 500 }
    );
  }
}