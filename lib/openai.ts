import OpenAI from "openai";

let openaiClient: OpenAI | null = null;

function getOpenAIClient(): OpenAI {
  if (!openaiClient) {
    openaiClient = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }
  return openaiClient;
}

/**
 * Generates a chat completion using OpenAI's GPT model.
 * @param systemPrompt - The system prompt to set the assistant's behavior.
 * @param userMessage - The user's message to respond to.
 * @returns The assistant's response as a string.
 */
export async function chatCompletion(
  systemPrompt: string,
  userMessage: string,
): Promise<string> {
  const openai = getOpenAIClient();
  const completion = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userMessage },
    ],
  });

  return completion.choices[0]?.message?.content ?? "";
}
