import { getOpenAICompletion } from "@workspace/api-client-react";

export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export async function generateChatResponse(messages: ChatMessage[]): Promise<string> {
  try {
    const data = await getOpenAICompletion({
      messages,
    });

    if (!data.choices || data.choices.length === 0 || !data.choices[0].message) {
      throw new Error("No choices returned from the secure OpenAI completion proxy endpoint.");
    }

    return data.choices[0].message.content || "";
  } catch (error) {
    console.error("OpenAI API proxy call failed:", error);
    throw error;
  }
}
