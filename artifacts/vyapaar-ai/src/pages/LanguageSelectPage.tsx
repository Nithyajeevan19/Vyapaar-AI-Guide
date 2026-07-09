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
    // Update local state + localStorage immediately
    setLanguage(selected); // fire-and-forget Firestore (async, not awaited)
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
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-primary-foreground font-bold text-2xl mx-auto mb-4 shadow-lg shadow-primary/20">
            {user?.displayName?.[0] || user?.email?.[0]?.toUpperCase() || "U"}
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-1">Choose your language</h1>
          <p className="text-sm text-muted-foreground font-medium">अपनी भाषा चुनें / భాషను ఎంచుకోండి</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
          {[
            { code: "en", name: "English", native: "English", icon: "EN" },
            { code: "te", name: "Telugu", native: "తెలుగు", icon: "తె" },
            { code: "hi", name: "Hindi", native: "हिन्दी", icon: "हि" },
            { code: "ta", name: "Tamil", native: "தமிழ்", icon: "த" },
            { code: "kn", name: "Kannada", native: "ಕನ್ನಡ", icon: "ಕ" },
            { code: "mr", name: "Marathi", native: "मराठी", icon: "म" }
          ].map((lang) => {
            const isSelected = selected === lang.code;
            return (
              <motion.button
                key={lang.code}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setSelected(lang.code as Language)}
                className={`relative p-5 rounded-xl border-2 text-left transition-all flex flex-col items-start ${
                  isSelected
                    ? "border-primary bg-primary/10 shadow-[0_0_15px_rgba(var(--primary),0.15)]"
                    : "border-border bg-card hover:border-primary/50"
                }`}
                data-testid={`button-lang-${lang.code}`}
              >
                <AnimatePresence>
                  {isSelected && (
                    <motion.div
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0, opacity: 0 }}
                      className="absolute top-3 right-3 text-primary bg-primary/20 p-0.5 rounded-full"
                    >
                      <Check size={14} className="stroke-[3]" />
                    </motion.div>
                  )}
                </AnimatePresence>
                <div className="w-10 h-10 rounded-full bg-background border border-border flex items-center justify-center mb-3 text-sm font-black text-foreground shadow-sm">
                  {lang.icon}
                </div>
                <h3 className="text-base font-bold text-foreground mb-0.5">{lang.name}</h3>
                <p className="text-xs text-muted-foreground">{lang.native}</p>
              </motion.button>
            );
          })}
        </div>

        <button
          onClick={handleContinue}
          disabled={!selected || isSaving}
          className="w-full md:max-w-md mx-auto py-3.5 px-6 rounded-xl bg-gradient-to-r from-primary to-accent text-primary-foreground font-bold text-base disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 hover:shadow-lg hover:shadow-primary/20 transition-all flex justify-center items-center gap-2"
          data-testid="button-continue-lang"
        >
          {isSaving ? <Loader2 className="animate-spin" size={20} /> : (
            <>
              Continue / आगे बढ़ें
              <Globe size={18} />
            </>
          )}
        </button>
      </motion.div>
    </div>
  );
}
