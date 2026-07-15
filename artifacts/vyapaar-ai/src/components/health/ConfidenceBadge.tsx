import { ShieldCheck, Info } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../ui/tooltip";

interface ConfidenceBadgeProps {
  confidence: number;
}

/**
 * AI Confidence Level Badge.
 * Informs the merchant of the reliability of the score based on completeness of weight parameters.
 */
export function ConfidenceBadge({ confidence }: ConfidenceBadgeProps) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-primary/10 border border-primary/20 text-primary rounded-xl text-xs font-bold cursor-pointer hover:bg-primary/15 transition-all">
            <ShieldCheck size={14} className="text-primary" />
            <span>{confidence}% AI Confidence</span>
            <Info size={10} className="opacity-60" />
          </div>
        </TooltipTrigger>
        <TooltipContent className="max-w-xs p-3 space-y-1">
          <p className="font-bold text-xs">Explainable AI Margin</p>
          <p className="text-[10px] text-muted-foreground leading-normal">
            Calculated based on real-time integrations of sales database tables, catalogue updates, and WhatsApp response rates.
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
