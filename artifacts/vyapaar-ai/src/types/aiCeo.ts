export interface AICeoMission {
  description: string;
  target: string;
  progress: number; // 0 to 100
  status: "active" | "completed" | "paused";
  category: string;
}

export interface AICeoPriority {
  id: string;
  title: string;
  description: string;
  priorityLevel: "high" | "medium" | "low";
  module: "CRM" | "Inventory" | "Marketing" | "Billing" | "Website" | "Finance";
}

export interface AICeoProposal {
  id: string;
  title: string;
  description: string;
  category: "marketing_campaign" | "stock_replenishment" | "website_update" | "crm_outreach";
  summary: string;
  proposedAction: string;
  details: Record<string, any>;
  approved: boolean;
  status: "pending" | "approved" | "rejected";
}

export interface AICeoTimelineEvent {
  id: string;
  timestamp: string;
  type: "observation" | "plan" | "execution" | "verification";
  message: string;
  details?: string;
}

export interface AICeoStandup {
  greetingContext: string;
  yesterdaySummary: string;
  todayPlan: string;
  recommendation: string;
}

export interface AIEmployeeAgent {
  id: string;
  name: string;
  description: string;
  status: "active" | "idle" | "paused";
  lastActive: string;
}
