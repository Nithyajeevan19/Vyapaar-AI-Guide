/**
 * Reusable AI Planner module stub.
 * This folder is reserved for AI execution planners, task trees,
 * and cognitive workflow controllers.
 */
export interface PlanStep {
  id: string;
  task: string;
  status: "pending" | "running" | "completed" | "failed";
}
