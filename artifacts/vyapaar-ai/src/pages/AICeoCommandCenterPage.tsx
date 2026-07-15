import { useEffect, useState } from "react";
import { Link } from "wouter";
import { useAuth } from "../hooks/useAuth";
import { useLanguage } from "../hooks/useLanguage";
import { useGetAnalyticsDashboard, useGetBusinessProfile } from "@workspace/api-client-react";
import { useAICeoCommandData } from "../hooks/useAICeo";
import { BusinessHealthCard } from "../components/health/BusinessHealthCard";
import { AIEmployeeWorkspace } from "../components/employee/AIEmployeeWorkspace";
import { useToast } from "../hooks/use-toast";
import { AICeoProposal } from "../types/aiCeo";
import {
  Bot,
  TrendingUp,
  Award,
  Zap,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Play,
  Send,
  X,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  ChevronRight,
  RefreshCw,
  Eye,
  LineChart,
  ShoppingBag,
  Users,
  Camera,
  HelpCircle,
  Globe,
  MessageCircle,
  UserCheck
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";

interface ProposalDetailTableProps {
  details: Record<string, any>;
}

function ProposalDetailTable({ details }: ProposalDetailTableProps) {
  if (!details) return null;

  if (details.items) {
    return (
      <div className="space-y-1 mt-2">
        <p className="font-semibold text-foreground">Purchase details:</p>
        <div className="border border-muted-border rounded-lg overflow-hidden bg-card">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-muted text-muted-foreground border-b border-muted-border">
                <th className="p-2">Item Name</th>
                <th className="p-2 text-right">Qty</th>
              </tr>
            </thead>
            <tbody>
              {details.items.map((item: any, idx: number) => (
                <tr key={idx} className="border-b border-muted-border last:border-0">
                  <td className="p-2 font-medium">{item.name}</td>
                  <td className="p-2 text-right">{item.qty}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  if (details.products) {
    return (
      <div className="space-y-1 mt-2">
        <p className="font-semibold text-foreground">Adjustments:</p>
        <div className="border border-muted-border rounded-lg overflow-hidden bg-card">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-muted text-muted-foreground border-b border-muted-border">
                <th className="p-2">Product</th>
                <th className="p-2 text-right">Old Price</th>
                <th className="p-2 text-right text-emerald-600">New Price</th>
              </tr>
            </thead>
            <tbody>
              {details.products.map((prod: any, idx: number) => (
                <tr key={idx} className="border-b border-muted-border last:border-0">
                  <td className="p-2 font-medium">{prod.name}</td>
                  <td className="p-2 text-right line-through text-muted-foreground">INR {prod.oldPrice}</td>
                  <td className="p-2 text-right font-bold text-emerald-600">INR {prod.newPrice}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  return null;
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

export default function AICeoCommandCenterPage({ onToggleView, currentMode }: { onToggleView?: (mode: string) => void; currentMode?: string }) {
  const { user, currentOrgId } = useAuth();
  const { language } = useLanguage();
  const { toast } = useToast();

  // 1. Fetch live organization profile and metrics
  const { data: profile } = useGetBusinessProfile(
    { orgId: currentOrgId },
    { query: { enabled: !!user } as any }
  );

  const {
    data: analytics,
    isLoading: loadingAnalytics,
    error: errorAnalytics,
    refetch: refetchAnalytics
  } = useGetAnalyticsDashboard(
    { orgId: currentOrgId },
    { query: { enabled: !!user } as any }
  );

  // 2. Fetch AI CEO Command Data (Missions, Standup, Agents, Timeline)
  const {
    data: aiData,
    isLoading: loadingAi,
    error: errorAi,
    refetch: refetchAi
  } = useAICeoCommandData(profile?.category || "General");

  // Local state for proposal action queue (Work Waiting for Approval)
  const [actionQueue, setActionQueue] = useState<AICeoProposal[]>([]);
  const [feedbackTarget, setFeedbackTarget] = useState<string | null>(null);
  const [feedbackText, setFeedbackText] = useState("");
  const [expandedProposal, setExpandedProposal] = useState<string | null>(null);

  useEffect(() => {
    if (aiData?.proposals) {
      setActionQueue(aiData.proposals);
    }
  }, [aiData]);

  // Actions
  const handleApprove = (id: string, title: string) => {
    setActionQueue((prev) => prev.filter((p) => p.id !== id));
    toast({
      title: "Action Dispatched",
      description: `"${title}" has been successfully approved and automated execution has started.`,
    });
  };

  const handleReject = (id: string, title: string) => {
    setActionQueue((prev) => prev.filter((p) => p.id !== id));
    toast({
      title: "Action Deferred",
      description: `"${title}" has been removed from today's active proposals.`,
    });
  };

  const handleFeedbackSubmit = (id: string, title: string) => {
    if (!feedbackText.trim()) return;
    const sanitizedFeedback = escapeHtml(feedbackText);
    setActionQueue((prev) => prev.filter((p) => p.id !== id));
    toast({
      title: "Adjustments Submitted",
      description: `Instruction sent: "${sanitizedFeedback}". AI Assistant is adjusting values.`,
    });
    setFeedbackTarget(null);
    setFeedbackText("");
  };

  const handleReload = () => {
    refetchAnalytics();
    refetchAi();
  };

  const isLoading = loadingAnalytics || loadingAi;
  const isError = !!errorAnalytics || !!errorAi;
  const greeting = language === "te" ? "నమస్తే" : "Namaste";
  const userInitial = user?.displayName?.[0] || user?.email?.[0]?.toUpperCase() || "U";
  const businessName = profile?.category ? `${profile.category} Store` : "Vyapaar Partner";

  // Render Skeletons during fetch
  if (isLoading) {
    return (
      <div className="p-4 md:p-8 max-w-6xl mx-auto pt-8 space-y-8">
        <div className="flex items-center gap-4 animate-pulse">
          <div className="w-14 h-14 rounded-full bg-muted" />
          <div className="space-y-2 flex-1">
            <div className="h-6 w-48 bg-muted rounded" />
            <div className="h-4 w-72 bg-muted rounded" />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="h-32 bg-muted rounded-2xl animate-pulse" />
          <div className="h-32 bg-muted rounded-2xl animate-pulse" />
          <div className="h-32 bg-muted rounded-2xl animate-pulse" />
        </div>
        <div className="h-48 bg-muted rounded-2xl animate-pulse" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 h-96 bg-muted rounded-2xl animate-pulse" />
          <div className="h-96 bg-muted rounded-2xl animate-pulse" />
        </div>
      </div>
    );
  }

  // Render Error fallback
  if (isError) {
    return (
      <div className="p-4 md:p-8 max-w-6xl mx-auto pt-16 flex flex-col items-center justify-center text-center space-y-6">
        <div className="w-16 h-16 rounded-full bg-red-500/10 text-red-500 flex items-center justify-center shadow-inner">
          <AlertTriangle size={32} />
        </div>
        <div className="max-w-md">
          <h2 className="text-2xl font-bold mb-2">Sync Connection Error</h2>
          <p className="text-muted-foreground">
            We couldn't sync with your AI Employee operational context. Check your active database parameters and refresh.
          </p>
        </div>
        <Button onClick={handleReload} className="gap-2">
          <RefreshCw size={16} />
          Reconnect AI Employee
        </Button>
      </div>
    );
  }

  // Render Empty State (Requires setup)
  const hasNoProfile = !profile || !profile.orgId;
  if (hasNoProfile) {
    return (
      <div className="p-4 md:p-8 max-w-5xl mx-auto pt-12">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-primary/10 to-accent/10 border border-primary/20 rounded-3xl p-8 md:p-12 text-center flex flex-col items-center relative overflow-hidden group shadow-md"
        >
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center text-primary-foreground mb-6 shadow-md shadow-primary/20">
            <Bot size={40} />
          </div>
          <h2 className="text-3xl font-extrabold mb-4 tracking-tight">AI CEO Employee ready to activate!</h2>
          <p className="text-muted-foreground mb-8 max-w-lg text-lg leading-relaxed">
            Vyapaar AI requires information about your business to deploy automated chats, digital storefront visibility maps, and catalog adjusters.
          </p>
          <Link href="/ai-setup">
            <Button size="lg" className="px-8 py-6 rounded-xl font-bold text-lg gap-2 shadow-lg shadow-primary/20 hover:scale-[1.02] transition-all">
              <Sparkles size={20} />
              Deploy AI Business Agent
              <ArrowRight size={20} />
            </Button>
          </Link>
          <div className="absolute right-0 bottom-0 opacity-5 pointer-events-none transform translate-x-1/4 translate-y-1/4">
            <Bot size={400} />
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="relative min-h-full pb-16">
      {/* Visual Accent Top Line */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-accent to-transparent" />

      <div className="p-4 md:p-8 max-w-6xl mx-auto pt-8 space-y-8">
        {/* SECTION 1: GREETING */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center text-primary-foreground text-2xl font-bold shadow-md shadow-primary/15 relative overflow-hidden">
              <Bot size={28} className="animate-pulse" />
              <div className="absolute inset-0 bg-white/15 mix-blend-overlay" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-extrabold text-foreground mb-1 tracking-tight flex items-center gap-2">
                {greeting}, <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">{user?.displayName || user?.email?.split("@")[0]}</span>!
              </h1>
              <p className="text-muted-foreground text-sm md:text-base flex items-center gap-2">
                <ShieldCheck size={16} className="text-primary" />
                AI Business CEO active for <span className="font-semibold text-foreground">{profile.tagline || businessName}</span>
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 self-start md:self-auto">
            {onToggleView && (
              <div className="flex bg-muted p-1 rounded-xl border border-muted-border max-h-[36px]">
                <button
                  onClick={() => onToggleView("ai-ceo")}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                    currentMode === "ai-ceo"
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  AI CEO
                </button>
                <button
                  onClick={() => onToggleView("dashboard")}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                    currentMode === "dashboard"
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Analytics
                </button>
              </div>
            )}
            <Link href="/insights">
              <Button variant="outline" size="sm" className="gap-2 rounded-xl text-sm font-semibold border-muted-border">
                <LineChart size={15} />
                Insights
              </Button>
            </Link>
          </div>
        </header>

        {/* AI EMPLOYEE WORKSPACE */}
        <AIEmployeeWorkspace />

        {/* SECTION 2: BUSINESS HEALTH */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Reusable Business Health Engine Cockpit (Col Span 8) */}
          <div className="lg:col-span-8">
            <BusinessHealthCard />
          </div>
          
          {/* Quick Metrics Summary Boxes (Col Span 4) */}
          <div className="lg:col-span-4 flex flex-col justify-between gap-4">
            {/* Revenue */}
            <Card className="border border-card-border/60 hover:shadow-sm transition-shadow duration-300 relative overflow-hidden group flex-1">
              <CardHeader className="pb-1 pt-4">
                <CardDescription className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex justify-between items-center">
                  <span>Revenue Today</span>
                  <TrendingUp size={14} className="text-emerald-500" />
                </CardDescription>
                <CardTitle className="text-2xl font-bold pt-0.5">
                  INR {analytics?.revenueToday?.toLocaleString("en-IN") || "0"}
                </CardTitle>
              </CardHeader>
              <CardContent className="pb-3">
                <p className="text-[11px] text-muted-foreground">
                  <span className="text-emerald-500 font-bold">▲ +12%</span> vs yesterday average
                </p>
              </CardContent>
            </Card>

            {/* Orders */}
            <Card className="border border-card-border/60 hover:shadow-sm transition-shadow duration-300 relative overflow-hidden group flex-1">
              <CardHeader className="pb-1 pt-4">
                <CardDescription className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex justify-between items-center">
                  <span>Orders Fulfilled</span>
                  <ShoppingBag size={14} className="text-blue-500" />
                </CardDescription>
                <CardTitle className="text-2xl font-bold pt-0.5">
                  {analytics?.ordersTotal || "0"}
                </CardTitle>
              </CardHeader>
              <CardContent className="pb-3">
                <p className="text-[11px] text-muted-foreground">
                  <span className="text-emerald-500 font-bold">4 pending</span> orders in queue
                </p>
              </CardContent>
            </Card>

            {/* Customers */}
            <Card className="border border-card-border/60 hover:shadow-sm transition-shadow duration-300 relative overflow-hidden group flex-1">
              <CardHeader className="pb-1 pt-4">
                <CardDescription className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex justify-between items-center">
                  <span>Customer Base</span>
                  <Users size={14} className="text-purple-500" />
                </CardDescription>
                <CardTitle className="text-2xl font-bold pt-0.5">
                  {analytics?.customersCount || "0"}
                </CardTitle>
              </CardHeader>
              <CardContent className="pb-3">
                <p className="text-[11px] text-muted-foreground">
                  <span className="text-emerald-500 font-bold">▲ +8 new</span> contacts this week
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* SECTION 3: MORNING STANDUP */}
        {aiData?.standup && (
          <section className="bg-card border border-primary/20 rounded-2xl p-6 shadow-sm relative overflow-hidden flex items-start gap-4">
            <div className="p-3 bg-primary/10 rounded-xl text-primary flex-shrink-0">
              <UserCheck size={28} />
            </div>
            <div className="space-y-3">
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-primary flex items-center gap-1.5">
                  <Sparkles size={14} /> Morning Standup Briefing
                </h3>
                <p className="text-xs text-muted-foreground">{aiData.standup.greetingContext}</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                <div className="p-3 bg-muted/40 rounded-xl space-y-1">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Yesterday's Actions</p>
                  <p className="text-xs text-foreground font-medium leading-relaxed">{aiData.standup.yesterdaySummary}</p>
                </div>
                <div className="p-3 bg-muted/40 rounded-xl space-y-1">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Today's Schedule</p>
                  <p className="text-xs text-foreground font-medium leading-relaxed">{aiData.standup.todayPlan}</p>
                </div>
                <div className="p-3 bg-primary/5 border border-primary/10 rounded-xl space-y-1">
                  <p className="text-[10px] font-bold text-primary uppercase tracking-wider">Proactive Recommendation</p>
                  <p className="text-xs text-foreground font-semibold leading-relaxed">{aiData.standup.recommendation}</p>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* SECTION 4: TODAY'S ACTIVE MISSION */}
        {aiData?.mission && (
          <Link href="/missions" className="block group">
            <section className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border border-primary/20 rounded-2xl p-6 shadow-sm hover:border-accent/40 cursor-pointer flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden transition-all duration-300">
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 bg-primary/20 text-primary font-bold text-xs uppercase tracking-wider rounded-lg group-hover:bg-primary/30 transition-colors">
                    Today's Mission
                  </span>
                  <span className="text-xs text-muted-foreground flex items-center gap-1 font-semibold">
                    <Award size={14} className="text-accent" />
                    {aiData.mission.category}
                  </span>
                </div>
                <h2 className="text-xl md:text-2xl font-bold tracking-tight text-foreground group-hover:text-primary transition-colors flex items-center gap-2">
                  {aiData.mission.description}
                  <ChevronRight size={20} className="text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </h2>
                <p className="text-sm text-muted-foreground flex items-center gap-2">
                  <span className="font-semibold text-foreground">Target:</span> {aiData.mission.target}
                </p>
              </div>
              
              <div className="w-full md:w-64 space-y-2">
                <div className="flex justify-between text-sm font-semibold">
                  <span>Mission Progress</span>
                  <span className="text-primary font-bold">{aiData.mission.progress}%</span>
                </div>
                <div className="w-full h-3 bg-muted rounded-full overflow-hidden border border-muted-border">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${aiData.mission.progress}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    className="h-full bg-gradient-to-r from-primary to-accent rounded-full"
                  />
                </div>
              </div>
              <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full blur-2xl -z-10" />
            </section>
          </Link>
        )}

        {/* BOTTOM COLUMN ROW (Work approvals vs timeline/agent activities) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* LEFT SIDEBAR: Approvals (Section 7) & Quick Actions (Section 8) */}
          <div className="lg:col-span-2 space-y-8">
            {/* SECTION 7: WORK WAITING FOR APPROVAL */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-extrabold flex items-center gap-2 tracking-tight">
                  <Zap size={20} className="text-accent" />
                  Work Waiting for Approval
                </h3>
                <span className="text-xs font-bold px-2.5 py-1 bg-muted text-muted-foreground rounded-full border border-muted-border/30">
                  {actionQueue.length} approvals pending
                </span>
              </div>

              <AnimatePresence mode="popLayout">
                {actionQueue.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    className="bg-card border border-card-border rounded-2xl p-8 text-center flex flex-col items-center justify-center"
                  >
                    <div className="p-4 bg-emerald-500/10 text-emerald-500 rounded-full mb-4">
                      <CheckCircle2 size={32} />
                    </div>
                    <h4 className="text-lg font-bold mb-1">Approvals Queue Complete</h4>
                    <p className="text-sm text-muted-foreground max-w-sm">
                      There are no pending actions waiting for review. The AI CEO is monitoring business flows in the background.
                    </p>
                  </motion.div>
                ) : (
                  <div className="space-y-4">
                    {actionQueue.map((proposal) => {
                      const isExpanded = expandedProposal === proposal.id;
                      const isTargetedForFeedback = feedbackTarget === proposal.id;

                      return (
                        <motion.div
                          key={proposal.id}
                          layout
                          initial={{ opacity: 0, y: 15 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, x: -100 }}
                          transition={{ type: "spring", damping: 25, stiffness: 200 }}
                          className="bg-card border border-card-border/60 hover:border-card-border rounded-xl shadow-sm overflow-hidden"
                        >
                          <div className="p-5 space-y-3">
                            <div className="flex justify-between items-start gap-4">
                              <div className="space-y-1">
                                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 bg-secondary text-secondary-foreground rounded-md">
                                  {proposal.category.replace("_", " ")}
                                </span>
                                <h4 className="text-lg font-bold tracking-tight">{proposal.title}</h4>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-xs font-semibold gap-1 text-primary"
                                onClick={() => setExpandedProposal(isExpanded ? null : proposal.id)}
                              >
                                <Eye size={14} />
                                {isExpanded ? "Hide details" : "Review parameters"}
                              </Button>
                            </div>

                            <p className="text-sm text-muted-foreground leading-relaxed">
                              {proposal.description}
                            </p>

                            {/* Action Parameters Table Details Drawer */}
                            <AnimatePresence>
                              {isExpanded && (
                                <motion.div
                                  initial={{ height: 0, opacity: 0 }}
                                  animate={{ height: "auto", opacity: 1 }}
                                  exit={{ height: 0, opacity: 0 }}
                                  className="overflow-hidden border-t border-muted-border/30 pt-4 mt-2 space-y-3"
                                >
                                  <div className="p-3 bg-muted/50 rounded-xl space-y-2 text-xs">
                                    <p className="font-semibold text-foreground">Parameters Details:</p>
                                    <p className="text-muted-foreground mb-2">{proposal.summary}</p>
                                    
                                    <p className="font-semibold text-foreground">Action Type:</p>
                                    <p className="text-muted-foreground mb-2 flex items-center gap-1 font-mono">
                                      <Play size={10} /> {proposal.proposedAction}
                                    </p>

                                    <ProposalDetailTable details={proposal.details} />
                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>

                            {/* Action Buttons */}
                            <div className="flex flex-wrap gap-2 pt-2 border-t border-muted-border/30">
                              {!isTargetedForFeedback ? (
                                <>
                                  <Button
                                    size="sm"
                                    className="bg-emerald-600 text-white hover:bg-emerald-700 font-semibold gap-1.5"
                                    onClick={() => handleApprove(proposal.id, proposal.title)}
                                  >
                                    <CheckCircle2 size={15} />
                                    Approve Action
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="text-amber-600 border-amber-600/30 hover:bg-amber-500/10 font-semibold gap-1.5"
                                    onClick={() => setFeedbackTarget(proposal.id)}
                                  >
                                    <RefreshCw size={15} />
                                    Request Adjustments
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className="text-red-500 hover:bg-red-500/10 gap-1.5"
                                    onClick={() => handleReject(proposal.id, proposal.title)}
                                  >
                                    <X size={15} />
                                    Reject
                                  </Button>
                                </>
                              ) : (
                                <motion.div
                                  initial={{ opacity: 0, width: 0 }}
                                  animate={{ opacity: 1, width: "100%" }}
                                  className="w-full space-y-3 pt-2"
                                >
                                  <div className="flex gap-2">
                                    <input
                                      type="text"
                                      placeholder="Tell the AI what to change..."
                                      value={feedbackText}
                                      onChange={(e) => setFeedbackText(e.target.value)}
                                      className="flex-1 px-3 py-2 border border-muted-border rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-primary bg-card"
                                      autoFocus
                                    />
                                    <Button
                                      size="sm"
                                      onClick={() => handleFeedbackSubmit(proposal.id, proposal.title)}
                                      disabled={!feedbackText.trim()}
                                      className="gap-1.5"
                                    >
                                      <Send size={14} />
                                      Send
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      onClick={() => {
                                        setFeedbackTarget(null);
                                        setFeedbackText("");
                                      }}
                                    >
                                      Cancel
                                    </Button>
                                  </div>
                                </motion.div>
                              )}
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                )}
              </AnimatePresence>
            </div>

            {/* SECTION 8: QUICK ACTIONS */}
            <div className="space-y-4">
              <h3 className="text-xl font-extrabold flex items-center gap-2 tracking-tight">
                <Zap size={20} className="text-accent" />
                Quick Actions
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { name: "View Website", icon: Globe, path: "/website", color: "text-blue-500 bg-blue-500/10" },
                  { name: "WhatsApp Chatbot", icon: MessageCircle, path: "/whatsapp", color: "text-emerald-500 bg-emerald-500/10" },
                  { name: "Support Ticket", icon: HelpCircle, path: "/support", color: "text-purple-500 bg-purple-500/10" },
                  { name: "Scan Bill Invoice", icon: Camera, path: "/ocr-billing", color: "text-orange-500 bg-orange-500/10" }
                ].map((act, idx) => (
                  <Link key={idx} href={act.path}>
                    <Card className="border border-card-border/60 hover:border-primary/40 hover:shadow-sm transition-all duration-200 p-4 text-center cursor-pointer flex flex-col items-center justify-center space-y-2 group">
                      <div className={`p-3 rounded-xl transition-colors ${act.color}`}>
                        <act.icon size={20} />
                      </div>
                      <span className="text-xs font-bold text-foreground group-hover:text-primary transition-colors">
                        {act.name}
                      </span>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT SIDEBAR: Employee Activity & Timeline */}
          <div className="space-y-8">
            {/* SECTION 5: EMPLOYEE ACTIVITY */}
            <div className="space-y-4">
              <h3 className="text-xl font-extrabold flex items-center gap-2 tracking-tight">
                <Bot size={20} className="text-primary" />
                AI Employee Status
              </h3>
              <div className="space-y-3">
                {aiData?.agents.map((agent) => (
                  <Card key={agent.id} className="border border-card-border/60 p-4 space-y-2 relative overflow-hidden">
                    <div className="flex justify-between items-center">
                      <h4 className="text-sm font-bold text-foreground">{agent.name}</h4>
                      <div className="flex items-center gap-1.5">
                        <span className={`w-2 h-2 rounded-full ${agent.status === "active" ? "bg-emerald-500 animate-ping" : "bg-muted"}`} />
                        <span className={`w-2 h-2 rounded-full absolute ${agent.status === "active" ? "bg-emerald-500" : "bg-muted"}`} />
                        <span className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground pl-1">
                          {agent.status}
                        </span>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {agent.description}
                    </p>
                    <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                      <Clock size={10} /> {agent.lastActive}
                    </p>
                  </Card>
                ))}
              </div>
            </div>

            {/* SECTION 6: BUSINESS TIMELINE */}
            <div className="space-y-4">
              <h3 className="text-xl font-extrabold flex items-center gap-2 tracking-tight">
                <Clock size={20} className="text-muted-foreground" />
                Business Timeline
              </h3>
              <div className="relative border-l border-muted-border pl-5 ml-3 space-y-6 text-xs">
                {aiData?.timeline.map((event) => {
                  const nodeColors =
                    event.type === "observation"
                      ? "bg-blue-500 text-white"
                      : event.type === "plan"
                      ? "bg-amber-500 text-white"
                      : event.type === "execution"
                      ? "bg-emerald-500 text-white"
                      : "bg-purple-500 text-white";

                  return (
                    <div key={event.id} className="relative space-y-1">
                      {/* Timeline Node Ring */}
                      <span className={`absolute -left-[27px] top-0 w-3.5 h-3.5 rounded-full border-2 border-background flex items-center justify-center ${nodeColors}`} />
                      
                      <div className="flex justify-between text-muted-foreground font-semibold">
                        <span className="capitalize">{event.type}</span>
                        <span>{event.timestamp}</span>
                      </div>
                      <h5 className="font-bold text-foreground">{event.message}</h5>
                      {event.details && <p className="text-muted-foreground leading-relaxed pt-0.5">{event.details}</p>}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
