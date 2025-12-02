export async function chatCompletion(systemPrompt: string, userMessage: string): Promise<string> {
  // This is a placeholder implementation
  // In a real application, this would call the OpenAI API
  
  const apiKey = process.env.OPENAI_API_KEY;
  
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY is not configured");
  }
  
  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userMessage }
        ]
      })
    });
    
    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (!data.choices || data.choices.length === 0) {
      throw new Error("No response choices returned from OpenAI API");
    }
    
    const content = data.choices[0]?.message?.content;
    if (!content) {
      throw new Error("No content in OpenAI API response");
    }
    
    return content;
  } catch (error) {
    console.error("Error calling OpenAI API:", error);
    throw new Error("Failed to generate chat completion");
  }
}
