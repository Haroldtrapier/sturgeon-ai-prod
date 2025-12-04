import OpenAI from 'openai';
import type { NextApiRequest, NextApiResponse } from 'next';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { messages } = req.body ?? {};

  if (!Array.isArray(messages)) {
    return res.status(400).json({ error: 'Invalid request body: messages array required' });
  }

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        {
          role: 'system',
          content:
            'You are Sturgeon AI Assistant, an AI designed to provide accurate, helpful information and support within a Next.js chat interface. Maintain a professional, courteous tone while addressing user queries.',
        },
        ...messages,
      ],
      stream: true,
    });

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    const encoder = new TextEncoder();

    for await (const chunk of completion) {
      const content = chunk.choices[0].delta?.content;
      if (content) {
        res.write(encoder.encode(`data: ${content}\n\n`));
      }
    }

    res.write(encoder.encode('data: [DONE]\n\n'));
    res.end();
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}