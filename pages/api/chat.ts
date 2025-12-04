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

  try {
    const { messages } = req.body;

    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'Invalid request: "messages" array is required.' });
    }

    // Set headers for streaming (Server‑Sent Events)
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    const stream = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        {
          role: 'system',
          content:
            'You are Sturgeon AI Assistant, a professional, helpful AI designed to provide accurate information and support users within the Next.js chat interface. Your role is to answer questions clearly, stay on topic, and maintain a courteous tone.',
        },
        ...messages,
      ],
      stream: true,
    });

    // Forward OpenAI stream chunks to the client as SSE
    for await (const chunk of stream) {
      const data = JSON.stringify(chunk);
      res.write(`data: ${data}\n\n`);
    }

    // Signal end of stream
    res.write('event: done\n\n');
    res.end();
  } catch (error: any) {
    console.error('Chat API error:', error);
    if (!res.headersSent) {
      res.status(500).json({ error: 'Internal Server Error' });
    } else {
      // If headers already sent, just close the connection
      res.end();
    }
  }
}