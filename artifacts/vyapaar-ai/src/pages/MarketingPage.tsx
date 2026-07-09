import { useState, useEffect } from "react";
import { Link } from "wouter";
import { useAuth } from "../hooks/useAuth";
import { 
  useGetBusinessProfile, 
  useListOrganizations 
} from "@workspace/api-client-react";
import { generateMarketingChatReply, MarketingMessage } from "../services/marketingService";
import { motion, AnimatePresence } from "framer-motion";
import {
  Megaphone,
  Instagram,
  MessageCircle,
  Video,
  Copy,
  CheckCheck,
  Sparkles,
  AlertCircle,
  Send,
  Loader2,
  Bot,
  User,
  PlusCircle,
  HelpCircle
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { SkeletonCard } from "../components/SkeletonCard";

// ─── Copy Button Helper ───────────────────────────────────────────────────────
function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
    }
  };

  return (
    <button
      onClick={handleCopy}
      type="button"
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border border-border hover:border-primary/50 bg-muted/50 hover:bg-primary/5 text-muted-foreground hover:text-primary cursor-pointer"
    >
      {copied ? (
        <>
          <CheckCheck size={13} className="text-green-500" />
          <span className="text-green-500 font-sans">Copied!</span>
        </>
      ) : (
        <>
          <Copy size={13} />
          <span className="font-sans">Copy</span>
        </>
      )}
    </button>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function MarketingPage() {
  const { currentOrgId: orgId } = useAuth();
  const { toast } = useToast();

  const [input, setInput] = useState("");
  const [generating, setGenerating] = useState(false);
  const [messages, setMessages] = useState<MarketingMessage[]>([
    {
      role: "assistant",
      content: `Hello! I am your social media marketing assistant. Describe what you'd like to create: e.g. "write me an Instagram post for a Diwali discount" or "give me a WhatsApp promo for a weekend special"!`,
      intent: "clarify"
    }
  ]);

  // Load business info from dynamic DB queries
  const { data: orgs = [], isLoading: loadingOrgs } = useListOrganizations();
  const { data: profile, isLoading: loadingProfile } = useGetBusinessProfile({ orgId });

  if (loadingOrgs || loadingProfile) {
    return (
      <div className="p-6 md:p-10 max-w-4xl mx-auto space-y-6">
        <SkeletonCard className="h-32" />
        <SkeletonCard className="h-64" />
      </div>
    );
  }

  const activeOrgName = orgs.find((o: any) => o.id === orgId)?.name || "Srinivasa Kirana Store";
  const businessInfo = {
    name: activeOrgName,
    type: profile?.category || "Kirana Store",
    serviceType: "both"
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || generating) return;

    const userText = input;
    setInput("");

    // Append user message
    const nextMessages = [...messages, { role: "user", content: userText } as MarketingMessage];
    setMessages(nextMessages);
    setGenerating(true);

    try {
      const response = await generateMarketingChatReply(
        nextMessages.map(m => ({ role: m.role, content: m.content })),
        businessInfo.name,
        businessInfo.type,
        businessInfo.serviceType
      );

      setMessages(prev => [
        ...prev,
        {
          role: "assistant",
          content: response.chatReply,
          intent: response.intent,
          contentData: response.contentData
        }
      ]);
    } catch (err: any) {
      toast({
        title: "Generation Failed",
        description: err.message || "Failed to process message with marketing expert.",
        variant: "destructive"
      });
    } finally {
      setGenerating(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="p-4 md:p-8 max-w-4xl mx-auto space-y-6 font-sans"
    >
      {/* Header Banner */}
      <div className="flex justify-between items-center pb-6 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-primary/10 text-primary rounded-2xl">
            <Megaphone size={24} />
          </div>
          <div>
            <h1 className="text-3xl font-black font-display tracking-tight text-foreground">Marketing Kit</h1>
            <p className="text-xs text-muted-foreground font-sans mt-0.5">
              Chat-driven branding copy, Instagram posts, Reel script concepts, and WhatsApp promos.
            </p>
          </div>
        </div>
      </div>

      {/* active business info banner */}
      <div className="bg-card border border-card-border rounded-2xl p-4 flex items-center gap-3 shadow-card">
        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-lg font-display">
          {businessInfo.name[0]?.toUpperCase()}
        </div>
        <div>
          <p className="font-bold text-foreground text-sm">{businessInfo.name}</p>
          <p className="text-xs text-muted-foreground font-sans">
            {businessInfo.type} · Active Scoped Organization
          </p>
        </div>
      </div>

      {/* Conversational Chat Thread Box */}
      <div className="bg-card border border-card-border rounded-3xl p-4 md:p-6 shadow-card flex flex-col h-[500px]">
        <div className="flex-1 overflow-y-auto space-y-4 pr-2 scrollbar-thin">
          <AnimatePresence initial={false}>
            {messages.map((msg, index) => {
              const isAssistant = msg.role === "assistant";
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className={`flex gap-3 max-w-[85%] ${isAssistant ? "mr-auto" : "ml-auto flex-row-reverse"}`}
                >
                  {/* Bubble Avatars */}
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center border shrink-0 ${
                    isAssistant ? "bg-primary/15 text-primary border-primary/20" : "bg-muted text-muted-foreground border-border"
                  }`}>
                    {isAssistant ? <Bot size={15} /> : <User size={15} />}
                  </div>

                  <div className="space-y-3">
                    {/* Chat Reply Bubble */}
                    <div className={`p-3.5 rounded-2xl text-sm font-sans leading-relaxed shadow-sm border ${
                      isAssistant 
                        ? "bg-muted/30 text-foreground border-border rounded-tl-none" 
                        : "bg-primary text-primary-foreground border-primary rounded-tr-none"
                    }`}>
                      {msg.content}
                    </div>

                    {/* Structured Structured Card elements */}
                    {isAssistant && msg.contentData && (
                      <div className="space-y-3 pt-1">
                        
                        {/* 1. Instagram Post Option */}
                        {msg.intent === "instagram" && msg.contentData.caption && (
                          <div className="bg-card border border-border/80 rounded-2xl p-4 shadow-sm space-y-3 text-xs w-[320px] sm:w-[400px]">
                            <div className="flex items-center justify-between border-b border-border/60 pb-2">
                              <span className="font-bold text-foreground flex items-center gap-1 font-display">
                                <Instagram size={14} className="text-pink-500" /> Instagram Post Copy
                              </span>
                              <CopyButton text={`${msg.contentData.caption}\n\n${msg.contentData.hashtags || ""}`} />
                            </div>
                            <p className="text-muted-foreground font-sans leading-relaxed whitespace-pre-line">{msg.contentData.caption}</p>
                            {msg.contentData.hashtags && (
                              <p className="text-primary font-mono text-[10px] leading-relaxed">{msg.contentData.hashtags}</p>
                            )}
                          </div>
                        )}

                        {/* 2. Reels Script Option */}
                        {msg.intent === "reel" && msg.contentData.script && (
                          <div className="bg-card border border-border/80 rounded-2xl p-4 shadow-sm space-y-3 text-xs w-[320px] sm:w-[400px]">
                            <div className="flex items-center justify-between border-b border-border/60 pb-2">
                              <span className="font-bold text-foreground flex items-center gap-1 font-display">
                                <Video size={14} className="text-indigo-500" /> Reel Script & Concept
                              </span>
                              <CopyButton text={`Concept: ${msg.contentData.concept}\n\nScript:\n${msg.contentData.script}`} />
                            </div>
                            {msg.contentData.concept && (
                              <div>
                                <span className="font-bold text-foreground block font-sans">Visual Concept</span>
                                <p className="text-muted-foreground font-sans mt-0.5">{msg.contentData.concept}</p>
                              </div>
                            )}
                            <div>
                              <span className="font-bold text-foreground block font-sans">Script Timestamps</span>
                              <p className="text-muted-foreground font-sans leading-relaxed whitespace-pre-line mt-0.5">{msg.contentData.script}</p>
                            </div>
                          </div>
                        )}

                        {/* 3. WhatsApp Promo Option */}
                        {msg.intent === "whatsapp" && msg.contentData.message && (
                          <div className="bg-card border border-border/80 rounded-2xl p-4 shadow-sm space-y-3 text-xs w-[320px] sm:w-[400px]">
                            <div className="flex items-center justify-between border-b border-border/60 pb-2">
                              <span className="font-bold text-foreground flex items-center gap-1 font-display">
                                <MessageCircle size={14} className="text-emerald-500" /> WhatsApp Message
                              </span>
                              <CopyButton text={msg.contentData.message} />
                            </div>
                            <p className="text-muted-foreground font-sans leading-relaxed whitespace-pre-line">{msg.contentData.message}</p>
                          </div>
                        )}
                        
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}

            {generating && (
              <div className="flex gap-3 max-w-[85%] mr-auto items-center">
                <div className="w-8 h-8 rounded-full bg-primary/10 text-primary border border-primary/20 flex items-center justify-center animate-pulse">
                  <Bot size={15} />
                </div>
                <div className="bg-muted/20 border border-border px-4 py-2.5 rounded-2xl rounded-tl-none text-xs flex items-center gap-2">
                  <Loader2 className="animate-spin text-primary" size={14} />
                  <span className="font-sans text-muted-foreground">Expert assistant drafting options...</span>
                </div>
              </div>
            )}
          </AnimatePresence>
        </div>

        {/* Input Bar Form */}
        <form onSubmit={handleSend} className="border-t border-border pt-4 mt-4 flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={generating}
            placeholder="Type e.g. 'instagram caption for fresh tomatoes' or 'whatsapp deal'..."
            className="flex-1 bg-muted/20 border border-border px-4 py-3 rounded-2xl text-sm outline-none focus:border-primary text-foreground font-sans"
          />
          <button
            type="submit"
            disabled={!input.trim() || generating}
            className="p-3 bg-primary text-primary-foreground rounded-2xl hover:opacity-95 transition-all shadow-card flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            <Send size={16} />
          </button>
        </form>
      </div>
    </motion.div>
  );
}
