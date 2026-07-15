import { useQuery } from "@tanstack/react-query";
import { fetchAICeoCommandData } from "../services/aiCeoService";

/**
 * React Query hook to manage AI CEO Command Center data state.
 * Leverages client-side mock service adapter and coordinates queries.
 */
export function useAICeoCommandData(businessCategory?: string) {
  return useQuery({
    queryKey: ["aiCeoCommandData", businessCategory],
    queryFn: () => fetchAICeoCommandData(businessCategory),
    staleTime: 60 * 1000, // 1 minute stale time
  });
}
