import { useState, useEffect } from "react";
import { Link } from "wouter";
import { useAuth } from "../hooks/useAuth";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase/config";
import { generateMarketingContent, MarketingContent } from "../services/marketingService";
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
  RefreshCw,
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
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border border-border hover:border-primary/50 bg-muted/50 hover:bg-primary/5 text-muted-foreground hover:text-primary"
    >
      {copied ? (
        <>
          <CheckCheck size={13} className="text-green-500" />
          <span className="text-green-500">Copied!</span>
        </>
      ) : (
        <>
          <Copy size={13} />
          Copy
        </>
      )}
    </button>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function MarketingPage() {
  const { user } = useAuth();
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [businessInfo, setBusinessInfo] = useState<any>(null);
  const [generating, setGenerating] = useState(false);
  const [content, setContent] = useState<MarketingContent | null>(null);

  // ── Load business info ─────────────────────────────────────────────────────
  useEffect(() => {
    const timeout = setTimeout(() => setLoading(false), 5000);

    async function fetchBusinessInfo() {
      try {
        const cached = localStorage.getItem("vyapaar_business_info");
        if (cached) {
          const parsed = JSON.parse(cached);
          if (parsed?.name) {
            setBusinessInfo(parsed);
            clearTimeout(timeout);
            setLoading(false);
            return;
          }
        }
      } catch {}

      if (user) {
        try {
          const docRef = doc(db, "users", user.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists() && docSnap.data().businessInfo) {
            const info = docSnap.data().businessInfo;
            setBusinessInfo(info);
            try { localStorage.setItem("vyapaar_business_info", JSON.stringify(info)); } catch {}
          }
        } catch {}
      }
      clearTimeout(timeout);
      setLoading(false);
    }

    fetchBusinessInfo();
    return () => clearTimeout(timeout);
  }, [user]);

  // ── Generate content ───────────────────────────────────────────────────────
  const handleGenerate = async () => {
    if (!businessInfo) return;
    setGenerating(true);
    setContent(null);
    try {
      const result = await generateMarketingContent(
        businessInfo.name,
        businessInfo.type,
        businessInfo.serviceType || "both"
      );
      setContent(result);
    } catch {
      toast({
        title: "Error",
        description: "Failed to generate marketing content. Please try again.",
        variant: "destructive",
      });
    } finally {
      setGenerating(false);
    }
  };

  // ── Loading state ──────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="p-6 md:p-10 max-w-4xl mx-auto space-y-6">
        <SkeletonCard className="h-32" />
        <SkeletonCard className="h-64" />
      </div>
    );
  }

  // ── No business info ───────────────────────────────────────────────────────
  if (!businessInfo) {
    return (
      <div className="p-4 md:p-6 max-w-2xl mx-auto mt-10">
        <div className="bg-card border border-card-border rounded-2xl p-8 text-center shadow-sm">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-amber-500/10 text-amber-500 mb-6">
            <AlertCircle size={40} />
          </div>
          <h2 className="text-2xl font-bold mb-4">Complete AI Setup First</h2>
          <p className="text-muted-foreground mb-8 text-lg">
            We need your business details to generate marketing content.
          </p>
          <Link href="/ai-setup">
            <button className="px-8 py-4 bg-gradient-to-r from-primary to-accent text-primary-foreground rounded-xl font-bold hover:opacity-90 transition-all shadow-md">
              Go to AI Setup
            </button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="p-4 md:p-8 max-w-5xl mx-auto"
    >
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2.5 bg-primary/10 text-primary rounded-xl">
            <Megaphone size={24} />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold">Marketing Kit</h1>
        </div>
        <p className="text-muted-foreground text-base ml-14">
          AI-generated marketing content for{" "}
          <span className="font-semibold text-foreground">{businessInfo.name}</span>
        </p>
      </div>

      {/* Business info banner */}
      <div className="bg-card border border-card-border rounded-2xl p-5 mb-8 flex items-center justify-between gap-4 flex-wrap shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-lg">
            {businessInfo.name?.[0]?.toUpperCase() || "B"}
          </div>
          <div>
            <p className="font-bold text-foreground">{businessInfo.name}</p>
            <p className="text-sm text-muted-foreground">
              {businessInfo.type} · {businessInfo.serviceType}
            </p>
          </div>
        </div>

        <button
          onClick={handleGenerate}
          disabled={generating}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary to-accent text-primary-foreground rounded-xl font-bold hover:opacity-90 transition-all shadow-md disabled:opacity-60 disabled:cursor-not-allowed"
          data-testid="button-generate-marketing"
        >
          {generating ? (
            <>
              <RefreshCw size={18} className="animate-spin" />
              Generating…
            </>
          ) : (
            <>
              <Sparkles size={18} />
              {content ? "Regenerate" : "Generate Marketing Content"}
            </>
          )}
        </button>
      </div>

      {/* Generating state */}
      <AnimatePresence mode="wait">
        {generating && (
          <motion.div
            key="generating"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center py-24 text-center"
          >
            <div className="relative mb-6">
              <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl animate-pulse" />
              <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-primary relative z-10" />
              <Sparkles className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-primary animate-pulse" size={20} />
            </div>
            <p className="text-xl font-bold mb-2">Crafting your marketing kit…</p>
            <p className="text-muted-foreground animate-pulse">Generating posts, promos & video ideas.</p>
          </motion.div>
        )}

        {/* Empty state — prompt to generate */}
        {!generating && !content && (
          <motion.div
            key="empty"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="py-16 flex flex-col items-center text-center"
          >
            <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center mb-6">
              <Megaphone size={44} className="text-primary/60" />
            </div>
            <h2 className="text-2xl font-bold mb-3">Ready to promote your business?</h2>
            <p className="text-muted-foreground max-w-md mb-8">
              Click <strong>"Generate Marketing Content"</strong> above and we'll create Instagram posts, a WhatsApp promo, and a video script idea — all tailored for <strong>{businessInfo.name}</strong>.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              {[
                { icon: Instagram, label: "2 Instagram Posts" },
                { icon: MessageCircle, label: "WhatsApp Promo" },
                { icon: Video, label: "Video Script Idea" },
              ].map(({ icon: Icon, label }) => (
                <div key={label} className="flex items-center gap-2 px-4 py-2 bg-card border border-card-border rounded-full text-sm font-medium text-muted-foreground shadow-sm">
                  <Icon size={16} className="text-primary" />
                  {label}
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Generated content */}
        {!generating && content && (
          <motion.div
            key="content"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="space-y-6"
          >
            {/* Instagram Posts */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Instagram size={20} className="text-pink-500" />
                <h2 className="text-xl font-bold">Instagram Posts</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {content.instaPosts.map((post, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.08 }}
                    className="bg-card border border-card-border rounded-2xl p-5 shadow-sm flex flex-col gap-3 hover:border-pink-300/60 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-pink-400 to-purple-500 flex items-center justify-center">
                          <Instagram size={16} className="text-white" />
                        </div>
                        <span className="text-sm font-semibold text-muted-foreground">Post {i + 1}</span>
                      </div>
                      <CopyButton text={`${post.caption}\n\n${post.hashtags}`} />
                    </div>
                    <p className="text-sm leading-relaxed whitespace-pre-line text-foreground">{post.caption}</p>
                    <p className="text-xs text-blue-500 font-medium leading-relaxed">{post.hashtags}</p>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* WhatsApp Promo */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.16 }}
            >
              <div className="flex items-center gap-2 mb-4">
                <MessageCircle size={20} className="text-green-500" />
                <h2 className="text-xl font-bold">WhatsApp Promo</h2>
              </div>
              <div className="bg-card border border-card-border rounded-2xl p-5 shadow-sm hover:border-green-300/60 transition-colors">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center">
                      <MessageCircle size={16} className="text-white" />
                    </div>
                    <span className="text-sm font-semibold text-muted-foreground">Ready to send</span>
                  </div>
                  <CopyButton text={content.whatsappPromo} />
                </div>
                <div className="bg-[#dcf8c6] dark:bg-green-900/30 rounded-xl rounded-tl-sm p-4 text-sm text-gray-800 dark:text-gray-200 leading-relaxed whitespace-pre-line shadow-sm max-w-md">
                  {content.whatsappPromo}
                </div>
              </div>
            </motion.div>

            {/* Video Script Idea */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.24 }}
            >
              <div className="flex items-center gap-2 mb-4">
                <Video size={20} className="text-primary" />
                <h2 className="text-xl font-bold">Reel / Video Script Idea</h2>
              </div>
              <div className="bg-card border border-card-border rounded-2xl p-5 shadow-sm hover:border-primary/30 transition-colors">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                      <Video size={16} />
                    </div>
                    <span className="text-sm font-semibold text-muted-foreground">Short-form video concept</span>
                  </div>
                  <CopyButton text={content.videoScriptIdea} />
                </div>
                <div className="bg-muted/60 rounded-xl p-4 text-sm text-foreground leading-relaxed whitespace-pre-line font-mono border border-border/60">
                  {content.videoScriptIdea}
                </div>
              </div>
            </motion.div>

            {/* Footer note */}
            <p className="text-xs text-muted-foreground text-center pb-4 pt-2">
              ✨ Content generated by AI · Click individual Copy buttons to copy each piece
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
