import { Sparkles } from "lucide-react";

interface HealthExplanationProps {
  explanation: string;
}

/**
 * Conversational explainable AI panel.
 * Frames health index feedback inside natural language business advice.
 */
export function HealthExplanation({ explanation }: HealthExplanationProps) {
  return (
    <div className="p-4 bg-muted/40 border border-muted-border/60 rounded-xl space-y-2">
      <h4 className="text-xs font-bold text-primary uppercase tracking-wider flex items-center gap-1.5">
        <Sparkles size={13} className="animate-pulse" />
        AI Diagnostic Explanation
      </h4>
      <p className="text-xs text-foreground font-medium leading-relaxed">
        {explanation}
      </p>
    </div>
  );
}
