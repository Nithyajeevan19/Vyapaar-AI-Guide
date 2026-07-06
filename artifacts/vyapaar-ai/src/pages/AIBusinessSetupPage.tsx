import { useState, useEffect, useRef, useCallback } from "react";
import { useAuth } from "../hooks/useAuth";
import { useLanguage } from "../hooks/useLanguage";
import { doc, setDoc } from "firebase/firestore";
import { db } from "../firebase/config";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, MicOff, Send, Bot, CheckCircle2, Sparkles, Volume2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// ─── Scripted conversation (no API key needed) ─────────────────────────────

const SCRIPT = {
  en: {
    greeting:
      "Hello! Welcome to Vyapaar AI. I'll ask you three quick questions to help digitize your business.",
    questions: [
      "What is your business name?",
      "What type of business do you own?",
      "Do you provide delivery service, walk-in service, or both?",
    ],
    acks: [
      "Great, noted!",
      "Perfect, got it!",
      "Understood!",
    ],
    done: "Excellent! I have all the information I need. Please click Generate My Business to continue.",
    lang: "en-US",
  },
  te: {
    greeting:
      "నమస్కారం! వ్యాపార్ AI కు స్వాగతం. మీ వ్యాపారాన్ని డిజిటల్ చేయడానికి నేను మూడు చిన్న ప్రశ్నలు అడుగుతాను.",
    questions: [
      "మీ వ్యాపారం పేరు ఏమిటి?",
      "మీరు ఏ రకమైన వ్యాపారం చేస్తున్నారు?",
      "మీరు డెలివరీ సేవ, వాక్-ఇన్ సేవ లేదా రెండూ అందిస్తున్నారా?",
    ],
    acks: [
      "చాలా బాగుంది!",
      "అర్థమైంది!",
      "సరే!",
    ],
    done: "అద్భుతం! నాకు అవసరమైన సమాచారం మొత్తం వచ్చింది. దయచేసి 'Generate My Business' బటన్ను నొక్కండి.",
    lang: "te-IN",
  },
};

interface UIMessage {
  id: string;
  sender: "ai" | "user";
  text: string;
}

// ─── TTS helper ──────────────────────────────────────────────────────────────

function speakText(text: string, lang: string) {
  if (!("speechSynthesis" in window)) return;
  window.speechSynthesis.cancel();

  const utter = new SpeechSynthesisUtterance(text);
  utter.lang = lang;
  utter.rate = 0.95;
  utter.pitch = 1;

  // Pick best available voice for the language
  const setVoice = () => {
    const voices = window.speechSynthesis.getVoices();
    const match =
      voices.find((v) => v.lang === lang) ||
      voices.find((v) => v.lang.startsWith(lang.split("-")[0])) ||
      null;
    if (match) utter.voice = match;
    window.speechSynthesis.speak(utter);
  };

  const voices = window.speechSynthesis.getVoices();
  if (voices.length > 0) {
    setVoice();
  } else {
    // Voices not loaded yet — wait for the event
    window.speechSynthesis.addEventListener("voiceschanged", setVoice, { once: true });
  }
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function AIBusinessSetupPage() {
  const { user } = useAuth();
  const { language } = useLanguage();
  const { toast } = useToast();

  const script = SCRIPT[language as "en" | "te"] ?? SCRIPT.en;

  // ── State ──────────────────────────────────────────────────────────────────
  const [messages, setMessages] = useState<UIMessage[]>([]);
  const [inputText, setText] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [isAiThinking, setIsAiThinking] = useState(false);
  const [answers, setAnswers] = useState<string[]>([]);
  const [currentQ, setCurrentQ] = useState(0); // which question we're on
  const [isComplete, setIsComplete] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const recognitionRef = useRef<any>(null);
  const isRecordingRef = useRef(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const hasGreeted = useRef(false);

  // ── Scroll to bottom ───────────────────────────────────────────────────────
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // ── Add a UI message ───────────────────────────────────────────────────────
  const addMsg = useCallback((sender: "ai" | "user", text: string) => {
    setMessages((prev) => [...prev, { id: crypto.randomUUID(), sender, text }]);
  }, []);

  // ── Speak + show AI message ────────────────────────────────────────────────
  const aiSay = useCallback(
    (text: string) => {
      addMsg("ai", text);
      setIsSpeaking(true);
      const utter = new SpeechSynthesisUtterance(text);
      utter.lang = script.lang;
      utter.rate = 0.95;

      const fire = () => {
        const voices = window.speechSynthesis.getVoices();
        const match =
          voices.find((v) => v.lang === script.lang) ||
          voices.find((v) => v.lang.startsWith(script.lang.split("-")[0])) ||
          null;
        if (match) utter.voice = match;
        utter.onend = () => setIsSpeaking(false);
        utter.onerror = () => setIsSpeaking(false);
        window.speechSynthesis.cancel();
        window.speechSynthesis.speak(utter);
      };

      if (window.speechSynthesis.getVoices().length > 0) {
        fire();
      } else {
        window.speechSynthesis.addEventListener("voiceschanged", fire, { once: true });
      }
    },
    [script.lang, addMsg]
  );

  // ── Initial greeting — runs once per language ──────────────────────────────
  useEffect(() => {
    if (hasGreeted.current) return;
    hasGreeted.current = true;

    // Small delay so TTS voices have time to load
    const t = setTimeout(() => {
      const greeting = `${script.greeting} ${script.questions[0]}`;
      aiSay(greeting);
    }, 600);

    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Build Speech Recognition ───────────────────────────────────────────────
  useEffect(() => {
    const SR =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;
    if (!SR) return;

    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort();
      } catch {}
    }

    const rec = new SR();
    rec.continuous = false;
    rec.interimResults = false;
    rec.lang = script.lang;

    rec.onresult = (e: any) => {
      const transcript = e.results[0][0].transcript.trim();
      isRecordingRef.current = false;
      setIsRecording(false);
      if (transcript) {
        setText(transcript);
        // Auto-submit after STT result
        setTimeout(() => submitAnswer(transcript), 300);
      }
    };

    rec.onerror = (e: any) => {
      isRecordingRef.current = false;
      setIsRecording(false);
      if (e.error !== "no-speech" && e.error !== "aborted") {
        toast({
          title: language === "te" ? "మైక్రోఫోన్ లోపం" : "Microphone Error",
          description:
            language === "te"
              ? "దయచేసి టైప్ చేయండి."
              : "Please type your answer instead.",
          variant: "destructive",
        });
      }
    };

    rec.onend = () => {
      isRecordingRef.current = false;
      setIsRecording(false);
    };

    recognitionRef.current = rec;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [language]);

  // ── Submit an answer ───────────────────────────────────────────────────────
  const submitAnswer = useCallback(
    async (text: string) => {
      if (!text.trim() || isAiThinking || isComplete) return;
      const userText = text.trim();
      setText("");
      addMsg("user", userText);

      const newAnswers = [...answers, userText];
      setAnswers(newAnswers);
      setIsAiThinking(true);

      // Small "thinking" pause for natural feel
      await new Promise((r) => setTimeout(r, 600));

      const nextQ = currentQ + 1;

      if (nextQ < script.questions.length) {
        // Acknowledge + ask next question
        const ack = script.acks[currentQ] ?? (language === "te" ? "సరే!" : "Got it!");
        const response = `${ack} ${script.questions[nextQ]}`;
        setCurrentQ(nextQ);
        setIsAiThinking(false);
        aiSay(response);
      } else {
        // All questions answered
        setIsComplete(true);
        setIsAiThinking(false);
        aiSay(script.done);
        await saveBusinessInfo(newAnswers);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [answers, currentQ, isAiThinking, isComplete, script, language]
  );

  // ── Save to Firestore + localStorage ──────────────────────────────────────
  const saveBusinessInfo = async (finalAnswers: string[]) => {
    const info = {
      name: finalAnswers[0] || "",
      type: finalAnswers[1] || "",
      serviceType: finalAnswers[2] || "",
    };
    // Write to localStorage immediately so WebsitePage loads without Firestore delay
    try { localStorage.setItem("vyapaar_business_info", JSON.stringify(info)); } catch {}

    if (!user) return;
    try {
      await setDoc(
        doc(db, "users", user.uid),
        { businessInfo: info },
        { merge: true }
      );
    } catch {}
  };

  // ── handleSend (text input) ────────────────────────────────────────────────
  const handleSend = () => {
    if (inputText.trim()) submitAnswer(inputText);
  };

  // ── Toggle voice recording ─────────────────────────────────────────────────
  const toggleRecording = () => {
    const rec = recognitionRef.current;
    if (!rec) {
      toast({
        title: language === "te" ? "మైక్రోఫోన్ అందుబాటులో లేదు" : "Microphone not supported",
        description:
          language === "te"
            ? "దయచేసి టైప్ చేయండి."
            : "Please type your answer instead.",
        variant: "destructive",
      });
      return;
    }

    if (isRecordingRef.current) {
      try {
        rec.stop();
      } catch {}
      isRecordingRef.current = false;
      setIsRecording(false);
    } else {
      setText("");
      try {
        rec.start();
        isRecordingRef.current = true;
        setIsRecording(true);
      } catch {
        // Already started — abort and retry
        try {
          rec.abort();
        } catch {}
        isRecordingRef.current = false;
        setIsRecording(false);
        setTimeout(() => {
          try {
            rec.start();
            isRecordingRef.current = true;
            setIsRecording(true);
          } catch {}
        }, 400);
      }
    }
  };

  // ── Progress ───────────────────────────────────────────────────────────────
  const totalQ = script.questions.length;
  const progressPct = isComplete ? 100 : (currentQ / totalQ) * 100;

  // ─── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col h-[calc(100vh-2rem)] md:h-screen p-4 md:p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">AI Business Setup</h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            {isComplete
              ? language === "te"
                ? "సెటప్ పూర్తయింది!"
                : "Setup complete!"
              : `${language === "te" ? "ప్రశ్న" : "Question"} ${Math.min(currentQ + 1, totalQ)} ${language === "te" ? "యొక్క" : "of"} ${totalQ}`}
          </p>
        </div>
        <div className="text-right flex flex-col items-end gap-1.5">
          <span className="text-xs text-muted-foreground font-medium">
            {isComplete ? (language === "te" ? "పూర్తి" : "Complete") : `${Math.round(progressPct)}%`}
          </span>
          <div className="w-36 h-2 bg-muted rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-primary rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progressPct}%` }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            />
          </div>
        </div>
      </div>

      {/* Chat card */}
      <div className="flex-1 bg-card border border-card-border rounded-2xl overflow-hidden flex flex-col shadow-xl min-h-0">

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">
          <AnimatePresence initial={false}>
            {messages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25 }}
                className={`flex ${msg.sender === "ai" ? "justify-start" : "justify-end"}`}
              >
                {msg.sender === "ai" && (
                  <div className="mr-2.5 mt-1 shrink-0">
                    <div className={`w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center text-primary transition-transform ${isSpeaking && msg.id === messages[messages.length - 1]?.id ? "scale-110" : ""}`}>
                      {isSpeaking && msg.id === messages[messages.length - 1]?.id
                        ? <Volume2 size={16} className="animate-pulse" />
                        : <Bot size={16} />}
                    </div>
                  </div>
                )}
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-3 text-[14px] leading-relaxed ${
                    msg.sender === "ai"
                      ? "bg-secondary text-secondary-foreground rounded-tl-sm"
                      : "bg-primary text-primary-foreground rounded-tr-sm"
                  }`}
                >
                  {msg.text}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Typing indicator */}
          {isAiThinking && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex justify-start"
            >
              <div className="mr-2.5 mt-1 shrink-0">
                <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center text-primary">
                  <Bot size={16} />
                </div>
              </div>
              <div className="bg-secondary rounded-2xl rounded-tl-sm px-4 py-3 flex items-center gap-1">
                {[0, 150, 300].map((delay) => (
                  <div
                    key={delay}
                    className="w-2 h-2 bg-primary/60 rounded-full animate-bounce"
                    style={{ animationDelay: `${delay}ms` }}
                  />
                ))}
              </div>
            </motion.div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input area */}
        <div className="shrink-0 p-4 bg-background/80 border-t border-border backdrop-blur-sm">
          <AnimatePresence mode="wait">
            {isComplete ? (
              <motion.div
                key="complete"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col sm:flex-row items-center gap-3"
              >
                <div className="flex items-center gap-2 text-green-500 text-sm font-medium">
                  <CheckCircle2 size={18} />
                  <span>
                    {language === "te"
                      ? "మూడు ప్రశ్నలకు సమాధానం ఇవ్వబడింది"
                      : "All 3 questions answered"}
                  </span>
                </div>
                <a
                  href="/website"
                  className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-primary to-accent text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:opacity-90 transition-opacity shadow-lg"
                  data-testid="button-generate-digital"
                >
                  <Sparkles size={18} />
                  {language === "te" ? "నా వ్యాపారం రూపొందించండి" : "Generate My Business"}
                </a>
              </motion.div>
            ) : (
              <motion.div
                key="input"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center gap-2"
              >
                <button
                  onClick={toggleRecording}
                  className={`shrink-0 p-3 rounded-full transition-all ${
                    isRecording
                      ? "bg-destructive text-white animate-pulse shadow-lg shadow-destructive/30"
                      : "bg-secondary hover:bg-secondary/80 text-secondary-foreground"
                  }`}
                  data-testid="button-mic"
                  title={isRecording ? "Stop recording" : "Start voice input"}
                >
                  {isRecording ? <MicOff size={20} /> : <Mic size={20} />}
                </button>

                <div className="flex-1 relative">
                  <input
                    type="text"
                    value={inputText}
                    onChange={(e) => setText(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
                    placeholder={
                      isRecording
                        ? language === "te" ? "వింటున్నాను..." : "Listening..."
                        : language === "te" ? "ఇక్కడ టైప్ చేయండి..." : "Type your answer..."
                    }
                    className="w-full pl-4 pr-12 py-3 rounded-full bg-secondary/50 border border-border focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-sm"
                    data-testid="input-chat"
                  />
                  <button
                    onClick={handleSend}
                    disabled={!inputText.trim() || isAiThinking}
                    className="absolute right-1.5 top-1.5 bottom-1.5 px-3 bg-primary text-primary-foreground rounded-full hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center"
                    data-testid="button-send-chat"
                  >
                    <Send size={16} />
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
