/**
 * OpenAI integration module for text embeddings
 */

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

export async function embedText(text: string): Promise<number[]> {
  if (!OPENAI_API_KEY) {
    // Return a mock embedding for development/testing when no API key is available
    // In production, this should throw an error
    console.warn("OPENAI_API_KEY not set, returning mock embedding");
    return generateMockEmbedding(text);
  }

  const response = await fetch("https://api.openai.com/v1/embeddings", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      input: text,
      model: "text-embedding-ada-002",
    }),
  });

  if (!response.ok) {
    throw new Error(`OpenAI API error: ${response.status}`);
  }

  const data = await response.json();
  return data.data[0].embedding;
}

/**
 * Generate a deterministic mock embedding for testing purposes
 */
function generateMockEmbedding(text: string): number[] {
  const EMBEDDING_DIM = 1536; // OpenAI ada-002 dimension
  const embedding: number[] = [];
  
  // Simple hash-based mock embedding
  let hash = 0;
  for (let i = 0; i < text.length; i++) {
    hash = ((hash << 5) - hash) + text.charCodeAt(i);
    hash |= 0;
  }
  
  for (let i = 0; i < EMBEDDING_DIM; i++) {
    // Generate pseudo-random values based on text hash
    const value = Math.sin(hash * (i + 1)) * 0.5;
    embedding.push(value);
  }
  
  // Normalize the vector
  const norm = Math.sqrt(embedding.reduce((sum, v) => sum + v * v, 0));
  return embedding.map((v) => v / (norm || 1));
}
