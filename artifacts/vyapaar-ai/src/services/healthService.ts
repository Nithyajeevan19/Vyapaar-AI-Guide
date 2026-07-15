import { BusinessHealthResult, HealthWeightsConfig, HealthMetricDetail } from "../types/health";

/**
 * Business Health Score calculation engine.
 * Combines configuration weightings with raw daily analytics metrics to produce
 * a weighted score, status classification, confidence level, and explainable AI text summary.
 */
export function calculateBusinessHealth(
  weights: HealthWeightsConfig,
  analyticsData: {
    revenueToday: number;
    ordersCount: number;
    catalogAccuracy: number; // 0 - 100
    pendingQueriesCount: number;
  }
): BusinessHealthResult {
  // 1. Calculate individual metrics
  // Sales Velocity score based on orders and revenue vs targets
  const salesScore = Math.min(100, Math.round((analyticsData.ordersCount / 8) * 100)); // Target 8 orders per day
  const salesMetric: HealthMetricDetail = {
    id: "sales_velocity",
    name: "Sales Velocity",
    score: salesScore,
    weight: weights.salesVelocity,
    valueLabel: `INR ${analyticsData.revenueToday.toLocaleString("en-IN")} (${analyticsData.ordersCount} orders)`,
    rating: salesScore >= 80 ? "good" : salesScore >= 50 ? "warning" : "critical"
  };

  // Inventory Health score based on catalog accuracy
  const inventoryScore = analyticsData.catalogAccuracy;
  const inventoryMetric: HealthMetricDetail = {
    id: "inventory_health",
    name: "Inventory Accuracy",
    score: inventoryScore,
    weight: weights.inventoryHealth,
    valueLabel: `${inventoryScore}% catalog sync`,
    rating: inventoryScore >= 80 ? "good" : inventoryScore >= 50 ? "warning" : "critical"
  };

  // Response SLA score based on pending queries
  const slaScore = Math.max(0, 100 - (analyticsData.pendingQueriesCount * 20)); // 20 points deduction per pending chat
  const slaMetric: HealthMetricDetail = {
    id: "whatsapp_sla",
    name: "WhatsApp Response SLA",
    score: slaScore,
    weight: weights.whatsappResponseSla,
    valueLabel: `${analyticsData.pendingQueriesCount} unanswered chats`,
    rating: slaScore >= 80 ? "good" : slaScore >= 50 ? "warning" : "critical"
  };

  // 2. Compute Weighted average score
  const totalWeight = weights.salesVelocity + weights.inventoryHealth + weights.whatsappResponseSla;
  let overallScore = 0;

  if (totalWeight > 0) {
    const weightedSum =
      (salesScore * weights.salesVelocity) +
      (inventoryScore * weights.inventoryHealth) +
      (slaScore * weights.whatsappResponseSla);
    overallScore = Math.round(weightedSum / totalWeight);
  }

  // Determine status rating
  let status: BusinessHealthResult["status"] = "good";
  if (overallScore >= 85) status = "excellent";
  else if (overallScore >= 70) status = "good";
  else if (overallScore >= 45) status = "fair";
  else status = "critical";

  // 3. Formulate explainable AI text summary
  let explanation = "";
  if (status === "excellent") {
    explanation = "Your business metrics are outstanding today! Steady daily sales velocity and synchronized catalog details are maintaining optimal margins.";
  } else if (overallScore >= 70) {
    explanation = "Your business is in good shape. However, response delays or catalog inventory gaps are currently capping maximum potential margins.";
  } else {
    explanation = "Critical operational alerts are dragging overall health down. We recommend responding to pending inquiries immediately to salvage lost sales.";
  }

  if (analyticsData.pendingQueriesCount > 2 && weights.whatsappResponseSla > 20) {
    explanation += ` The backlog of ${analyticsData.pendingQueriesCount} WhatsApp queries is introducing response latency and impact index.`;
  }
  if (analyticsData.catalogAccuracy < 70 && weights.inventoryHealth > 20) {
    explanation += " Out-of-sync product lines in your digital e-store catalogs require verification.";
  }

  // 4. Compute dynamic Confidence score
  // Confidence is lower when weights are highly skewed
  const maxWeight = Math.max(weights.salesVelocity, weights.inventoryHealth, weights.whatsappResponseSla);
  const skew = maxWeight / (totalWeight || 1);
  const confidence = Math.round(98 - (skew * 15)); // Standard baseline confidence around 90-95%

  return {
    overallScore,
    status,
    confidence,
    explanation,
    metrics: [salesMetric, inventoryMetric, slaMetric],
    weightsConfig: weights
  };
}
