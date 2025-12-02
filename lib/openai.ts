import OpenAI from "openai";

let openai: OpenAI | null = null;

function getOpenAIClient(): OpenAI {
  if (!openai) {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error("OPENAI_API_KEY environment variable is not set");
    }
    openai = new OpenAI({
      apiKey,
    });
  }
  return openai;
}

export async function chatCompletion(
  systemPrompt: string,
  userMessage: string
): Promise<string> {
  try {
    const client = getOpenAIClient();
    const completion = await client.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userMessage },
      ],
    });

    return completion.choices[0]?.message?.content || "No response generated";
  } catch (error) {
    console.error("OpenAI API error:", error);
    throw new Error("Failed to generate chat completion");
  }
}
