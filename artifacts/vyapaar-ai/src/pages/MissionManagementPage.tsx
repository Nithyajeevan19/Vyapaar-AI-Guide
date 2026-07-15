import { useEffect, useState } from "react";
import { Link } from "wouter";
import { useAuth } from "../hooks/useAuth";
import { useLanguage } from "../hooks/useLanguage";
import { useGetBusinessProfile } from "@workspace/api-client-react";
import { useBusinessMissions } from "../hooks/useMissions";
import { useToast } from "../hooks/use-toast";
import { BusinessMission, MissionSubTask } from "../types/mission";
import {
  Target,
  Clock,
  TrendingUp,
  AlertTriangle,
  Play,
  CheckCircle2,
  ChevronRight,
  ShieldCheck,
  Send,
  Bot,
  Sparkles,
  ArrowLeft,
  Info,
  Layers,
  Award,
  Circle,
  CheckSquare,
  Square
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";

export default function MissionManagementPage() {
  const { user, currentOrgId } = useAuth();
  const { language } = useLanguage();
  const { toast } = useToast();

  // Fetch store type to align mission profiles
  const { data: profile } = useGetBusinessProfile(
    { orgId: currentOrgId },
    { query: { enabled: !!user } as any }
  );

  // Fetch Mission Data List via React Query
  const {
    data: missions,
    isLoading,
    error,
    refetch
  } = useBusinessMissions(profile?.category || "General");

  // Local state to manage active mission adjustments & subtask completions via derived state
  const [selectedMissionId, setSelectedMissionId] = useState<string | null>(null);
  const [subtaskOverrides, setSubtaskOverrides] = useState<Record<string, boolean>>({});
  const [completedActionIds, setCompletedActionIds] = useState<Record<string, boolean>>({});

  // Deriving the selected mission parameters
  const baseMission = missions?.find((m) => 
    selectedMissionId ? m.id === selectedMissionId : m.status === "active"
  ) || missions?.[0];

  const subTasks = baseMission
    ? baseMission.subTasks.map((task) => {
        const override = subtaskOverrides[task.id];
        const status = override !== undefined 
          ? (override ? "completed" : "pending") 
          : task.status;
        return { ...task, status };
      })
    : [];

  const completedCount = subTasks.filter((t) => t.status === "completed").length;
  const progress = subTasks.length > 0 ? Math.round((completedCount / subTasks.length) * 100) : 0;

  const actionsQueue = baseMission
    ? baseMission.preparedActions.filter((act) => !completedActionIds[act.id])
    : [];

  const selectedMission = baseMission
    ? {
        ...baseMission,
        subTasks,
        progress,
      }
    : null;

  // Subtask Completion Toggler (updates derived states overrides)
  const handleToggleSubtask = (subtaskId: string) => {
    if (!baseMission) return;
    const task = baseMission.subTasks.find((t) => t.id === subtaskId);
    if (!task) return;

    const currentCompleted = subtaskOverrides[subtaskId] !== undefined
      ? subtaskOverrides[subtaskId]
      : task.status === "completed";

    const nextCompleted = !currentCompleted;

    setSubtaskOverrides((prev) => ({
      ...prev,
      [subtaskId]: nextCompleted,
    }));

    // Calculate next progress percentage for reporting in the toast
    const nextSubTasks = baseMission.subTasks.map((t) => {
      const override = t.id === subtaskId ? nextCompleted : subtaskOverrides[t.id];
      const status = override !== undefined
        ? (override ? "completed" : "pending")
        : t.status;
      return { ...t, status };
    });
    const nextCompletedCount = nextSubTasks.filter((t) => t.status === "completed").length;
    const nextProgress = Math.round((nextCompletedCount / nextSubTasks.length) * 100);

    toast({
      title: "Task Checkpoint Updated",
      description: `Task status updated. Current mission progress recalculated to ${nextProgress}%.`,
    });
  };

  // Execution Approval Action Center
  const handleActionApprove = (actionId: string, actionTitle: string) => {
    setCompletedActionIds((prev) => ({ ...prev, [actionId]: true }));
    toast({
      title: "Action Fired Successfully",
      description: `Successfully executed prepared action: "${actionTitle}".`,
    });
  };

  // Render Loader Skeleton states
  if (isLoading) {
    return (
      <div className="p-4 md:p-8 max-w-6xl mx-auto pt-8 space-y-6">
        <div className="h-6 w-32 bg-muted rounded animate-pulse" />
        <div className="h-12 w-96 bg-muted rounded animate-pulse" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 h-[500px] bg-muted rounded-2xl animate-pulse" />
          <div className="h-[500px] bg-muted rounded-2xl animate-pulse" />
        </div>
      </div>
    );
  }

  // Render Error Sync Fallback states
  if (error) {
    return (
      <div className="p-4 md:p-8 max-w-6xl mx-auto pt-16 flex flex-col items-center justify-center text-center space-y-6">
        <div className="w-16 h-16 rounded-full bg-red-500/10 text-red-500 flex items-center justify-center shadow-inner">
          <AlertTriangle size={32} />
        </div>
        <div>
          <h2 className="text-2xl font-bold mb-2">Sync Error</h2>
          <p className="text-muted-foreground max-w-md">
            Could not fetch mission schedules. Please verify connection credentials and refresh.
          </p>
        </div>
        <Button onClick={() => refetch()} className="gap-2">
          <Clock size={16} />
          Retry Sync
        </Button>
      </div>
    );
  }

  return (
    <div className="relative min-h-full pb-16">
      {/* Decorative Gradient Overlay */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-accent via-primary to-transparent" />

      <div className="p-4 md:p-8 max-w-6xl mx-auto pt-8 space-y-8">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Link href="/dashboard" className="hover:text-foreground flex items-center gap-1 font-semibold transition-colors">
            <ArrowLeft size={14} />
            AI CEO Center
          </Link>
          <ChevronRight size={14} />
          <span>Mission Control</span>
        </div>

        {/* PAGE HEADER */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-muted-border/30 pb-6">
          <div className="space-y-1">
            <h1 className="text-3xl font-extrabold tracking-tight flex items-center gap-3">
              <Target className="text-accent" size={32} />
              Mission Control
            </h1>
            <p className="text-muted-foreground text-sm md:text-base flex items-center gap-2">
              <ShieldCheck size={16} className="text-primary" />
              Active AI Operations Manager
            </p>
          </div>
          <div className="text-xs px-3 py-1.5 bg-accent/15 border border-accent/20 text-accent font-bold rounded-xl flex items-center gap-1.5 shadow-sm">
            <Sparkles size={14} /> Autopilot Active
          </div>
        </header>

        {/* MAIN OPERATIONS WORKSPACE GRID */}
        {selectedMission ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            {/* LEFT COLUMN - Mission detailed analysis (Explainable AI reasoning) */}
            <div className="lg:col-span-2 space-y-6">
              {/* Mission Heading */}
              <Card className="border border-card-border/60 shadow-sm relative overflow-hidden">
                <CardHeader className="pb-4">
                  <div className="flex justify-between items-center mb-3">
                    <span className="px-2.5 py-1 bg-red-500/10 text-red-500 font-extrabold text-xs uppercase tracking-wider rounded-lg border border-red-500/20">
                      {selectedMission.priority} Priority
                    </span>
                    <span className="text-xs text-muted-foreground flex items-center gap-1 font-semibold">
                      <Clock size={14} />
                      {selectedMission.estimatedTime}
                    </span>
                  </div>
                  <CardTitle className="text-xl md:text-2xl font-bold tracking-tight">
                    {selectedMission.title}
                  </CardTitle>
                  <CardDescription className="text-sm pt-2 leading-relaxed">
                    {selectedMission.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Progress panel */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm font-semibold">
                      <span>Execution Progress</span>
                      <span className="text-accent font-bold">{selectedMission.progress}%</span>
                    </div>
                    <div className="w-full h-3 bg-muted rounded-full overflow-hidden border border-muted-border">
                      <motion.div
                        layout
                        className="h-full bg-gradient-to-r from-accent to-primary"
                        style={{ width: `${selectedMission.progress}%` }}
                        transition={{ type: "spring", stiffness: 100, damping: 20 }}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Explainable AI block (Reasoning why generated) */}
              <Card className="border border-card-border/60 bg-muted/30 relative overflow-hidden">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base font-bold flex items-center gap-2">
                    <Info size={16} className="text-primary" />
                    AI Reasoning (Explainable AI)
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-xs text-muted-foreground leading-relaxed space-y-3">
                  <p>{selectedMission.reason}</p>
                  <div className="p-3 bg-accent/5 border border-accent/10 rounded-xl flex items-center gap-3">
                    <TrendingUp size={20} className="text-accent flex-shrink-0" />
                    <p className="text-xs text-foreground font-semibold">
                      <span className="text-accent">Business Impact:</span> {selectedMission.businessImpact}
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Sub-tasks interactive Checklist */}
              <Card className="border border-card-border/60">
                <CardHeader>
                  <CardTitle className="text-lg font-bold flex items-center gap-2">
                    <CheckCircle2 size={20} className="text-emerald-500" />
                    Interactive Execution Checklist
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Mark items completed to update overall mission progress dynamically.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {selectedMission.subTasks.map((task) => {
                    const isCompleted = task.status === "completed";

                    return (
                      <div
                        key={task.id}
                        onClick={() => handleToggleSubtask(task.id)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            handleToggleSubtask(task.id);
                          }
                        }}
                        tabIndex={0}
                        role="checkbox"
                        aria-checked={isCompleted}
                        className={`p-3 border rounded-xl flex items-center justify-between gap-4 cursor-pointer transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                          isCompleted
                            ? "bg-emerald-500/5 border-emerald-500/20 text-emerald-600 dark:text-emerald-400"
                            : "bg-card border-card-border/60 text-foreground hover:bg-muted/40"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          {isCompleted ? (
                            <CheckSquare size={18} className="text-emerald-500 flex-shrink-0" />
                          ) : (
                            <Square size={18} className="text-muted-foreground flex-shrink-0" />
                          )}
                          <span className={`text-xs font-semibold ${isCompleted ? "line-through opacity-80" : ""}`}>
                            {task.title}
                          </span>
                        </div>
                        <span className="text-[10px] px-2 py-0.5 bg-muted border rounded-md text-muted-foreground font-mono">
                          {task.timeEstimate}
                        </span>
                      </div>
                    );
                  })}
                </CardContent>
              </Card>
            </div>

            {/* RIGHT COLUMN - Automation triggers & Missions Backlog Queue */}
            <div className="space-y-6">
              {/* Prepared Actions (Autopilot Queue) */}
              <div className="space-y-4">
                <h3 className="text-base font-extrabold tracking-tight flex items-center gap-2">
                  <Play size={16} className="text-primary animate-pulse" />
                  Prepared Action Triggers
                </h3>
                <AnimatePresence mode="popLayout">
                  {actionsQueue.length === 0 ? (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0 }}
                      className="p-5 border rounded-xl text-center space-y-2 bg-card text-xs text-muted-foreground"
                    >
                      <CheckCircle2 size={24} className="text-emerald-500 mx-auto" />
                      <p className="font-semibold text-foreground">Actions Dispatched</p>
                      <p>All automated action triggers resolved for this mission.</p>
                    </motion.div>
                  ) : (
                    <div className="space-y-3">
                      {actionsQueue.map((act) => (
                        <motion.div
                          key={act.id}
                          layout
                          initial={{ opacity: 0, y: 15 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, x: 50 }}
                          className="p-4 border border-card-border/60 bg-card rounded-xl shadow-sm space-y-3"
                        >
                          <div className="space-y-1">
                            <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 bg-primary/10 text-primary border border-primary/20 rounded-md">
                              Automation Trigger
                            </span>
                            <h4 className="text-xs font-bold text-foreground pt-1">{act.title}</h4>
                          </div>
                          <p className="text-xs text-muted-foreground leading-relaxed">
                            {act.description}
                          </p>
                          <Button
                            size="sm"
                            className="w-full text-xs font-semibold gap-1.5"
                            onClick={() => handleActionApprove(act.id, act.title)}
                          >
                            <Send size={12} />
                            {act.actionText}
                          </Button>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </AnimatePresence>
              </div>

              {/* Missions Backlog List */}
              <div className="space-y-4">
                <h3 className="text-base font-extrabold tracking-tight flex items-center gap-2">
                  <Layers size={16} className="text-muted-foreground" />
                  Missions Log Queue
                </h3>
                <div className="space-y-3">
                  {missions?.map((m) => {
                    const isActive = m.id === selectedMission.id;
                    const isCompleted = m.status === "completed";

                    return (
                      <div
                        key={m.id}
                        onClick={() => {
                          setSelectedMissionId(m.id);
                        }}
                        className={`p-3 border rounded-xl cursor-pointer text-xs transition-all flex justify-between items-center gap-4 ${
                          isActive
                            ? "bg-primary/5 border-primary text-primary font-bold shadow-sm"
                            : "bg-card border-card-border/60 text-muted-foreground hover:bg-muted/40 hover:text-foreground"
                        }`}
                      >
                        <div className="space-y-1 flex-1 min-w-0">
                          <h4 className="font-bold truncate text-foreground">{m.title}</h4>
                          <p className="text-[10px] flex items-center gap-2">
                            <span className="capitalize">{m.status}</span>
                            <span>•</span>
                            <span>{m.progress}% complete</span>
                          </p>
                        </div>
                        {isCompleted ? (
                          <CheckCircle2 size={16} className="text-emerald-500 flex-shrink-0" />
                        ) : (
                          <Circle size={16} className="text-muted-foreground opacity-30 flex-shrink-0" />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-8 border border-dashed border-muted-border rounded-2xl text-center space-y-4">
            <Award size={32} className="mx-auto text-muted-foreground" />
            <h3 className="text-lg font-bold">No Missions Initialized</h3>
            <p className="text-xs text-muted-foreground max-w-sm mx-auto">
              Confirm your business profile information or configure items in the setup assistant to spawn operation missions.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
