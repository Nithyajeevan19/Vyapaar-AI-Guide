export interface HealthWeightsConfig {
  salesVelocity: number;      // 0 - 100
  inventoryHealth: number;    // 0 - 100
  whatsappResponseSla: number;// 0 - 100
}

export interface HealthMetricDetail {
  id: string;
  name: string;
  score: number;             // 0 - 100
  weight: number;            // percentage
  valueLabel: string;
  rating: "good" | "warning" | "critical";
}

export interface BusinessHealthResult {
  overallScore: number;      // 0 - 100
  status: "excellent" | "good" | "fair" | "critical";
  confidence: number;        // 0 - 100
  explanation: string;
  metrics: HealthMetricDetail[];
  weightsConfig: HealthWeightsConfig;
}
