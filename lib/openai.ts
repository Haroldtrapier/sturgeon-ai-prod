import OpenAI from "openai";

if (!process.env.OPENAI_API_KEY) {
  throw new Error("OPENAI_API_KEY is not set");
}

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function chatCompletion(
  system: string,
  user: string,
  model: string = "gpt-4.1"
) {
  const res = await openai.chat.completions.create({
    model,
    messages: [
      { role: "system", content: system },
      { role: "user", content: user },
    ],
  });
  return res.choices[0].message?.content ?? "";
}

export async function embedText(text: string, model = "text-embedding-3-large") {
  const res = await openai.embeddings.create({
    model,
    input: text,
  });
  return res.data[0].embedding;
}
