import { useState, useEffect, useRef } from "react";
import { useAuth } from "../hooks/useAuth";
import { useLanguage } from "../hooks/useLanguage";
import { doc, setDoc } from "firebase/firestore";
import { db } from "../firebase/config";
import { generateChatResponse, ChatMessage } from "../services/openaiService";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, MicOff, Send, Bot, CheckCircle2, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const QUESTIONS_EN = [
  "What is your business name?",
  "What type of business do you own?",
  "Do you provide delivery or walk-in services?",
  "What phone number should customers contact?"
];

const QUESTIONS_TE = [
  "మీ వ్యాపారం పేరు ఏమిటి?",
  "మీరు ఏ రకమైన వ్యాపారం నిర్వహిస్తున్నారు?",
  "మీరు డెలివరీ సేవలు అందిస్తున్నారా లేదా వాక్-ఇన్ సేవలు అందిస్తున్నారా?",
  "కస్టమర్లు సంప్రదించడానికి ఫోన్ నంబర్ ఏమిటి?"
];

interface UIMessage {
  id: string;
  sender: "ai" | "user";
  text: string;
}

export default function AIBusinessSetupPage() {
  const { user } = useAuth();
  const { language } = useLanguage();
  const { toast } = useToast();

  const questions = language === "te" ? QUESTIONS_TE : QUESTIONS_EN;
  const systemPrompt = `You are Vyapaar AI, a friendly business consultant for Indian SMEs. You are currently onboarding a new business owner. Ask only the provided question. Keep your response SHORT (1-2 sentences max). Acknowledge the user's answer briefly, then ask the next question. If the language is Telugu, respond in Telugu. Be warm and encouraging.`;

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [messages, setMessages] = useState<UIMessage[]>([]);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([
    { role: "system", content: systemPrompt }
  ]);
  const [inputText, setText] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [isAiThinking, setIsAiThinking] = useState(false);
  const [answers, setAnswers] = useState<string[]>([]);
  const [isComplete, setIsComplete] = useState(false);

  // Use refs for SpeechRecognition to avoid stale closures and double-start errors
  const recognitionRef = useRef<any>(null);
  const isRecordingRef = useRef(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Setup Speech Recognition — recreate when language changes
  useEffect(() => {
    const SpeechRecognitionAPI =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognitionAPI) return;

    // Stop any ongoing session before replacing
    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch {}
    }
    isRecordingRef.current = false;
    setIsRecording(false);

    const rec = new SpeechRecognitionAPI();
    rec.continuous = false;
    rec.interimResults = false;
    rec.lang = language === "te" ? "te-IN" : "en-US";

    rec.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setText(transcript);
      isRecordingRef.current = false;
      setIsRecording(false);
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
  }, [language]);

  // Initial greeting (run only once on mount)
  useEffect(() => {
    const initialGreeting =
      language === "te"
        ? "నమస్తే! " + QUESTIONS_TE[0]
        : "Namaste! " + QUESTIONS_EN[0];
    addUIMessage("ai", initialGreeting);
    speakText(initialGreeting);
    setChatHistory(prev => [...prev, { role: "assistant", content: initialGreeting }]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const addUIMessage = (sender: "ai" | "user", text: string) => {
    setMessages(prev => [...prev, { id: Math.random().toString(), sender, text }]);
  };

  const speakText = (text: string) => {
    if (!("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = language === "te" ? "te-IN" : "en-US";
    window.speechSynthesis.speak(utterance);
  };

  const toggleRecording = () => {
    if (!recognitionRef.current) {
      toast({ title: "Microphone not supported", description: "Please type your answer instead.", variant: "destructive" });
      return;
    }

    if (isRecordingRef.current) {
      try { recognitionRef.current.stop(); } catch {}
      isRecordingRef.current = false;
      setIsRecording(false);
    } else {
      setText("");
      try {
        recognitionRef.current.start();
        isRecordingRef.current = true;
        setIsRecording(true);
      } catch {
        // Recognition may already be running — stop it first and retry once
        try { recognitionRef.current.stop(); } catch {}
        isRecordingRef.current = false;
        setIsRecording(false);
        setTimeout(() => {
          try {
            recognitionRef.current?.start();
            isRecordingRef.current = true;
            setIsRecording(true);
          } catch {}
        }, 300);
      }
    }
  };

  const saveBusinessInfo = async (finalAnswers: string[]) => {
    if (!user) return;
    try {
      await setDoc(doc(db, "users", user.uid), {
        businessInfo: {
          name: finalAnswers[0] || "",
          type: finalAnswers[1] || "",
          serviceType: finalAnswers[2] || "",
          phone: finalAnswers[3] || ""
        }
      }, { merge: true });
    } catch {}
  };

  const handleSend = async () => {
    if (!inputText.trim() || isAiThinking) return;

    const userText = inputText.trim();
    setText("");
    addUIMessage("user", userText);

    const newAnswers = [...answers, userText];
    setAnswers(newAnswers);

    const newHistory: ChatMessage[] = [
      ...chatHistory,
      { role: "user", content: userText }
    ];
    setChatHistory(newHistory);
    setIsAiThinking(true);

    if (currentQuestionIndex < questions.length - 1) {
      const nextIndex = currentQuestionIndex + 1;
      setCurrentQuestionIndex(nextIndex);

      const aiPrompt = `The user answered the previous question. Now acknowledge their answer briefly (1 sentence) and ask this exact next question: "${questions[nextIndex]}"`;

      try {
        const response = await generateChatResponse([...newHistory, { role: "system", content: aiPrompt }]);
        addUIMessage("ai", response);
        speakText(response);
        setChatHistory(prev => [...prev, { role: "assistant", content: response }]);
      } catch {
        const fallback = language === "te"
          ? `సరే. ${questions[nextIndex]}`
          : `Got it! ${questions[nextIndex]}`;
        addUIMessage("ai", fallback);
        speakText(fallback);
      }
    } else {
      setIsComplete(true);
      const completionMsg =
        language === "te"
          ? "ధన్యవాదాలు! మీ వ్యాపార సమాచారం సేవ్ చేయబడింది. ఇప్పుడు మీ డిజిటల్ వ్యాపారాన్ని రూపొందించండి!"
          : "Thank you! Your business information has been saved. Now generate your digital business!";
      addUIMessage("ai", completionMsg);
      speakText(completionMsg);
      await saveBusinessInfo(newAnswers);
    }

    setIsAiThinking(false);
  };

  const progressPct = Math.min(
    isComplete ? 100 : (currentQuestionIndex / questions.length) * 100,
    100
  );

  return (
    <div className="flex flex-col h-[calc(100vh-2rem)] md:h-screen p-4 md:p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">AI Business Setup</h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            {isComplete ? "Setup complete!" : `Question ${Math.min(currentQuestionIndex + 1, 4)} of 4`}
          </p>
        </div>
        <div className="text-right flex flex-col items-end gap-1.5">
          <span className="text-xs text-muted-foreground font-medium">
            {isComplete ? "Complete" : `${Math.round(progressPct)}%`}
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
                    <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center text-primary">
                      <Bot size={16} />
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
                  <span>All 4 questions answered</span>
                </div>
                <a
                  href="/website"
                  className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-primary to-accent text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:opacity-90 transition-opacity shadow-lg"
                  data-testid="button-generate-digital"
                >
                  <Sparkles size={18} />
                  Generate My Digital Business
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
