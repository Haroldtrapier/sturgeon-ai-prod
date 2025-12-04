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

const systemPrompt = `You are Sturgeon AI Assistant, a professional, helpful AI designed to provide accurate information and assist users effectively.`;

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

    let responseText = '';
    let usedProvider = '';

    // Try Claude (Anthropic) first
    if (anthropic) {
      try {
        console.log('Attempting to use Claude (Anthropic)...');

        const anthropicClient = anthropic;
        const anthropicResponse = await anthropicClient.messages.create({
          model: 'claude-3-5-sonnet-20241022',
          max_tokens: 1024,
          messages: [
            {
              role: 'user',
              content: `${systemPrompt}\n\nUser: ${message}`
            }
          ],
        });

        responseText = anthropicResponse.content[0].type === 'text' 
          ? anthropicResponse.content[0].text 
          : '';
        usedProvider = 'Claude (Anthropic)';

        console.log('Successfully used Claude');
      } catch (anthropicError: any) {
        console.error('Claude failed, falling back to OpenAI:', anthropicError.message);

        // Fallback to OpenAI
        if (openai) {
          const openaiResponse = await openai.chat.completions.create({
            model: 'gpt-4-turbo-preview',
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: message }
            ],
            temperature: 0.7,
          });

          responseText = openaiResponse.choices[0]?.message?.content || '';
          usedProvider = 'OpenAI (Fallback)';
          console.log('Successfully used OpenAI as fallback');
        } else {
          throw new Error('Claude failed and OpenAI API key not configured');
        }
      }
    } 
    // If Claude not configured, use OpenAI directly
    else if (openai) {
      console.log('Using OpenAI (Claude not configured)...');

      const openaiResponse = await openai.chat.completions.create({
        model: 'gpt-4-turbo-preview',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: message }
        ],
        temperature: 0.7,
      });

      responseText = openaiResponse.choices[0]?.message?.content || '';
      usedProvider = 'OpenAI';
      console.log('Successfully used OpenAI');
    } 
    else {
      throw new Error('No AI provider configured. Please set ANTHROPIC_API_KEY or OPENAI_API_KEY');
    }

    return res.status(200).json({
      success: true,
      response: responseText,
      provider: usedProvider,
    });
  } catch (error: any) {
    console.error('Chat API error:', error);
    return res.status(500).json({
      error: 'Failed to process chat message',
      details: error.message || 'Unknown error',
    });
  }
}
