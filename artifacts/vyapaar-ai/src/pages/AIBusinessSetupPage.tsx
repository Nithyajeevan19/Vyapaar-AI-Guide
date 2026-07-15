import { useState, useEffect, useRef, useCallback } from "react";
import { useAuth } from "../hooks/useAuth";
import { useLanguage } from "../hooks/useLanguage";
import { doc, setDoc } from "firebase/firestore";
import { db } from "../firebase/config";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, MicOff, Send, Bot, CheckCircle2, Sparkles, Volume2, ArrowRight, ArrowLeft, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useSyncUser, useCopilotOnboarding, useUpdateBusinessProfile } from "@workspace/api-client-react";

// Curated options for step choices
const BUSINESS_TYPES = [
  { id: "retail", label: "Retail & Grocery", labelTe: "రిటైల్ & కిరాణా" },
  { id: "restaurant", label: "Restaurant & Cafe", labelTe: "రెస్టారెంట్ & కేఫ్" },
  { id: "education", label: "Education & Coaching", labelTe: "విద్య & శిక్షణ" },
  { id: "healthcare", label: "Healthcare & Clinic", labelTe: "వైద్యం & క్లినిక్" },
  { id: "hospitality", label: "Hospitality & Hotel", labelTe: "హోటల్ & హాస్పిటాలిటీ" },
  { id: "real_estate", label: "Real Estate & Agency", labelTe: "రియల్ ఎస్టేట్" },
  { id: "manufacturing", label: "Manufacturing", labelTe: "ఉత్పత్తి & తయారీ" },
  { id: "agriculture", label: "Agriculture & Farming", labelTe: "వ్యవసాయం" },
  { id: "service", label: "Service & Maintenance", labelTe: "సేవలు & మెయింటెనెన్స్" },
];

const DIGITAL_TOOLS = [
  { id: "none", label: "No tools / Notebook records", labelTe: "ఏమీ లేవు / పుస్తకంలో రికార్డులు" },
  { id: "whatsapp", label: "WhatsApp Chat", labelTe: "వాట్సాప్ చాట్" },
  { id: "spreadsheets", label: "Excel / Google Spreadsheets", labelTe: "ఎక్సెల్ / స్ప్రెడ్‌షీట్లు" },
  { id: "billing", label: "Billing & Invoicing apps", labelTe: "బిల్లింగ్ యాప్స్" },
  { id: "pos", label: "POS billing machines", labelTe: "POS యంత్రాలు" },
  { id: "website", label: "Simple Business Website", labelTe: "వ్యాపార వెబ్‌సైట్" },
];

const PAIN_POINTS = [
  { id: "manual", label: "Manual paper records take too long", labelTe: "కాగితపు రికార్డులు రాయడం కష్టం" },
  { id: "offline", label: "No online ordering / customers call only", labelTe: "ఆన్‌లైన్ ఆర్డర్లు లేవు" },
  { id: "multi_branch", label: "Difficult to track multiple branches", labelTe: "బహుళ బ్రాంచ్లను ట్రాక్ చేయడం కష్టం" },
  { id: "no_self_service", label: "Customers ask for price lists repeatedly", labelTe: "ధరల జాబితాను కస్టమర్లు పదే పదే అడుగుతున్నారు" },
];

const LANGUAGES = [
  { id: "en", label: "English" },
  { id: "te", label: "Telugu (తెలుగు)" },
  { id: "hi", label: "Hindi (हिन्दी)" },
  { id: "ta", label: "Tamil (தமிழ்)" },
  { id: "kn", label: "Kannada (ಕನ್ನಡ)" },
  { id: "mr", label: "Marathi (मराठी)" },
];

const BRAND_TONES = [
  { id: "traditional", label: "Traditional & Trustworthy", labelTe: "సాంప్రదాయకమైనది" },
  { id: "modern", label: "Modern & Professional", labelTe: "ఆధునికమైనది & ప్రొఫెషనల్" },
  { id: "premium", label: "Premium & High-End", labelTe: "ప్రీమియం & లగ్జరీ" },
  { id: "budget", label: "Budget-Friendly & Accessible", labelTe: "బడ్జెట్-ఫ్రెండ్లీ" },
];

export default function AIBusinessSetupPage() {
  const { user, currentOrgId } = useAuth();
  const { language } = useLanguage();
  const { toast } = useToast();

  // API mutations
  const syncUserMutation = useSyncUser();
  const onboardingMutation = useCopilotOnboarding();
  const updateProfileMutation = useUpdateBusinessProfile();

  // Wizard state parameters
  const [step, setStep] = useState(1);
  const [isAiThinking, setIsAiThinking] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [inputText, setInputText] = useState("");

  const [form, setForm] = useState({
    businessName: "",
    businessType: "retail",
    branchesCount: 1,
    digitalTools: [] as string[],
    painPoints: [] as string[],
    preferredLanguages: ["en", "te"],
    brandTone: "modern",
  });

  const recognitionRef = useRef<any>(null);
  const isRecordingRef = useRef(false);

  // STT initialization
  useEffect(() => {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) return;

    const rec = new SR();
    rec.continuous = false;
    rec.interimResults = false;
    rec.lang = language === "te" ? "te-IN" : "en-US";

    rec.onresult = (e: any) => {
      const transcript = e.results[0][0].transcript.trim();
      isRecordingRef.current = false;
      setIsRecording(false);
      if (transcript) {
        setInputText(transcript);
        if (step === 1) {
          setForm(prev => ({ ...prev, businessName: transcript }));
        }
      }
    };

    rec.onerror = () => {
      isRecordingRef.current = false;
      setIsRecording(false);
    };

    rec.onend = () => {
      isRecordingRef.current = false;
      setIsRecording(false);
    };

    recognitionRef.current = rec;
  }, [language, step]);

  const toggleRecording = () => {
    const rec = recognitionRef.current;
    if (!rec) {
      toast({ title: "Microphone not supported", description: "Please type instead.", variant: "destructive" });
      return;
    }

    if (isRecordingRef.current) {
      try { rec.stop(); } catch {}
      isRecordingRef.current = false;
      setIsRecording(false);
    } else {
      setInputText("");
      try {
        rec.start();
        isRecordingRef.current = true;
        setIsRecording(true);
      } catch {}
    }
  };

  const handleNext = () => {
    if (step === 1 && !form.businessName.trim()) {
      toast({ title: "Name Required", description: "Please enter your business name to proceed." });
      return;
    }
    if (step < 7) {
      setStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(prev => prev - 1);
    }
  };

  const handleFinish = async () => {
    setIsAiThinking(true);
    try {
      // 1. Sync User info with Postgres
      if (user) {
        await syncUserMutation.mutateAsync({
          data: {
            id: user.uid,
            email: user.email || "",
            displayName: user.displayName || undefined,
          }
        });
      }

      // 2. Call AI Onboarding Analyser proxy endpoint
      const onboardResult = await onboardingMutation.mutateAsync({
        data: {
          businessName: form.businessName,
          businessType: form.businessType,
          serviceType: form.digitalTools.join(", ") || "none",
          language: form.preferredLanguages[0] || "en",
        }
      });

      // 3. Save profile config directly to Postgres business_profiles
      if (onboardResult) {
        await updateProfileMutation.mutateAsync({
          data: {
            orgId: currentOrgId,
            tagline: onboardResult.tagline || undefined,
            primaryColor: onboardResult.primaryColor || undefined,
            shortDescription: onboardResult.description || undefined,
            category: form.businessType,
            phone: "+919876543210",
          }
        });

        // Sync local storage state variables
        const brandingInfo = {
          businessName: form.businessName,
          type: form.businessType,
          serviceType: form.digitalTools.join(", "),
          tagline: onboardResult.tagline || "Your trusted local business",
          primaryColor: onboardResult.primaryColor || "#6366f1",
          description: onboardResult.description || "Fine products and services.",
          industryType: onboardResult.industryType || "retail",
          maturityScore: onboardResult.maturityScore || 50,
          modules: onboardResult.modules || [],
        };
        localStorage.setItem("vyapaar_business_info", JSON.stringify({
          name: form.businessName,
          type: form.businessType,
          serviceType: form.digitalTools.join(", "),
        }));
        localStorage.setItem("vyapaar_branding_info", JSON.stringify(brandingInfo));
      }

      // 4. Backward-compatible write to Firestore fallback
      if (user) {
        await setDoc(doc(db, "users", user.uid), {
          businessInfo: {
            name: form.businessName,
            type: form.businessType,
            branches: form.branchesCount,
            digitalTools: form.digitalTools,
            painPoints: form.painPoints,
            languages: form.preferredLanguages,
            tone: form.brandTone,
          }
        }, { merge: true });
      }

      toast({ title: "Setup Complete", description: "Successfully generated organization profile and configurations!" });
      window.location.href = "/dashboard";
    } catch (err: any) {
      console.error(err);
      toast({ title: "Syncing Failed", description: err.message, variant: "destructive" });
    } finally {
      setIsAiThinking(false);
    }
  };

  const selectMultiple = (field: "digitalTools" | "painPoints" | "preferredLanguages", val: string) => {
    setForm(prev => {
      const exist = prev[field].includes(val);
      const updated = exist ? prev[field].filter((x: string) => x !== val) : [...prev[field], val];
      return { ...prev, [field]: updated };
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="bg-white border border-slate-100 p-6 md:p-10 rounded-3xl w-full max-w-2xl shadow-xl space-y-8">
        
        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs font-bold uppercase tracking-wider text-muted-foreground">
            <span>{language === "te" ? "సెటప్ ప్రగతి" : "Setup Progress"}</span>
            <span>{step} / 7</span>
          </div>
          <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-primary"
              animate={{ width: `${(step / 7) * 100}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>

        {/* Wizard Form Panels */}
        <div className="min-h-[250px] flex flex-col justify-center">
          <AnimatePresence mode="wait">
            
            {/* Step 1: Business Name */}
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <h2 className="text-2xl font-black text-foreground">
                  {language === "te" ? "మీ వ్యాపారం పేరు ఏమిటి?" : "What is your business name?"}
                </h2>
                <p className="text-muted-foreground text-sm">
                  {language === "te" ? "ఇది కస్టమర్ల వెబ్‌సైట్ మరియు రసీదులపై కనిపిస్తుంది." : "This will be displayed on your digital store and invoices."}
                </p>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    required
                    value={form.businessName}
                    onChange={(e) => setForm({ ...form, businessName: e.target.value })}
                    placeholder={language === "te" ? "ఉదా: శ్రీనివాస కిరాణా స్టోర్" : "e.g. Srinivasa Kirana Store"}
                    className="flex-1 px-4 py-3 border border-border bg-slate-50/50 rounded-xl outline-none focus:border-primary text-sm font-semibold"
                  />
                  <button
                    onClick={toggleRecording}
                    className={`p-3.5 rounded-full transition-all ${
                      isRecording ? "bg-red-500 text-white animate-pulse" : "bg-slate-100 hover:bg-slate-200"
                    }`}
                  >
                    {isRecording ? <MicOff size={18} /> : <Mic size={18} />}
                  </button>
                </div>
              </motion.div>
            )}

            {/* Step 2: Business Preset Category */}
            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <h2 className="text-2xl font-black text-foreground">
                  {language === "te" ? "మీరు ఏ రకమైన వ్యాపారం చేస్తున్నారు?" : "What preset best describes your business?"}
                </h2>
                <div className="grid grid-cols-2 gap-3 max-h-[250px] overflow-y-auto pr-1">
                  {BUSINESS_TYPES.map((type) => {
                    const isSelected = form.businessType === type.id;
                    return (
                      <button
                        key={type.id}
                        onClick={() => setForm({ ...form, businessType: type.id })}
                        className={`p-3 text-left rounded-xl border text-xs font-bold transition-all ${
                          isSelected
                            ? "border-primary bg-primary/10 text-primary shadow-sm"
                            : "border-border hover:border-slate-300 text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        {language === "te" ? type.labelTe : type.label}
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {/* Step 3: Branches Count */}
            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <h2 className="text-2xl font-black text-foreground">
                  {language === "te" ? "మీకు ఎన్ని బ్రాంచీలు ఉన్నాయి?" : "How many branches do you operate?"}
                </h2>
                <p className="text-muted-foreground text-sm">
                  {language === "te" ? "మీకు బహుళ అవుట్‌లెట్‌లు ఉంటే దీనిని పెంచండి." : "Increase if you coordinate inventory across multiple retail locations."}
                </p>
                <div className="flex items-center gap-6 pt-4 justify-center">
                  <button
                    onClick={() => setForm(prev => ({ ...prev, branchesCount: Math.max(1, prev.branchesCount - 1) }))}
                    className="w-12 h-12 bg-slate-100 hover:bg-slate-200 rounded-full flex items-center justify-center font-bold text-xl"
                  >
                    -
                  </button>
                  <span className="text-3xl font-black text-foreground">{form.branchesCount}</span>
                  <button
                    onClick={() => setForm(prev => ({ ...prev, branchesCount: prev.branchesCount + 1 }))}
                    className="w-12 h-12 bg-slate-100 hover:bg-slate-200 rounded-full flex items-center justify-center font-bold text-xl"
                  >
                    +
                  </button>
                </div>
              </motion.div>
            )}

            {/* Step 4: Current Digital Tools */}
            {step === 4 && (
              <motion.div
                key="step4"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <h2 className="text-2xl font-black text-foreground">
                  {language === "te" ? "ప్రస్తుతం మీరు వాడుతున్న డిజిటల్ టూల్స్ ఏమిటి?" : "What tools do you currently use?"}
                </h2>
                <div className="grid grid-cols-1 gap-2.5">
                  {DIGITAL_TOOLS.map((tool) => {
                    const isSelected = form.digitalTools.includes(tool.id);
                    return (
                      <button
                        key={tool.id}
                        onClick={() => selectMultiple("digitalTools", tool.id)}
                        className={`p-3 text-left rounded-xl border text-sm font-semibold transition-all ${
                          isSelected
                            ? "border-primary bg-primary/5 text-primary"
                            : "border-border hover:border-slate-300 text-muted-foreground"
                        }`}
                      >
                        {language === "te" ? tool.labelTe : tool.label}
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {/* Step 5: Operations Pain Points */}
            {step === 5 && (
              <motion.div
                key="step5"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <h2 className="text-2xl font-black text-foreground">
                  {language === "te" ? "మీ వ్యాపారంలో ఎదుర్కొంటున్న ప్రధాన సమస్యలు ఏమిటి?" : "What are your primary operational friction points?"}
                </h2>
                <div className="grid grid-cols-1 gap-2.5">
                  {PAIN_POINTS.map((pain) => {
                    const isSelected = form.painPoints.includes(pain.id);
                    return (
                      <button
                        key={pain.id}
                        onClick={() => selectMultiple("painPoints", pain.id)}
                        className={`p-3.5 text-left rounded-xl border text-sm font-bold transition-all ${
                          isSelected
                            ? "border-primary bg-primary/5 text-primary"
                            : "border-border hover:border-slate-300 text-muted-foreground"
                        }`}
                      >
                        {language === "te" ? pain.labelTe : pain.label}
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {/* Step 6: Preferred Regional Languages */}
            {step === 6 && (
              <motion.div
                key="step6"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <h2 className="text-2xl font-black text-foreground">
                  {language === "te" ? "మీకు ఇష్టమైన భాషలను ఎంచుకోండి?" : "Which languages does your store speak?"}
                </h2>
                <div className="grid grid-cols-3 gap-3">
                  {LANGUAGES.map((lang) => {
                    const isSelected = form.preferredLanguages.includes(lang.id);
                    return (
                      <button
                        key={lang.id}
                        onClick={() => selectMultiple("preferredLanguages", lang.id)}
                        className={`p-3 text-center rounded-xl border text-sm font-bold transition-all ${
                          isSelected
                            ? "border-primary bg-primary/10 text-primary"
                            : "border-border hover:border-slate-300 text-muted-foreground"
                        }`}
                      >
                        {lang.label}
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {/* Step 7: Brand Tone */}
            {step === 7 && (
              <motion.div
                key="step7"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <h2 className="text-2xl font-black text-foreground">
                  {language === "te" ? "మీ బ్రాండ్ యొక్క శైలి ఏమిటి?" : "Choose your digital store aesthetic tone"}
                </h2>
                <div className="grid grid-cols-2 gap-3">
                  {BRAND_TONES.map((tone) => {
                    const isSelected = form.brandTone === tone.id;
                    return (
                      <button
                        key={tone.id}
                        onClick={() => setForm({ ...form, brandTone: tone.id })}
                        className={`p-4 text-left rounded-xl border text-sm font-bold transition-all ${
                          isSelected
                            ? "border-primary bg-primary/10 text-primary shadow-sm"
                            : "border-border hover:border-slate-300 text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        {language === "te" ? tone.labelTe : tone.label}
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>

        {/* Navigation Buttons */}
        <div className="flex gap-4 pt-6 border-t border-slate-100 justify-between items-center">
          <button
            onClick={handleBack}
            disabled={step === 1 || isAiThinking}
            className="px-5 py-2.5 text-sm bg-slate-100 hover:bg-slate-200 text-muted-foreground font-bold rounded-xl flex items-center gap-1.5 disabled:opacity-40"
          >
            <ArrowLeft size={16} /> {language === "te" ? "వెనుకకు" : "Back"}
          </button>

          {step < 7 ? (
            <button
              onClick={handleNext}
              className="px-6 py-2.5 text-sm bg-primary hover:bg-primary/95 text-primary-foreground font-bold rounded-xl flex items-center gap-1.5 shadow-sm"
            >
              {language === "te" ? "తరువాతి" : "Next"} <ArrowRight size={16} />
            </button>
          ) : (
            <button
              onClick={handleFinish}
              disabled={isAiThinking}
              className="px-6 py-2.5 text-sm bg-gradient-to-r from-primary to-accent hover:opacity-95 text-white font-bold rounded-xl flex items-center gap-1.5 shadow-md disabled:opacity-40"
            >
              {isAiThinking && <Loader2 className="animate-spin" size={16} />}
              {!isAiThinking && <Sparkles size={16} />}
              {language === "te" ? "నా వ్యాపారం రూపొందించండి" : "Generate My Business"}
            </button>
          )}
        </div>

      </div>
    </div>
  );
}
