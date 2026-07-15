import { useState } from "react";
import { 
  useGetWhatsAppLogs, 
  useGetWhatsAppSettings, 
  useUpdateWhatsAppSettings 
} from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "../hooks/useAuth";
import { 
  MessageCircle, 
  Settings, 
  ArrowRight, 
  Smartphone, 
  History, 
  CheckCircle2, 
  AlertCircle, 
  Bot, 
  ToggleLeft, 
  ToggleRight,
  Loader2
} from "lucide-react";
import { SkeletonCard } from "../components/SkeletonCard";

export default function WhatsAppPage() {
  const branchId = 1; // Default active branch
  const { currentOrgId } = useAuth();
  const orgId = currentOrgId;
  const { toast } = useToast();
  const [dummyMessage] = useState("Hello 👋,\n\nYour order has been confirmed and is being processed.\n\nThank you for choosing us! Reply to this message if you need any help.");
  
  // API Queries & Mutations
  const { data: settings = { branchId: 1, autoReply: true }, isLoading: loadingSettings, refetch: refetchSettings } = useGetWhatsAppSettings({ branchId });
  const { data: logs = [], isLoading: loadingLogs, refetch: refetchLogs } = useGetWhatsAppLogs({ orgId });
  const updateSettingsMutation = useUpdateWhatsAppSettings();

  const handleToggleAutoReply = async () => {
    try {
      const nextVal = !settings.autoReply;
      await updateSettingsMutation.mutateAsync({
        data: {
          branchId,
          autoReply: nextVal
        }
      });
      toast({ 
        title: nextVal ? "Auto-Reply Enabled" : "Auto-Reply Disabled", 
        description: `Successfully toggled WhatsApp bot auto-responder status.` 
      });
      refetchSettings();
    } catch (err: any) {
      toast({ title: "Toggle Failed", description: err.message || "Could not update settings", variant: "destructive" });
    }
  };

  const whatsappUrl = `https://wa.me/919876543210?text=${encodeURIComponent(dummyMessage)}`;

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-6">
      {/* Title block */}
      <div>
        <h1 className="text-3xl font-black tracking-tight font-display text-foreground flex items-center gap-2">
          <MessageCircle className="text-[#25D366]" /> WhatsApp Business Integration
        </h1>
        <p className="text-muted-foreground text-sm font-sans">
          Configure AI auto-response agents, manage auto-replies, and audit customer interactions.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Config settings & Preview */}
        <div className="lg:col-span-1 space-y-6">
          {/* Config Switch */}
          <div className="bg-card border border-card-border rounded-3xl p-6 shadow-card space-y-4">
            <h2 className="text-lg font-bold font-display text-foreground flex items-center gap-2">
              <Settings size={20} className="text-primary" /> Auto-Responder
            </h2>
            <p className="text-xs text-muted-foreground font-sans">
              Instantly reply to customer inquiries using storefront catalog data.
            </p>

            {loadingSettings ? (
              <SkeletonCard className="h-14 w-full" />
            ) : (
              <div className="flex items-center justify-between bg-muted/20 border border-border p-4 rounded-2xl">
                <span className="text-sm font-bold text-foreground font-sans">
                  {settings.autoReply ? "Active (Auto-Responding)" : "Inactive (Off)"}
                </span>
                <button 
                  onClick={handleToggleAutoReply}
                  disabled={updateSettingsMutation.isPending}
                  className="text-primary hover:opacity-90 transition-opacity cursor-pointer"
                >
                  {updateSettingsMutation.isPending ? (
                    <Loader2 className="animate-spin" size={28} />
                  ) : settings.autoReply ? (
                    <ToggleRight size={44} className="text-[#25D366]" />
                  ) : (
                    <ToggleLeft size={44} className="text-muted-foreground" />
                  )}
                </button>
              </div>
            )}
          </div>

          {/* Device Preview */}
          <div className="bg-card border border-card-border rounded-3xl p-6 shadow-card space-y-4">
            <h2 className="text-base font-bold font-display text-foreground flex items-center gap-2">
              <Smartphone className="text-muted-foreground" size={18} /> Chat preview
            </h2>
            <div className="bg-[#EFEAE2] dark:bg-[#0b141a] p-4 rounded-2xl border border-border shadow-inner relative h-[250px] flex flex-col justify-end">
              <div className="absolute inset-0 opacity-20 bg-[url('https://i.pinimg.com/originals/8f/ba/cb/8fbacbd464e996966eb9d4a6b7a9c21e.jpg')] bg-cover mix-blend-overlay"></div>
              
              <div className="relative z-10 bg-white dark:bg-[#202c33] p-3 rounded-2xl rounded-tr-none shadow-sm max-w-[85%] self-end ml-auto">
                <p className="text-[#111b21] dark:text-[#e9edef] whitespace-pre-wrap font-sans text-xs leading-relaxed">
                  {dummyMessage}
                </p>
                <div className="text-[9px] text-[#667781] dark:text-[#8696a0] text-right mt-1">
                  10:42 AM
                </div>
              </div>
            </div>

            <a
              href={whatsappUrl}
              target="_blank"
              rel="noreferrer"
              className="w-full py-3 bg-gradient-to-r from-[#25D366] to-[#128C7E] hover:opacity-90 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-md text-sm"
            >
              <MessageCircle size={16} /> Test Outbound Chat <ArrowRight size={14} />
            </a>
          </div>
        </div>

        {/* Right Column: Conversation Logs */}
        <div className="lg:col-span-2 bg-card border border-card-border rounded-3xl p-6 shadow-card flex flex-col h-[550px]">
          <div className="pb-4 border-b border-border flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <History className="text-primary animate-pulse" size={20} />
              <div>
                <h2 className="text-base font-bold font-display text-foreground">AI Conversations Log</h2>
                <span className="text-xs text-muted-foreground font-sans">Audited logs of customer auto-responses</span>
              </div>
            </div>
            <button 
              onClick={() => refetchLogs()}
              className="text-xs font-bold text-primary hover:underline cursor-pointer font-sans"
            >
              Refresh Logs
            </button>
          </div>

          <div className="flex-1 overflow-y-auto space-y-4 pr-1">
            {loadingLogs ? (
              <div className="space-y-3">
                <SkeletonCard className="h-16 w-full" />
                <SkeletonCard className="h-16 w-full" />
                <SkeletonCard className="h-16 w-full" />
              </div>
            ) : logs.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center text-muted-foreground p-10 font-sans space-y-2">
                <Bot size={32} className="opacity-40 animate-bounce" />
                <h3 className="font-bold text-foreground">No recent conversations</h3>
                <p className="text-xs">Incoming WhatsApp messages handled by the bot will be listed here.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {logs.map((log: any) => (
                  <div key={log.id} className="bg-muted/10 border border-border p-4 rounded-2xl shadow-sm space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-foreground font-sans">+{log.senderPhone}</span>
                      <div className="flex items-center gap-1.5">
                        {log.intentDetected === "lead_created" ? (
                          <span className="text-[10px] bg-amber-500/10 text-amber-600 border border-amber-500/20 font-bold px-2 py-0.5 rounded-full font-sans flex items-center gap-1">
                            <CheckCircle2 size={10} /> Lead Created
                          </span>
                        ) : (
                          <span className="text-[10px] bg-muted/40 text-muted-foreground border border-border px-2 py-0.5 rounded-full font-sans">
                            Replied
                          </span>
                        )}
                        <span className="text-[10px] text-muted-foreground font-sans">
                          {new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-1.5 pl-3 border-l-2 border-primary/20 text-xs">
                      <p className="text-muted-foreground font-sans">
                        <strong className="text-foreground/80">Query:</strong> "{log.message}"
                      </p>
                      <p className="text-foreground font-sans flex items-start gap-1">
                        <Bot size={14} className="text-primary shrink-0 mt-0.5" />
                        <span>"{log.reply}"</span>
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
