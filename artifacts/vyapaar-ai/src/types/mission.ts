export interface MissionSubTask {
  id: string;
  title: string;
  status: "pending" | "completed" | "in_progress";
  timeEstimate: string;
}

export interface PreparedMissionAction {
  id: string;
  title: string;
  description: string;
  actionText: string;
  status: "pending" | "approved" | "rejected";
}

export interface BusinessMission {
  id: string;
  title: string;
  description: string;
  priority: "critical" | "high" | "medium" | "low";
  businessImpact: string;
  estimatedTime: string;
  progress: number;
  reason: string;
  status: "active" | "backlog" | "completed";
  subTasks: MissionSubTask[];
  preparedActions: PreparedMissionAction[];
}
