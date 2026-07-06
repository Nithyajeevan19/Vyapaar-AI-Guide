import { useState, useEffect, useRef } from "react";
import { useAuth } from "../hooks/useAuth";
import { useLanguage } from "../hooks/useLanguage";
import { doc, setDoc } from "firebase/firestore";
import { db } from "../firebase/config";
import { generateChatResponse, ChatMessage } from "../services/openaiService";
import { motion } from "framer-motion";
import { Mic, Send, Bot, CheckCircle2 } from "lucide-react";
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
  const [recognition, setRecognition] = useState<any>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Setup Speech Recognition
  useEffect(() => {
    if ("SpeechRecognition" in window || "webkitSpeechRecognition" in window) {
      const SpeechRecognition = window.SpeechRecognition || (window as any).webkitSpeechRecognition;
      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.interimResults = false;
      rec.lang = language === "te" ? "te-IN" : "en-US";
      
      rec.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setText(transcript);
        setIsRecording(false);
      };
      
      rec.onerror = (event: any) => {
        console.error("Speech recognition error", event.error);
        setIsRecording(false);
      };
      
      rec.onend = () => {
        setIsRecording(false);
      };
      
      setRecognition(rec);
    }
  }, [language]);

  // Initial greeting
  useEffect(() => {
    if (messages.length === 0) {
      const initialGreeting = language === "te" ? "నమస్తే! " + questions[0] : "Namaste! " + questions[0];
      addUIMessage("ai", initialGreeting);
      speakText(initialGreeting);
      setChatHistory(prev => [...prev, { role: "assistant", content: initialGreeting }]);
    }
  }, []);

  const addUIMessage = (sender: "ai" | "user", text: string) => {
    setMessages(prev => [...prev, { id: Math.random().toString(), sender, text }]);
  };

  const speakText = (text: string) => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel(); // stop any ongoing speech
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = language === "te" ? "te-IN" : "en-US";
      window.speechSynthesis.speak(utterance);
    }
  };

  const toggleRecording = () => {
    if (isRecording) {
      recognition?.stop();
      setIsRecording(false);
    } else {
      setText("");
      recognition?.start();
      setIsRecording(true);
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
    } catch (error) {
      console.error("Error saving business info:", error);
    }
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
      
      const aiPrompt = `The user answered the previous question. Now acknowledge their answer briefly and ask this exact next question: "${questions[nextIndex]}"`;
      
      try {
        const response = await generateChatResponse([...newHistory, { role: "system", content: aiPrompt }]);
        addUIMessage("ai", response);
        speakText(response);
        setChatHistory(prev => [...prev, { role: "assistant", content: response }]);
      } catch (error) {
        // Fallback if API fails
        const fallback = language === "te" ? `సరే. ${questions[nextIndex]}` : `Got it. ${questions[nextIndex]}`;
        addUIMessage("ai", fallback);
        speakText(fallback);
      }
    } else {
      // Finished
      setIsComplete(true);
      const completionMsg = language === "te" 
        ? "ధన్యవాదాలు! మీ వ్యాపార సమాచారం సేవ్ చేయబడింది." 
        : "Thank you! Your business info is saved.";
      addUIMessage("ai", completionMsg);
      speakText(completionMsg);
      await saveBusinessInfo(newAnswers);
    }
    
    setIsAiThinking(false);
  };

  const handleGenerateClick = () => {
    toast({
      title: "Coming Soon!",
      description: "Our engineers are building the template generation engine.",
    });
  };

  return (
    <div className="flex flex-col h-[calc(100vh-2rem)] md:h-screen p-4 md:p-6 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">AI Business Setup</h1>
          <p className="text-muted-foreground text-sm">Chat with Vyapaar AI to set up your profile</p>
        </div>
        <div className="text-right">
          <div className="text-xs text-muted-foreground font-medium mb-1">
            Question {Math.min(currentQuestionIndex + 1, 4)} of 4
          </div>
          <div className="w-32 h-2 bg-muted rounded-full overflow-hidden">
            <div 
              className="h-full bg-primary transition-all duration-500" 
              style={{ width: `${(Math.min(currentQuestionIndex + 1, 4) / 4) * 100}%` }}
            />
          </div>
        </div>
      </div>

      <div className="flex-1 bg-card border border-card-border rounded-3xl overflow-hidden flex flex-col shadow-lg">
        
        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.sender === "ai" ? "justify-start" : "justify-end"}`}>
              {msg.sender === "ai" && (
                <div className="mr-3 mt-1 relative">
                  <motion.div 
                    animate={isAiThinking && msg === messages[messages.length-1] ? { scale: [1, 1.1, 1] } : {}} 
                    transition={{ repeat: Infinity, duration: 1.5 }}
                    className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center text-primary"
                  >
                    <Bot size={20} />
                  </motion.div>
                </div>
              )}
              <div className={`max-w-[80%] rounded-2xl p-4 ${
                msg.sender === "ai" 
                  ? "bg-secondary text-secondary-foreground rounded-tl-sm" 
                  : "bg-primary text-primary-foreground rounded-tr-sm"
              }`}>
                <p className="text-[15px] leading-relaxed">{msg.text}</p>
              </div>
            </div>
          ))}
          {isAiThinking && (
            <div className="flex justify-start">
              <div className="mr-3 mt-1">
                <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center text-primary">
                  <Bot size={20} />
                </div>
              </div>
              <div className="bg-secondary rounded-2xl rounded-tl-sm p-4 flex items-center space-x-2">
                <div className="w-2 h-2 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                <div className="w-2 h-2 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                <div className="w-2 h-2 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 bg-background border-t border-border">
          {isComplete ? (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center p-4"
            >
              <button 
                onClick={handleGenerateClick}
                className="w-full md:w-auto px-8 py-4 bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold text-lg flex items-center justify-center gap-3 transition-transform hover:scale-105 shadow-xl shadow-green-900/20"
                data-testid="button-generate-digital"
              >
                <CheckCircle2 size={24} />
                Generate My Digital Business
              </button>
            </motion.div>
          ) : (
            <div className="flex items-center gap-3">
              <button
                onClick={toggleRecording}
                className={`p-4 rounded-full transition-all ${
                  isRecording 
                    ? "bg-destructive text-destructive-foreground animate-pulse shadow-lg shadow-destructive/40" 
                    : "bg-secondary hover:bg-secondary/80 text-secondary-foreground"
                }`}
                data-testid="button-mic"
              >
                <Mic size={24} />
              </button>
              
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setText(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSend()}
                  placeholder={language === "te" ? "ఇక్కడ టైప్ చేయండి..." : "Type your answer..."}
                  className="w-full pl-4 pr-12 py-4 rounded-full bg-secondary/50 border border-border focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                  data-testid="input-chat"
                />
                <button
                  onClick={handleSend}
                  disabled={!inputText.trim() || isAiThinking}
                  className="absolute right-2 top-2 bottom-2 p-2 bg-primary text-primary-foreground rounded-full hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  data-testid="button-send-chat"
                >
                  <Send size={18} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
