import { HealthMetricDetail } from "../../types/health";
import { motion } from "framer-motion";

interface HealthBreakdownProps {
  metrics: HealthMetricDetail[];
}

/**
 * Visual breakdown of factors comprising the overall health score.
 * Shows individual ratings and weight distribution percentages.
 */
export function HealthBreakdown({ metrics }: HealthBreakdownProps) {
  const ratingColors = {
    good: "bg-emerald-500",
    warning: "bg-amber-500",
    critical: "bg-red-500"
  };

  const textColors = {
    good: "text-emerald-600 dark:text-emerald-400",
    warning: "text-amber-600 dark:text-amber-400",
    critical: "text-red-500"
  };

  return (
    <div className="space-y-4">
      <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
        Operational Factors breakdown
      </h4>
      <div className="space-y-3.5">
        {metrics.map((metric) => (
          <div key={metric.id} className="space-y-1.5">
            <div className="flex justify-between items-center text-xs font-semibold">
              <div className="flex items-center gap-1.5">
                <span className="text-foreground">{metric.name}</span>
                <span className="text-[10px] text-muted-foreground font-medium">
                  (Weight: {metric.weight}%)
                </span>
              </div>
              <span className={`font-bold ${textColors[metric.rating]}`}>
                {metric.valueLabel}
              </span>
            </div>
            
            {/* Animated Factor Bar */}
            <div className="w-full h-2 bg-muted border border-muted-border/30 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${metric.score}%` }}
                transition={{ duration: 1.0, ease: "easeOut" }}
                className={`h-full rounded-full ${ratingColors[metric.rating]}`}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
