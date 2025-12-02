import OpenAI from "openai";

// Lazy-initialize OpenAI client to avoid build-time issues
let openaiInstance: OpenAI | null = null;

function getOpenAIClient(): OpenAI {
  if (!openaiInstance) {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error("OPENAI_API_KEY environment variable is not set");
    }
    openaiInstance = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }
  return openaiInstance;
}

/**
 * Generate a chat completion using OpenAI's API
 * @param systemPrompt - The system prompt that defines the AI's behavior
 * @param userMessage - The user's message/question
 * @returns The AI's response text
 */
export async function chatCompletion(
  systemPrompt: string,
  userMessage: string
): Promise<string> {
  try {
    const openai = getOpenAIClient();
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: systemPrompt,
        },
        {
          role: "user",
          content: userMessage,
        },
      ],
      temperature: 0.7,
      max_tokens: 1000,
    });

    return completion.choices[0]?.message?.content || "No response generated.";
  } catch (error) {
    console.error("OpenAI API error:", error);
    throw new Error("Failed to generate AI response");
  }
}
