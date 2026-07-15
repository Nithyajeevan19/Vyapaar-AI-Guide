import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useGetAnalyticsDashboard } from "@workspace/api-client-react";
import { useBusinessHealthData } from "../../hooks/useBusinessHealth";
import { useAuth } from "../../hooks/useAuth";
import { HealthGauge } from "../health/HealthGauge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Mic, Bot, Sparkles, HelpCircle, Activity } from "lucide-react";

const STATUSES = [
  "Monitoring Inventory",
  "Reviewing Today's Sales",
  "Checking Pending WhatsApp Messages",
  "Forecasting Revenue",
  "Preparing Recommendations",
  "Waiting For Instructions"
];

const SUGGESTED_QUESTIONS = [
  "How is today's business?",
  "What needs attention?",
  "Increase today's sales.",
  "Reply to pending customers.",
  "Should I reorder inventory?"
];

export function AIEmployeeWorkspace() {
  const [statusIndex, setStatusIndex] = useState(0);
  const { currentOrgId } = useAuth();

  // 1. Fetch live metrics and business health score
  const { data: analytics } = useGetAnalyticsDashboard({ orgId: currentOrgId });
  const { data: healthData } = useBusinessHealthData({
    salesVelocity: 40,
    inventoryHealth: 30,
    whatsappResponseSla: 30
  }, currentOrgId);

  // Rotate activity state every 4 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setStatusIndex((prev) => (prev + 1) % STATUSES.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="w-full space-y-6"
    >
      <Card className="border border-card-border/60 shadow-sm relative overflow-hidden bg-card/45 backdrop-blur-md">
        {/* SECTION 1: EMPLOYEE IDENTITY */}
        <CardHeader className="pb-4 border-b border-muted-border/30">
          <div className="flex justify-between items-start flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center relative">
                <Bot size={20} />
                {/* Subtle online indicator */}
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-background animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-sm tracking-tight text-foreground">👔 AI Employee</h3>
                  <Badge variant="secondary" className="text-[10px] font-semibold py-0 px-2 bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                    Online
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground font-medium">Business Operations Manager</p>
              </div>
            </div>

            {/* SECTION 2: CURRENT ACTIVITY */}
            <div className="flex items-center gap-2 px-3 py-1.5 bg-muted/40 border border-muted-border/30 rounded-xl min-w-[240px] justify-between">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                <Activity size={10} className="text-primary animate-pulse" /> Action
              </span>
              <AnimatePresence mode="wait">
                <motion.span
                  key={statusIndex}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.25 }}
                  className="text-xs font-semibold text-primary text-right"
                >
                  {STATUSES[statusIndex]}
                </motion.span>
              </AnimatePresence>
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-6 space-y-6">
          {/* SECTION 3: TODAY'S EXECUTIVE SUMMARY */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles size={12} className="text-primary" /> Today's Executive Summary
            </h4>
            
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-4">
              {/* Reused Health Gauge */}
              <div className="flex flex-col items-center justify-center p-4 bg-muted/15 border border-muted-border/20 rounded-xl min-h-[92px]">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2">Business Health</span>
                {healthData ? (
                  <HealthGauge score={healthData.overallScore} status={healthData.status} />
                ) : (
                  <div className="w-12 h-12 rounded-full border-2 border-dashed border-muted animate-spin" />
                )}
              </div>

              {/* Today's Revenue */}
              <div className="p-4 bg-muted/15 border border-muted-border/20 rounded-xl space-y-1 min-h-[92px]">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">Today's Revenue</span>
                <span className="text-lg font-bold text-foreground">
                  INR {analytics?.revenueToday?.toLocaleString("en-IN") ?? "0"}
                </span>
                <span className="text-[10px] text-emerald-500 font-bold block">▲ +12% vs yesterday</span>
              </div>

              {/* Orders Fulfilled */}
              <div className="p-4 bg-muted/15 border border-muted-border/20 rounded-xl space-y-1 min-h-[92px]">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">Orders Fulfilled</span>
                <span className="text-lg font-bold text-foreground">
                  {analytics?.ordersTotal ?? "0"}
                </span>
                <span className="text-[10px] text-muted-foreground block">4 pending in queue</span>
              </div>

              {/* Pending WhatsApp */}
              <div className="p-4 bg-muted/15 border border-muted-border/20 rounded-xl space-y-1 min-h-[92px]">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">WhatsApp Messages</span>
                <span className="text-lg font-bold text-foreground">11</span>
                <span className="text-[10px] text-amber-500 font-bold block">Unread Chats</span>
              </div>

              {/* Low Stock Items */}
              <div className="p-4 bg-muted/15 border border-muted-border/20 rounded-xl space-y-1 min-h-[92px] col-span-2 sm:col-span-1">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">Low Stock Items</span>
                <span className="text-lg font-bold text-foreground">2</span>
                <span className="text-[10px] text-amber-500 font-bold block">Requires attention</span>
              </div>
            </div>
          </div>

          {/* Interactive Interaction Area (Voice Entry + Conversation Workspace) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-muted-border/30">
            {/* SECTION 4: VOICE ENTRY POINT */}
            <div className="flex flex-col items-center justify-center p-6 bg-muted/10 border border-muted-border/20 rounded-xl text-center space-y-4">
              {/* TODO: Integrate future Web Speech API / Voice Service listeners here */}
              <div className="relative">
                <Button
                  size="icon"
                  className="w-16 h-16 rounded-full bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 shadow-md flex items-center justify-center cursor-default"
                  aria-label="Talk to your AI Employee"
                >
                  <Mic size={24} />
                </Button>
                {/* Visual pulse rings */}
                <div className="absolute inset-0 rounded-full border border-primary/20 animate-ping opacity-25 pointer-events-none" />
              </div>
              <div className="space-y-1">
                <h5 className="font-bold text-sm text-foreground">Talk to your AI Employee</h5>
                <p className="text-xs text-muted-foreground max-w-xs">
                  Use your voice to ask about your business. (Press mic to begin)
                </p>
              </div>
            </div>

            {/* SECTION 6: CONVERSATION AREA */}
            <div className="flex flex-col justify-between p-6 bg-muted/10 border border-muted-border/20 rounded-xl min-h-[170px]">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
                Conversation Workspace
              </span>
              
              {/* TODO: Embed conversation history list rendering logic here */}
              <div className="flex-1 flex flex-col items-center justify-center py-4 text-center">
                <HelpCircle size={20} className="text-muted-foreground/60 mb-2" />
                <p className="text-xs text-muted-foreground max-w-sm">
                  No conversation yet. Press the microphone to begin talking with your AI Employee.
                </p>
              </div>

              <div className="text-[9px] text-muted-foreground border-t border-muted-border/20 pt-2 text-right">
                Future Integration Layer
              </div>
            </div>
          </div>

          {/* SECTION 5: SUGGESTED QUESTIONS */}
          <div className="space-y-2 pt-2">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
              Suggested Queries
            </span>
            <div className="flex flex-wrap gap-2">
              {SUGGESTED_QUESTIONS.map((q, idx) => (
                <button
                  key={idx}
                  className="px-3 py-1.5 bg-card hover:bg-muted text-xs font-semibold text-foreground border border-card-border/60 hover:border-primary/20 rounded-xl shadow-xs transition-all duration-150 cursor-pointer"
                  onClick={() => console.log(`Suggested click: ${q}`)}
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
