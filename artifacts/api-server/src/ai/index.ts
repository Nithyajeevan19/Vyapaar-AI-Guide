/**
 * Reusable AI and Generative Models module stub.
 * This folder is reserved for shared AI agents, prompt configurations,
 * and unified interfaces to Google Gemini or other LLM endpoints.
 */
export interface AIModelConfig {
  modelName: string;
  temperature?: number;
  maxOutputTokens?: number;
}
