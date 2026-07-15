import { Plan, PlanStep } from "./PlannerEngine";
import { CRMProvider } from "../providers/CRMProvider";
import { InventoryProvider } from "../providers/InventoryProvider";
import { WhatsAppProvider } from "../providers/WhatsAppProvider";

export interface StepExecutionState {
  stepIndex: number;
  step: PlanStep;
  status: "pending_approval" | "executed" | "failed" | "skipped";
  policy: "auto" | "requires_approval";
  result?: any;
  error?: string;
}

export interface PlanExecutionState {
  planId: string;
  goal: string;
  steps: StepExecutionState[];
}

export class ToolEngine {
  private static providers: Record<string, any> = {};
  private static activeExecutions: Map<string, PlanExecutionState> = new Map();

  // Mapping from action to policy
  private static approvalPolicy: Record<string, "auto" | "requires_approval"> = {
    "create_purchase_order": "requires_approval",
    "send_whatsapp": "auto",
    "update_lead_status": "auto",
    "send_inquiry_reply": "auto",
  };

  /**
   * Helper to resolve the approval policy for a given action.
   * Default anything that writes/deletes/sends external messages to requires_approval unless explicitly told otherwise.
   */
  static getActionPolicy(action: string): "auto" | "requires_approval" {
    if (this.approvalPolicy[action] !== undefined) {
      return this.approvalPolicy[action];
    }

    const actionLower = action.toLowerCase();
    // Default matching for writes / deletes / external sends
    if (
      actionLower.startsWith("create") ||
      actionLower.startsWith("update") ||
      actionLower.startsWith("delete") ||
      actionLower.startsWith("adjust") ||
      actionLower.startsWith("sync") ||
      actionLower.startsWith("record") ||
      actionLower.startsWith("send") ||
      actionLower.startsWith("generate_invoice") ||
      actionLower.startsWith("generate_campaign") ||
      actionLower.includes("remove")
    ) {
      return "requires_approval";
    }

    // Default to auto for read operations or unrecognized commands
    return "auto";
  }

  /**
   * Registers a provider instance.
   */
  static registerProvider(id: string, provider: any) {
    this.providers[id] = provider;
  }

  /**
   * Gets a registered provider.
   */
  static getProvider(id: string) {
    return this.providers[id];
  }

  /**
   * Executes a single provider action.
   */
  static async execute(providerId: string, action: string, params: any): Promise<any> {
    const provider = this.providers[providerId];
    if (!provider) {
      throw new Error(`Provider "${providerId}" is not registered.`);
    }

    const actionFn = provider[action];
    if (!actionFn || typeof actionFn !== "function") {
      throw new Error(`Action "${action}" is not supported by Provider "${providerId}".`);
    }

    return await actionFn(params);
  }

  /**
   * Orchestrates the execution of a plan.
   * Auto steps run immediately; approval steps wait for an explicit approve call.
   */
  static async runPlan(plan: Plan): Promise<PlanExecutionState> {
    const executionState: PlanExecutionState = {
      planId: plan.planId,
      goal: plan.goal,
      steps: [],
    };

    for (let i = 0; i < plan.steps.length; i++) {
      const step = plan.steps[i];
      const backendPolicy = this.getActionPolicy(step.action);

      // Backend safety rule override: do not trust LLM alone for high-impact actions
      const isHighImpact =
        step.action.includes("delete") ||
        step.action.includes("send_broadcast") ||
        step.action.includes("create_purchase_order") ||
        step.action.includes("update_chatbot_rules") ||
        step.action.includes("adjust_stock_level") ||
        step.action.includes("sync_catalog_prices");

      const policy = (backendPolicy === "requires_approval" || step.wait_approval === true || isHighImpact)
        ? "requires_approval"
        : "auto";

      const stepState: StepExecutionState = {
        stepIndex: i,
        step,
        status: "pending_approval",
        policy,
      };

      if (policy === "auto") {
        try {
          console.log(`[ToolEngine] Executing auto step ${i}: ${step.providerId}.${step.action}`);
          const result = await this.execute(step.providerId, step.action, step.parameters);
          stepState.status = "executed";
          stepState.result = result;
        } catch (err: any) {
          console.error(`[ToolEngine] Auto step ${i} failed:`, err.message);
          stepState.status = "failed";
          stepState.error = err.message;
        }
      } else {
        console.log(`[ToolEngine] Step ${i} requires approval: ${step.providerId}.${step.action}`);
        stepState.status = "pending_approval";
      }

      executionState.steps.push(stepState);
    }

    this.activeExecutions.set(plan.planId, executionState);
    return executionState;
  }

  /**
   * Approves and executes a specific deferred step in a plan.
   */
  static async approveStep(planId: string, stepIndex: number): Promise<PlanExecutionState> {
    const executionState = this.activeExecutions.get(planId);
    if (!executionState) {
      throw new Error(`No active execution state found for planId "${planId}".`);
    }

    const stepState = executionState.steps.find((s) => s.stepIndex === stepIndex);
    if (!stepState) {
      throw new Error(`Step at index ${stepIndex} not found in plan "${planId}".`);
    }

    if (stepState.status !== "pending_approval") {
      throw new Error(`Step at index ${stepIndex} is not pending approval (current status: "${stepState.status}").`);
    }

    try {
      console.log(`[ToolEngine] Executing approved step ${stepIndex}: ${stepState.step.providerId}.${stepState.step.action}`);
      const result = await this.execute(
        stepState.step.providerId,
        stepState.step.action,
        stepState.step.parameters
      );
      stepState.status = "executed";
      stepState.result = result;
    } catch (err: any) {
      console.error(`[ToolEngine] Approved step ${stepIndex} failed:`, err.message);
      stepState.status = "failed";
      stepState.error = err.message;
    }

    return executionState;
  }

  /**
   * Retrieves the current execution state of a plan.
   */
  static getExecutionState(planId: string): PlanExecutionState | undefined {
    return this.activeExecutions.get(planId);
  }
}

// Pre-register consolidated providers by default
ToolEngine.registerProvider("CRMProvider", CRMProvider);
ToolEngine.registerProvider("InventoryProvider", InventoryProvider);
ToolEngine.registerProvider("WhatsAppProvider", WhatsAppProvider);
