import { useQuery } from "@tanstack/react-query";
import { fetchBusinessMissions } from "../services/missionService";

/**
 * React Query state hook to manage business missions list.
 * Integrates client-side mock service adapter.
 */
export function useBusinessMissions(businessCategory?: string) {
  return useQuery({
    queryKey: ["businessMissions", businessCategory],
    queryFn: () => fetchBusinessMissions(businessCategory),
    staleTime: 60 * 1000, // 1 minute stale
  });
}
