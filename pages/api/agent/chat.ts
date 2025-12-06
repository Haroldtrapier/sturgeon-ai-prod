import type { NextApiRequest, NextApiResponse } from 'next';
import Anthropic from '@anthropic-ai/sdk';
import OpenAI from 'openai';

// Initialize both AI clients
const anthropic = process.env.ANTHROPIC_API_KEY 
  ? new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
  : null;

const openai = process.env.OPENAI_API_KEY
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null;

const systemPrompt = `You are Sturgeon AI Assistant, a professional AI assistant helping with opportunities, proposals, and strategy. Provide clear, actionable advice.`;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { message } = req.body;

    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'Message is required' });
    }

    // Set headers for streaming
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.setHeader('Transfer-Encoding', 'chunked');

    // Try Claude (Anthropic) with streaming first
    if (anthropic) {
      try {
        console.log('Attempting to use Claude (Anthropic) with streaming...');

        const stream = await anthropic.messages.stream({
          model: 'claude-3-5-sonnet-20241022',
          max_tokens: 1024,
          messages: [
            {
              role: 'user',
              content: `${systemPrompt}\n\nUser: ${message}`
            }
          ],
        });

        for await (const chunk of stream) {
          if (chunk.type === 'content_block_delta' && chunk.delta.type === 'text_delta') {
            res.write(chunk.delta.text);
          }
        }

        res.end();
        console.log('Successfully used Claude with streaming');
        return;
      } catch (anthropicError: any) {
        console.error('Claude failed, falling back to OpenAI:', anthropicError.message);
        
        // If we've already started streaming, we can't fallback
        if (res.headersSent) {
          res.end();
          return;
        }
      }
    }

    // Fallback to OpenAI with streaming
    if (openai) {
      console.log('Using OpenAI with streaming...');

      const stream = await openai.chat.completions.create({
        model: 'gpt-4-turbo-preview',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: message }
        ],
        temperature: 0.7,
        stream: true,
      });

      for await (const chunk of stream) {
        const content = chunk.choices[0]?.delta?.content;
        if (content) {
          res.write(content);
        }
      }

      res.end();
      console.log('Successfully used OpenAI with streaming');
      return;
    }

    throw new Error('No AI provider configured. Please set ANTHROPIC_API_KEY or OPENAI_API_KEY');
  } catch (error: any) {
    console.error('Chat API error:', error);
    
    if (!res.headersSent) {
      return res.status(500).json({
        error: 'Failed to process chat message',
        details: error.message || 'Unknown error',
      });
    }
    
    res.end();
  }
}
