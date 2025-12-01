import OpenAI from "openai";

let openaiClient: OpenAI | null = null;

function getOpenAI(): OpenAI {
  if (!openaiClient) {
    openaiClient = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }
  return openaiClient;
}

export async function chatCompletion(
  systemPrompt: string,
  userPrompt: string
): Promise<string> {
  const openai = getOpenAI();
  const response = await openai.chat.completions.create({
    model: process.env.OPENAI_MODEL ?? "gpt-4",
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
  });

  return response.choices[0]?.message?.content ?? "";
}
