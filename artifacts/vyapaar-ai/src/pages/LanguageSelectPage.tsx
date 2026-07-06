import { useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "../hooks/useAuth";
import { useLanguage } from "../hooks/useLanguage";
import { Language } from "../context/LanguageContext";
import { motion } from "framer-motion";
import { Check, Loader2 } from "lucide-react";

export default function LanguageSelectPage() {
  const { user } = useAuth();
  const { setLanguage } = useLanguage();
  const [location, setLocation] = useLocation();
  const [selected, setSelected] = useState<Language | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const handleContinue = async () => {
    if (!selected) return;
    setIsSaving(true);
    await setLanguage(selected);
    setLocation("/dashboard");
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-lg bg-card/50 backdrop-blur-xl border border-card-border p-8 rounded-3xl"
      >
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-xl mx-auto mb-4">
            {user?.displayName?.[0] || user?.email?.[0]?.toUpperCase() || "U"}
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-2">Choose your language</h1>
          <p className="text-muted-foreground">భాషను ఎంచుకోండి</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <button
            onClick={() => setSelected("en")}
            className={`relative p-6 rounded-2xl border-2 text-left transition-all ${
              selected === "en" 
                ? "border-primary bg-primary/10" 
                : "border-border bg-card hover:border-primary/50"
            }`}
            data-testid="button-lang-en"
          >
            {selected === "en" && (
              <div className="absolute top-4 right-4 text-primary">
                <Check size={20} />
              </div>
            )}
            <h3 className="text-xl font-bold text-foreground mb-1">English</h3>
            <p className="text-sm text-muted-foreground">Continue in English</p>
          </button>

          <button
            onClick={() => setSelected("te")}
            className={`relative p-6 rounded-2xl border-2 text-left transition-all ${
              selected === "te" 
                ? "border-accent bg-accent/10" 
                : "border-border bg-card hover:border-accent/50"
            }`}
            data-testid="button-lang-te"
          >
            {selected === "te" && (
              <div className="absolute top-4 right-4 text-accent">
                <Check size={20} />
              </div>
            )}
            <h3 className="text-xl font-bold text-foreground mb-1">తెలుగు</h3>
            <p className="text-sm text-muted-foreground">తెలుగులో కొనసాగండి</p>
          </button>
        </div>

        <button
          onClick={handleContinue}
          disabled={!selected || isSaving}
          className="w-full py-4 rounded-xl bg-gradient-to-r from-primary to-accent text-primary-foreground font-semibold text-lg disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 transition-opacity flex justify-center items-center gap-2"
          data-testid="button-continue-lang"
        >
          {isSaving ? <Loader2 className="animate-spin" size={24} /> : "Continue / కొనసాగించు"}
        </button>
      </motion.div>
    </div>
  );
}
