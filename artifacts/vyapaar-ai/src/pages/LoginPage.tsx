import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { auth, db } from "../firebase/config";
import {
  signInWithPopup,
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
} from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { useAuth } from "../hooks/useAuth";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Bot, Mail, Lock } from "lucide-react";
import { FcGoogle } from "react-icons/fc";

async function resolveRoute(uid: string): Promise<string> {
  try {
    const snap = await getDoc(doc(db, "users", uid));
    const lang = snap.data()?.language;
    if (lang === "en" || lang === "te") {
      localStorage.setItem("vyapaar_lang", lang);
      return "/dashboard";
    }
  } catch {}
  return "/language";
}

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [, setLocation] = useLocation();
  const { user, loading } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (loading || !user) return;
    let cancelled = false;
    resolveRoute(user.uid).then((route) => {
      if (!cancelled) setLocation(route);
    });
    return () => { cancelled = true; };
  }, [user, loading, setLocation]);

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    try {
      const result = await signInWithPopup(auth, new GoogleAuthProvider());
      setLocation(await resolveRoute(result.user.uid));
    } catch (error: any) {
      toast({ title: "Authentication Failed", description: error.message, variant: "destructive" });
      setIsLoading(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast({ title: "Error", description: "Please enter email and password", variant: "destructive" });
      return;
    }
    setIsLoading(true);
    try {
      const result = isLogin
        ? await signInWithEmailAndPassword(auth, email, password)
        : await createUserWithEmailAndPassword(auth, email, password);
      setLocation(await resolveRoute(result.user.uid));
    } catch (error: any) {
      toast({
        title: isLogin ? "Login Failed" : "Sign Up Failed",
        description: error.message,
        variant: "destructive",
      });
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 relative overflow-hidden">
      <motion.div 
        animate={{ scale: [1, 1.1, 1], opacity: [0.2, 0.3, 0.2] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-primary/20 blur-[120px] pointer-events-none" 
      />
      <motion.div 
        animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.4, 0.2] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        className="absolute bottom-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-accent/20 blur-[120px] pointer-events-none" 
      />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md relative group"
      >
        <div className="absolute -inset-0.5 bg-gradient-to-r from-primary via-accent to-primary rounded-3xl blur opacity-30 group-hover:opacity-60 transition duration-1000 group-hover:duration-200 animate-pulse"></div>
        
        <div className="relative bg-card/60 backdrop-blur-xl border border-card-border p-6 md:p-8 rounded-3xl shadow-2xl">
          <div className="flex justify-center mb-6">
            <div className="px-4 py-1.5 rounded-full border border-primary/20 bg-primary/10 flex items-center gap-2 text-primary font-bold text-sm shadow-sm">
              <Bot size={16} />
              Vyapaar AI
            </div>
          </div>
          
          <div className="text-center mb-8">
            <AnimatePresence mode="wait">
              <motion.h1 
                key={isLogin ? "login" : "signup"}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-2"
              >
                {isLogin ? "Welcome back" : "Create account"}
              </motion.h1>
            </AnimatePresence>
            <p className="text-muted-foreground">
              {isLogin ? "Sign in to your digital business" : "Start your digital journey"}
            </p>
          </div>

          <form onSubmit={handleEmailAuth} className="space-y-4">
            <div className="relative">
              <label className="block text-sm font-medium text-foreground mb-1">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-background/50 border border-input focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                  placeholder="you@company.com"
                  data-testid="input-email"
                />
              </div>
            </div>
            <div className="relative">
              <label className="block text-sm font-medium text-foreground mb-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-background/50 border border-input focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                  placeholder="••••••••"
                  data-testid="input-password"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 bg-gradient-to-r from-primary to-accent text-primary-foreground font-semibold rounded-xl hover:opacity-90 hover:shadow-lg hover:shadow-primary/20 transition-all flex justify-center items-center gap-2"
              data-testid="button-submit-auth"
            >
              {isLoading ? (
                <Loader2 className="animate-spin" size={20} />
              ) : isLogin ? (
                "Sign In"
              ) : (
                "Sign Up"
              )}
            </button>
          </form>

          <div className="mt-6 flex items-center gap-4 group/or">
            <motion.div className="h-[1px] flex-1 bg-border group-hover/or:bg-primary/30 transition-colors" />
            <span className="text-xs text-muted-foreground uppercase tracking-wider font-medium">OR</span>
            <motion.div className="h-[1px] flex-1 bg-border group-hover/or:bg-primary/30 transition-colors" />
          </div>

          <button
            onClick={handleGoogleSignIn}
            disabled={isLoading}
            className="w-full mt-6 py-3 px-4 bg-card border border-border text-foreground font-medium rounded-xl hover:bg-muted transition-colors flex justify-center items-center gap-2 shadow-sm"
            data-testid="button-google-signin"
          >
            <FcGoogle size={22} />
            <span>Continue with Google</span>
          </button>

          <div className="mt-8 pt-6 border-t border-border/50 text-center text-sm text-muted-foreground">
            {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="text-primary hover:underline font-semibold"
              type="button"
              data-testid="button-toggle-auth-mode"
            >
              {isLogin ? "Sign up" : "Sign in"}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
