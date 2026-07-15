import { useQuery } from "@tanstack/react-query";
import { useGetAnalyticsDashboard } from "@workspace/api-client-react";
import { calculateBusinessHealth } from "../services/healthService";
import { HealthWeightsConfig, BusinessHealthResult } from "../types/health";

/**
 * Custom React Query Hook coordinating Business Health Engine datasets.
 * Automatically synchronizes with live database metrics (revenue, orders) and computes
 * dynamic health values when weight configurations are toggled in-page.
 */
export function useBusinessHealthData(
  weights: HealthWeightsConfig,
  orgId = 1
) {
  // 1. Fetch live metrics from Neon database analytics
  const { 
    data: analytics, 
    isLoading: loadingAnalytics, 
    error: errorAnalytics, 
    refetch: refetchAnalytics 
  } = useGetAnalyticsDashboard({ orgId });

  // 2. Wrap calculations inside a cached query key dependent on weight config values
  const queryResult = useQuery<BusinessHealthResult>({
    queryKey: ["business_health", weights, orgId, analytics?.revenueToday, analytics?.ordersTotal],
    queryFn: async () => {
      // Mock catalog accuracy (85%) and unanswered inquiries backlog (3 chats)
      const catalogAccuracy = 82;
      const pendingQueriesCount = 2;

      return calculateBusinessHealth(weights, {
        revenueToday: analytics?.revenueToday || 12000,
        ordersCount: analytics?.ordersTotal || 6,
        catalogAccuracy,
        pendingQueriesCount
      });
    },
    enabled: !!analytics,
  });

  return {
    data: queryResult.data,
    isLoading: loadingAnalytics || queryResult.isLoading,
    error: errorAnalytics || queryResult.error,
    refetch: () => {
      refetchAnalytics();
      queryResult.refetch();
    }
  };
}
