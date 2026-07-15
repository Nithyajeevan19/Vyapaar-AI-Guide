import { GoogleGenAI } from "@google/genai";

export class LLMService {
  /**
   * Generates a structured JSON response from the Gemini model.
   *
   * @param systemInstruction The system instruction guiding the model's behavior.
   * @param prompt The prompt input for the model.
   * @returns The raw text response from the model (which is formatted as JSON).
   */
  static async generateStructuredResponse(
    systemInstruction: string,
    prompt: string
  ): Promise<{ text: string; usage?: { promptTokens?: number; responseTokens?: number } }> {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY environment variable is not defined");
    }

    const ai = new GoogleGenAI({ apiKey });

    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      controller.abort();
    }, 15000); // 15 seconds timeout

    try {
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
          systemInstruction,
          responseMimeType: "application/json",
        },
      });
      clearTimeout(timeoutId);
      
      const usage = response.usageMetadata ? {
        promptTokens: response.usageMetadata.promptTokenCount,
        responseTokens: response.usageMetadata.candidatesTokenCount
      } : undefined;

      return {
        text: response.text || "",
        usage
      };
    } catch (error: any) {
      clearTimeout(timeoutId);
      if (error.name === "AbortError") {
        throw new Error("Gemini API call timed out after 15 seconds.");
      }
      throw error;
    }
  }
}
