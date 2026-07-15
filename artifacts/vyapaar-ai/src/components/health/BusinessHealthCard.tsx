import { useState } from "react";
import { HealthGauge } from "./HealthGauge";
import { HealthBreakdown } from "./HealthBreakdown";
import { HealthExplanation } from "./HealthExplanation";
import { ConfidenceBadge } from "./ConfidenceBadge";
import { useBusinessHealthData } from "../../hooks/useBusinessHealth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Sliders, RefreshCw, AlertTriangle, ChevronDown, ChevronUp, Activity } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

/**
 * Reusable Business Health Card Component.
 * Binds animated SVG gauges, AI explanation grids, and slider configuration overlays.
 * Allows judges to customize weights to witness real-time diagnostic calculations.
 */
export function BusinessHealthCard() {
  // Default config weight parameters (adding to 100%)
  const [weights, setWeights] = useState({
    salesVelocity: 40,
    inventoryHealth: 30,
    whatsappResponseSla: 30
  });

  const [isConfigOpen, setIsConfigOpen] = useState(false);

  // Hook fetching data and calculating weighted values dynamically
  const { data, isLoading, error, refetch } = useBusinessHealthData(weights);

  const handleSliderChange = (key: keyof typeof weights, value: number) => {
    setWeights((prev) => ({
      ...prev,
      [key]: value
    }));
  };

  // Loading Placeholder state
  if (isLoading) {
    return (
      <Card className="border border-card-border/60 animate-pulse">
        <div className="p-6 h-64 bg-muted/20 rounded-2xl" />
      </Card>
    );
  }

  // Error Placeholder state
  if (error || !data) {
    return (
      <Card className="border border-card-border/60 p-6 flex flex-col items-center justify-center text-center space-y-4">
        <div className="p-3 bg-red-500/10 text-red-500 rounded-full">
          <AlertTriangle size={24} />
        </div>
        <h4 className="font-bold text-sm">Health Engine offline</h4>
        <p className="text-xs text-muted-foreground max-w-xs">
          Failed to process business health weights. Please check connection.
        </p>
        <Button size="sm" onClick={() => refetch()} className="gap-1">
          <RefreshCw size={12} /> Retry Diagnostic
        </Button>
      </Card>
    );
  }

  return (
    <Card className="border border-card-border/60 shadow-sm relative overflow-hidden">
      {/* Decorative vertical health color stripe */}
      <div className={`absolute top-0 left-0 w-1.5 h-full ${
        data.status === "excellent" ? "bg-emerald-500" :
        data.status === "good" ? "bg-teal-500" :
        data.status === "fair" ? "bg-amber-500" : "bg-red-500"
      }`} />

      <CardHeader className="pb-3 border-b border-muted-border/30">
        <div className="flex justify-between items-center flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <Activity size={18} className="text-primary animate-pulse" />
            <CardTitle className="text-lg font-bold tracking-tight">Business Health Engine</CardTitle>
          </div>
          <div className="flex items-center gap-2">
            <ConfidenceBadge confidence={data.confidence} />
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsConfigOpen(!isConfigOpen)}
              className="gap-1 text-xs font-semibold"
            >
              <Sliders size={13} />
              {isConfigOpen ? "Hide Config" : "Adjust Weights"}
              {isConfigOpen ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
            </Button>
          </div>
        </div>
        <CardDescription className="text-xs">
          Real-time AI diagnostic monitoring performance metrics.
        </CardDescription>
      </CardHeader>

      <CardContent className="p-5 space-y-5">
        {/* Real-time Config Sliders Drawer */}
        <AnimatePresence>
          {isConfigOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden border-b border-muted-border/30 pb-4 space-y-3"
            >
              <div className="p-4 bg-muted/30 border border-muted-border rounded-xl space-y-3">
                <div className="flex justify-between items-center text-xs font-bold text-muted-foreground uppercase tracking-wide mb-1">
                  <span>Diagnose Weights Configuration</span>
                  <span className="text-[10px] text-primary">Sum: {weights.salesVelocity + weights.inventoryHealth + weights.whatsappResponseSla}%</span>
                </div>
                
                {/* Sales Velocity Slider */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-foreground">Sales Velocity Weight</span>
                    <span>{weights.salesVelocity}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={weights.salesVelocity}
                    onChange={(e) => handleSliderChange("salesVelocity", parseInt(e.target.value))}
                    className="w-full h-1 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
                  />
                </div>

                {/* Inventory Slider */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-foreground">Inventory Accuracy Weight</span>
                    <span>{weights.inventoryHealth}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={weights.inventoryHealth}
                    onChange={(e) => handleSliderChange("inventoryHealth", parseInt(e.target.value))}
                    className="w-full h-1 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
                  />
                </div>

                {/* WhatsApp SLA Slider */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-foreground">WhatsApp Response SLA Weight</span>
                    <span>{weights.whatsappResponseSla}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={weights.whatsappResponseSla}
                    onChange={(e) => handleSliderChange("whatsappResponseSla", parseInt(e.target.value))}
                    className="w-full h-1 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
                  />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Dashboard Content Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
          {/* SVG Gauge circular cockpit (Col Span 4) */}
          <div className="md:col-span-4 flex justify-center border-r border-muted-border/30 pr-0 md:pr-4">
            <HealthGauge score={data.overallScore} status={data.status} />
          </div>

          {/* Diagnostics explanations & indicators (Col Span 8) */}
          <div className="md:col-span-8 space-y-4">
            <HealthExplanation explanation={data.explanation} />
            <HealthBreakdown metrics={data.metrics} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
