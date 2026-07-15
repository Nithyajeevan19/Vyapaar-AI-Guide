import { z } from "zod";
import { PromptBuilder } from "../services/PromptBuilder";
import { LLMService } from "../services/LLMService";

// Define the exact Zod Schema corresponding to the output schema
export const planStepSchema = z.object({
  stepId: z.string(),
  providerId: z.string(),
  action: z.string(),
  parameters: z.record(z.any()),
  verificationTrigger: z.string(),
  explanation: z.string(),
  expectedOutcome: z.string(),
  riskLevel: z.enum(["low", "medium", "high"]),
  wait_approval: z.boolean(),
});

export const planSchema = z.object({
  planId: z.string(),
  goal: z.string(),
  summary: z.string(),
  confidenceScore: z.number().int().min(0).max(100),
  estimatedImpact: z.string(),
  estimatedDuration: z.string(),
  steps: z.array(planStepSchema),
});

export interface PlanStep {
  stepId: string;
  providerId: string;
  action: string;
  parameters: Record<string, any>;
  verificationTrigger: string;
  explanation: string;
  expectedOutcome: string;
  riskLevel: "low" | "medium" | "high";
  wait_approval: boolean;
}

export interface Plan {
  planId: string;
  goal: string;
  summary: string;
  confidenceScore: number; // 0-100
  estimatedImpact: string;
  estimatedDuration: string;
  steps: PlanStep[];
}

export interface PlannerError {
  error: {
    code: string;
    message: string;
    rawResponse?: string;
  };
}

export function isPlannerError(obj: any): obj is PlannerError {
  return obj && typeof obj === "object" && "error" in obj;
}

export class PlannerEngine {
  /**
   * Generates a structured execution plan from a merchant goal and business context.
   *
   * @param contextObj The business context object gathered from the store.
   * @param goal The merchant's high-level goal.
   * @returns A promise resolving to the structured execution plan or a PlannerError.
   */
  static async generatePlan(contextObj: object, goal: string): Promise<Plan | PlannerError> {
    const schema = {
      type: "object",
      properties: {
        planId: {
          type: "string",
          description: "Unique identifier for the generated plan (e.g., plan_xxxx)."
        },
        goal: {
          type: "string",
          description: "The merchant's high-level goal."
        },
        summary: {
          type: "string",
          description: "A summary of what the plan achieves and its strategy."
        },
        confidenceScore: {
          type: "integer",
          minimum: 0,
          maximum: 100,
          description: "Confidence score between 0 and 100, influenced by context completeness, data freshness, missing providers, or missing analytics."
        },
        estimatedImpact: {
          type: "string",
          description: "Estimated business impact (e.g., Increase daily sales by 10%, decrease stockout risk)."
        },
        estimatedDuration: {
          type: "string",
          description: "Estimated time to complete the plan (e.g., 2 hours, 1 day)."
        },
        steps: {
          type: "array",
          items: {
            type: "object",
            properties: {
              stepId: {
                type: "string",
                description: "Unique identifier for this step (e.g., step_01)."
              },
              providerId: {
                type: "string",
                description: "The BKL provider responsible for this step (e.g., CRMProvider, InventoryProvider, WhatsAppProvider)."
              },
              action: {
                type: "string",
                description: "The specific action method name to execute (e.g., create_purchase_order, adjust_stock_level, send_inquiry_reply)."
              },
              parameters: {
                type: "object",
                description: "Exact key-value parameters passed to the action method."
              },
              verificationTrigger: {
                type: "string",
                description: "Mechanism or description of how to verify the success of this step."
              },
              explanation: {
                type: "string",
                description: "Detailed explanation: Why this step exists, what context data influenced it, and what business objective it supports."
              },
              expectedOutcome: {
                type: "string",
                description: "The expected outcome of executing this step."
              },
              riskLevel: {
                type: "string",
                enum: ["low", "medium", "high"],
                description: "Risk level of the action."
              },
              wait_approval: {
                type: "boolean",
                description: "Set to true if this action is high-impact and must wait for explicit user approval before execution."
              }
            },
            required: ["stepId", "providerId", "action", "parameters", "verificationTrigger", "explanation", "expectedOutcome", "riskLevel", "wait_approval"]
          }
        }
      },
      required: ["planId", "goal", "summary", "confidenceScore", "estimatedImpact", "estimatedDuration", "steps"]
    };

    const prompt = await PromptBuilder.buildPrompt(contextObj, goal, schema);
    
    const systemInstruction = `You are a professional business operations planner (acting as a COO, Operations Manager, or Business Consultant). 
Your tone must be professional, concise, and business-focused. Avoid friendly assistant conversational filler.
You must output ONLY a valid JSON object matching the requested schema.
Do not include any markdown formatting blocks like \`\`\`json, backticks, conversational preamble, or follow-up text.`;

    const startTime = Date.now();
    let retryCount = 0;
    let parseFailures = 0;
    let tokens: any = undefined;
    let rawResponse = "";

    try {
      const res = await LLMService.generateStructuredResponse(systemInstruction, prompt);
      rawResponse = res.text;
      tokens = res.usage;

      const parsed = JSON.parse(rawResponse.trim());
      const validated = planSchema.parse(parsed);

      const responseTime = Date.now() - startTime;
      console.log(`[PlannerEngine Logs]
- Prompt Size: ${prompt.length} characters
- Response Time: ${responseTime}ms
- Retry Count: ${retryCount}
- Parse Failures: ${parseFailures}
- Tokens: ${JSON.stringify(tokens || "N/A")}
`);

      return validated as Plan;
    } catch (error: any) {
      parseFailures++;
      console.warn(`[PlannerEngine] Initial generation validation failed (${error.message}). Retrying once with explicit correction...`);
      retryCount = 1;
      
      const retryPrompt = `${prompt}\n\nError: Your last response was invalid or did not adhere to the requested Zod schema validation rules: ${error.message}. Please ensure your response is strictly a valid JSON object matching the requested schema. Return ONLY valid JSON, do not wrap it in markdown codeblocks or prefix it with any text.`;
      
      try {
        const resRetry = await LLMService.generateStructuredResponse(systemInstruction, retryPrompt);
        rawResponse = resRetry.text;
        tokens = resRetry.usage;

        const parsedRetry = JSON.parse(rawResponse.trim());
        const validatedRetry = planSchema.parse(parsedRetry);

        const responseTime = Date.now() - startTime;
        console.log(`[PlannerEngine Logs]
- Prompt Size: ${prompt.length} characters
- Response Time: ${responseTime}ms
- Retry Count: ${retryCount}
- Parse Failures: ${parseFailures}
- Tokens: ${JSON.stringify(tokens || "N/A")}
`);

        return validatedRetry as Plan;
      } catch (retryError: any) {
        parseFailures++;
        console.error(`[PlannerEngine] Retry failed validation: ${retryError.message}`);
        const responseTime = Date.now() - startTime;
        console.log(`[PlannerEngine Logs]
- Prompt Size: ${prompt.length} characters
- Response Time: ${responseTime}ms
- Retry Count: ${retryCount}
- Parse Failures: ${parseFailures}
- Tokens: ${JSON.stringify(tokens || "N/A")}
`);

        return {
          error: {
            code: "PLANNER_SCHEMA_VALIDATION_ERROR",
            message: `Failed to generate a valid plan matching the schema: ${retryError.message}`,
            rawResponse
          }
        };
      }
    }
  }
}

export async function generatePlan(contextObj: object, goal: string): Promise<Plan | PlannerError> {
  return PlannerEngine.generatePlan(contextObj, goal);
}
