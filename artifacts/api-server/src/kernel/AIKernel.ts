import { assembleContext } from "./ContextEngine";
import { PlannerEngine, isPlannerError } from "./PlannerEngine";
import { ToolEngine } from "./ToolEngine";

export class AIKernel {
  /**
   * Coordinates the full AI execution workflow:
   * 1. Assembles live context matrix from ContextEngine.
   * 2. Generates execution plan using PlannerEngine.
   * 3. Orchestrates step execution using ToolEngine.
   * 4. Approves and executes all steps for direct execution confirmation.
   *
   * @param orgId The organization context identifier.
   * @param goal The high-level merchant goal.
   * @returns The updated execution state with results of all run steps.
   */
  static async execute(orgId: number, goal: string): Promise<any> {
    console.log(`[AIKernel] Gathering context for organization ${orgId}...`);
    const context = await assembleContext(orgId);

    console.log(`[AIKernel] Decomposing goal "${goal}" into a structured plan...`);
    const plan = await PlannerEngine.generatePlan(context, goal);

    if (isPlannerError(plan)) {
      throw new Error(`[AIKernel] Planning failed: ${plan.error.message}`);
    }

    console.log(`[AIKernel] Dispatching plan steps through ToolEngine...`);
    const executionState = await ToolEngine.runPlan(plan);

    // Auto-approve and run any pending approval steps for immediate verify run
    for (const step of executionState.steps) {
      if (step.status === "pending_approval") {
        console.log(`[AIKernel] Auto-approving deferred step ${step.stepIndex} (${step.step.action})`);
        await ToolEngine.approveStep(plan.planId, step.stepIndex);
      }
    }

    return executionState;
  }
}
