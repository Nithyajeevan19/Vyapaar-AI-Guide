import { useEffect, useState } from "react";
import { Link } from "wouter";
import { useAuth } from "../hooks/useAuth";
import { useLanguage } from "../hooks/useLanguage";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase/config";
import { Bot, Globe, Users, MessageCircle, Lock, ArrowRight, Building2 } from "lucide-react";
import { motion } from "framer-motion";

export default function DashboardPage() {
  const { user } = useAuth();
  const { language } = useLanguage();
  const [businessInfo, setBusinessInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchBusiness() {
      if (user) {
        const docRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists() && docSnap.data().businessInfo) {
          setBusinessInfo(docSnap.data().businessInfo);
        }
      }
      setLoading(false);
    }
    fetchBusiness();
  }, [user]);

  const greeting = language === "te" ? "నమస్తే" : "Namaste";

  return (
    <div className="p-6 md:p-10 max-w-6xl mx-auto">
      <header className="mb-10">
        <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
          {greeting}, <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">{user?.displayName || user?.email?.split("@")[0]}</span>!
        </h1>
        <p className="text-muted-foreground text-lg">
          Welcome to your Vyapaar AI Dashboard. Let's digitize your business.
        </p>
      </header>

      {loading ? (
        <div className="animate-pulse flex space-x-4 mb-8">
          <div className="flex-1 space-y-4 py-1">
            <div className="h-4 bg-muted rounded w-3/4"></div>
            <div className="space-y-2">
              <div className="h-4 bg-muted rounded"></div>
              <div className="h-4 bg-muted rounded w-5/6"></div>
            </div>
          </div>
        </div>
      ) : businessInfo ? (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card border border-card-border rounded-2xl p-6 mb-10 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
        >
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-primary/20 text-primary rounded-lg">
                <Building2 size={24} />
              </div>
              <h2 className="text-2xl font-bold">{businessInfo.name}</h2>
            </div>
            <p className="text-muted-foreground flex gap-4 text-sm mt-2">
              <span>Type: {businessInfo.type}</span>
              <span>•</span>
              <span>Services: {businessInfo.serviceType}</span>
            </p>
          </div>
          <Link href="/ai-setup">
            <button className="px-6 py-3 bg-secondary text-secondary-foreground hover:bg-secondary/80 rounded-xl font-medium transition-colors border border-secondary-border">
              Edit Business Info
            </button>
          </Link>
        </motion.div>
      ) : (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-primary/10 to-accent/10 border border-primary/20 rounded-2xl p-8 mb-10 relative overflow-hidden"
        >
          <div className="relative z-10 max-w-2xl">
            <h2 className="text-2xl font-bold mb-4">You haven't set up your business yet!</h2>
            <p className="text-muted-foreground mb-6 text-lg">
              Talk to our AI Business Consultant to generate your website, CRM, and digital presence in under 2 minutes.
            </p>
            <Link href="/ai-setup">
              <button className="px-8 py-4 bg-primary text-primary-foreground rounded-xl font-bold flex items-center gap-2 hover:bg-primary/90 transition-transform hover:scale-105 shadow-lg shadow-primary/20" data-testid="button-start-ai-setup">
                Start AI Business Setup
                <ArrowRight size={20} />
              </button>
            </Link>
          </div>
          <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none transform translate-x-1/4 translate-y-1/4">
            <Bot size={300} />
          </div>
        </motion.div>
      )}

      <h3 className="text-xl font-bold mb-6">Upcoming Features</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { title: "Website", icon: Globe, path: "/website" },
          { title: "CRM", icon: Users, path: "/crm" },
          { title: "WhatsApp", icon: MessageCircle, path: "/whatsapp" },
          { title: "Insights", icon: LineChart, path: "/insights" },
        ].map((feature, i) => (
          <Link key={i} href={feature.path}>
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * i }}
              className="bg-card border border-card-border rounded-2xl p-6 hover:border-primary/50 transition-colors cursor-pointer group relative overflow-hidden"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-muted rounded-xl text-muted-foreground group-hover:text-primary transition-colors">
                  <feature.icon size={24} />
                </div>
                <Lock size={16} className="text-muted-foreground/50" />
              </div>
              <h4 className="text-lg font-bold">{feature.title}</h4>
              <p className="text-sm text-muted-foreground mt-1">Coming Soon</p>
            </motion.div>
          </Link>
        ))}
      </div>
    </div>
  );
}

// Ensure LineChart is imported if used in array (adding here just in case)
import { LineChart } from "lucide-react";
