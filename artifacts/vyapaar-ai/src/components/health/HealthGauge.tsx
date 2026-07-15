import { motion } from "framer-motion";
import { useEffect, useState } from "react";

interface HealthGaugeProps {
  score: number;
  status: "excellent" | "good" | "fair" | "critical";
}

/**
 * Premium SVG Circular Health Gauge.
 * Renders an animated stroke outline ring using Framer Motion and dynamically changes colors
 * based on the active rating score (Emerald, Amber, Red).
 */
export function HealthGauge({ score, status }: HealthGaugeProps) {
  const [displayScore, setDisplayScore] = useState(0);

  // Animate text count ticking up on score changes
  useEffect(() => {
    let start = 0;
    const end = score;
    if (start === end) return;

    const duration = 1.2; // seconds
    const increment = end > start ? 1 : -1;
    const stepTime = Math.abs(Math.floor((duration * 1000) / end));
    
    const timer = setInterval(() => {
      start += increment;
      setDisplayScore(start);
      if (start === end) {
        clearInterval(timer);
      }
    }, Math.max(stepTime, 12));

    return () => clearInterval(timer);
  }, [score]);

  // Color mappings
  const strokeColors = {
    excellent: "stroke-emerald-500",
    good: "stroke-teal-500",
    fair: "stroke-amber-500",
    critical: "stroke-red-500"
  };

  const textColors = {
    excellent: "text-emerald-500",
    good: "text-teal-500",
    fair: "text-amber-500",
    critical: "text-red-500"
  };

  const ratingLabel = {
    excellent: "Excellent",
    good: "Healthy",
    fair: "Fair",
    critical: "Alert"
  };

  // SVG parameters
  const radius = 50;
  const strokeWidth = 10;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <div className="flex flex-col items-center justify-center p-4 relative" aria-label={`Business Health score is ${score} out of 100`}>
      <div className="relative w-36 h-36">
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 120 120">
          {/* Background Track Circle */}
          <circle
            cx="60"
            cy="60"
            r={radius}
            className="stroke-muted fill-none"
            strokeWidth={strokeWidth}
          />
          {/* Foreground Animated Gauge Circle */}
          <motion.circle
            cx="60"
            cy="60"
            r={radius}
            className={`fill-none ${strokeColors[status]}`}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 1.2, ease: "easeOut" }}
            strokeLinecap="round"
          />
        </svg>
        {/* Core Center Text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <motion.span 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className={`text-3xl font-extrabold tracking-tighter ${textColors[status]}`}
          >
            {displayScore}
          </motion.span>
          <span className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">
            Health Index
          </span>
        </div>
      </div>
      <div className="mt-2 text-center">
        <span className={`text-sm font-extrabold uppercase tracking-wide px-2.5 py-0.5 rounded-full bg-muted border border-muted-border ${textColors[status]}`}>
          {ratingLabel[status]}
        </span>
      </div>
    </div>
  );
}
