import { useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "../hooks/useAuth";
import { useLanguage } from "../hooks/useLanguage";
import { Language } from "../context/LanguageContext";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Loader2, Globe } from "lucide-react";

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
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 relative">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-accent to-primary" />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-2xl bg-card/80 backdrop-blur-xl border border-card-border p-6 md:p-12 rounded-3xl shadow-xl"
      >
        <div className="text-center mb-10">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-primary-foreground font-bold text-3xl mx-auto mb-6 shadow-lg shadow-primary/20">
            {user?.displayName?.[0] || user?.email?.[0]?.toUpperCase() || "U"}
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-3">Choose your language</h1>
          <p className="text-xl text-muted-foreground font-medium">భాషను ఎంచుకోండి</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setSelected("en")}
            className={`relative p-8 rounded-2xl border-2 text-left transition-all ${
              selected === "en" 
                ? "border-primary bg-primary/10 shadow-[0_0_20px_rgba(var(--primary),0.2)]" 
                : "border-border bg-card hover:border-primary/50"
            }`}
            data-testid="button-lang-en"
          >
            <AnimatePresence>
              {selected === "en" && (
                <motion.div 
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                  className="absolute top-4 right-4 text-primary bg-primary/20 p-1 rounded-full"
                >
                  <Check size={20} className="stroke-[3]" />
                </motion.div>
              )}
            </AnimatePresence>
            <div className="w-16 h-16 rounded-full bg-background border border-border flex items-center justify-center mb-6 text-2xl font-black text-foreground shadow-sm">
              EN
            </div>
            <h3 className="text-2xl font-bold text-foreground mb-2">English</h3>
            <p className="text-muted-foreground">Continue in English</p>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setSelected("te")}
            className={`relative p-8 rounded-2xl border-2 text-left transition-all ${
              selected === "te" 
                ? "border-accent bg-accent/10 shadow-[0_0_20px_rgba(var(--accent),0.2)]" 
                : "border-border bg-card hover:border-accent/50"
            }`}
            data-testid="button-lang-te"
          >
            <AnimatePresence>
              {selected === "te" && (
                <motion.div 
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                  className="absolute top-4 right-4 text-accent bg-accent/20 p-1 rounded-full"
                >
                  <Check size={20} className="stroke-[3]" />
                </motion.div>
              )}
            </AnimatePresence>
            <div className="w-16 h-16 rounded-full bg-background border border-border flex items-center justify-center mb-6 text-2xl font-black text-foreground shadow-sm">
              తె
            </div>
            <h3 className="text-2xl font-bold text-foreground mb-2">తెలుగు</h3>
            <p className="text-muted-foreground">తెలుగులో కొనసాగండి</p>
          </motion.button>
        </div>

        <button
          onClick={handleContinue}
          disabled={!selected || isSaving}
          className="w-full md:max-w-md mx-auto py-4 px-8 rounded-xl bg-gradient-to-r from-primary to-accent text-primary-foreground font-bold text-lg disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 hover:shadow-lg hover:shadow-primary/20 transition-all flex justify-center items-center gap-3"
          data-testid="button-continue-lang"
        >
          {isSaving ? <Loader2 className="animate-spin" size={24} /> : (
            <>
              Continue / కొనసాగించు
              <Globe size={20} />
            </>
          )}
        </button>
      </motion.div>
    </div>
  );
}
