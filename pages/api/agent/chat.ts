import { NextApiRequest, NextApiResponse } from "next";

interface Message {
  role: string;
  content: string;
}

interface ChatRequest {
  message: string;
  history: Message[];
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { message, history } = req.body as ChatRequest;

    if (!message || typeof message !== "string") {
      return res.status(400).json({ error: "Message is required" });
    }

    // Get OpenAI API key from environment
    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
      console.warn("OPENAI_API_KEY not configured, using mock response");
      return res.status(200).json({
        response: "I'm an AI assistant ready to help! (OpenAI API key not configured yet)",
      });
    }

    // Build the messages array for OpenAI
    const messages = [
      {
        role: "system",
        content: "You are Sturgeon AI, an intelligent assistant specialized in government contracting, grants, and proposal generation. You help users navigate federal opportunities, analyze contracts, and provide strategic advice.",
      },
      ...(history || []),
      {
        role: "user",
        content: message,
      },
    ];

    // Call OpenAI API
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: messages,
        temperature: 0.7,
        max_tokens: 500,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("OpenAI API error:", errorData);
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const assistantMessage = data.choices?.[0]?.message?.content;

    if (!assistantMessage) {
      throw new Error("No response from OpenAI");
    }

    return res.status(200).json({
      response: assistantMessage,
    });
  } catch (error) {
    console.error("Error in chat handler:", error);
    return res.status(500).json({
      error: "Failed to process chat request",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
}
