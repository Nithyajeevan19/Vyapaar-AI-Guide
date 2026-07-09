import { useEffect, useState } from "react";
import { Link } from "wouter";
import { useAuth } from "../hooks/useAuth";
import { useLanguage } from "../hooks/useLanguage";
import { useGetBusinessProfile, useListOrganizations } from "@workspace/api-client-react";
import { Bot, Globe, Users, MessageCircle, ArrowRight, Building2, Zap, LineChart } from "lucide-react";
import { motion } from "framer-motion";
import { SkeletonCard } from "../components/SkeletonCard";

export default function DashboardPage() {
  const { user } = useAuth();
  const { language } = useLanguage();
  // API query hooks
  const { data: orgs } = useListOrganizations({
    query: { enabled: !!user } as any
  });
  const { data: profile, isLoading: loadingProfile } = useGetBusinessProfile(
    { orgId: 1 },
    { query: { enabled: !!user } as any }
  );

  const [businessInfo, setBusinessInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const firstOrgName = orgs?.[0]?.name;

  useEffect(() => {
    if (loadingProfile) return;
    
    if (profile && profile.category) {
      setBusinessInfo({
        name: firstOrgName || "My Business",
        type: profile.category,
        serviceType: profile.tagline || "Service Provider",
      });
      setLoading(false);
    } else {
      // Fallback to local storage setup profile
      try {
        const cached = localStorage.getItem("vyapaar_business_info");
        if (cached) {
          setBusinessInfo(JSON.parse(cached));
        }
      } catch {}
      setLoading(false);
    }
  }, [profile, firstOrgName, loadingProfile]);

  const greeting = language === "te" ? "నమస్తే" : "Namaste";
  const userInitial = user?.displayName?.[0] || user?.email?.[0]?.toUpperCase() || "U";

  return (
    <div className="relative min-h-full">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary/40 via-accent/40 to-transparent" />
      
      <div className="p-4 md:p-8 max-w-6xl mx-auto pt-8">
        <header className="mb-10 flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-primary-foreground text-2xl font-bold shadow-md">
            {userInitial}
          </div>
          <div>
            <h1 className="text-2xl md:text-4xl font-bold text-foreground mb-1">
              {greeting}, <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">{user?.displayName || user?.email?.split("@")[0]}</span>!
            </h1>
            <p className="text-muted-foreground text-base md:text-lg">
              Welcome to your Vyapaar AI Dashboard. Let's digitize your business.
            </p>
          </div>
        </header>

        {loading ? (
          <SkeletonCard className="h-32 mb-10 w-full" />
        ) : businessInfo ? (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-card border border-card-border rounded-2xl p-6 mb-10 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative overflow-hidden"
            style={{ borderLeftWidth: '4px', borderLeftColor: 'hsl(var(--primary))' }}
          >
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2.5 bg-primary/10 text-primary rounded-xl">
                  <Building2 size={24} />
                </div>
                <h2 className="text-2xl font-bold">{businessInfo.name}</h2>
              </div>
              <p className="text-muted-foreground flex items-center gap-2 md:gap-4 text-sm mt-3 flex-wrap">
                <span className="px-3 py-1 bg-muted rounded-full font-medium">Type: {businessInfo.type}</span>
                <span className="px-3 py-1 bg-muted rounded-full font-medium">Services: {businessInfo.serviceType}</span>
              </p>
            </div>
            <Link href="/ai-setup">
              <button className="w-full md:w-auto px-6 py-3 bg-secondary text-secondary-foreground hover:bg-secondary/80 rounded-xl font-semibold transition-colors border border-secondary-border flex items-center justify-center gap-2">
                Edit Info
              </button>
            </Link>
          </motion.div>
        ) : (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-br from-primary/10 to-accent/10 border border-primary/20 rounded-2xl p-6 md:p-10 mb-10 relative overflow-hidden group"
          >
            <div className="relative z-10 max-w-2xl">
              <h2 className="text-2xl md:text-3xl font-bold mb-4">You haven't set up your business yet!</h2>
              <p className="text-muted-foreground mb-8 text-base md:text-lg">
                Talk to our AI Business Consultant to generate your website, CRM, and digital presence in under 2 minutes.
              </p>
              <Link href="/ai-setup">
                <button className="w-full md:w-auto px-8 py-4 bg-gradient-to-r from-primary to-accent text-primary-foreground rounded-xl font-bold flex items-center justify-center gap-2 hover:opacity-90 transition-transform hover:scale-105 shadow-lg shadow-primary/25" data-testid="button-start-ai-setup">
                  <Bot size={20} />
                  Start AI Business Setup
                  <ArrowRight size={20} />
                </button>
              </Link>
            </div>
            <div className="absolute right-0 bottom-0 opacity-10 group-hover:opacity-20 transition-opacity duration-500 pointer-events-none transform translate-x-1/4 translate-y-1/4">
              <Bot size={300} />
            </div>
          </motion.div>
        )}

        {/* Quick Actions */}
        {businessInfo && (
          <div className="mb-10">
            <h3 className="text-lg font-bold mb-4 text-foreground flex items-center gap-2">
              <Zap size={20} className="text-accent" /> Quick Actions
            </h3>
            <div className="flex flex-wrap gap-3">
              <Link href="/website">
                <button className="px-5 py-2.5 bg-card hover:bg-card/80 border border-card-border rounded-full font-medium text-sm flex items-center gap-2 shadow-sm transition-all hover:-translate-y-0.5">
                  <Globe size={16} className="text-primary" /> View Website
                </button>
              </Link>
              <Link href="/whatsapp">
                <button className="px-5 py-2.5 bg-card hover:bg-card/80 border border-card-border rounded-full font-medium text-sm flex items-center gap-2 shadow-sm transition-all hover:-translate-y-0.5">
                  <MessageCircle size={16} className="text-green-500" /> WhatsApp Settings
                </button>
              </Link>
              <Link href="/ai-setup">
                <button className="px-5 py-2.5 bg-card hover:bg-card/80 border border-card-border rounded-full font-medium text-sm flex items-center gap-2 shadow-sm transition-all hover:-translate-y-0.5">
                  <Bot size={16} className="text-accent" /> Talk to AI
                </button>
              </Link>
            </div>
          </div>
        )}

        <h3 className="text-xl md:text-2xl font-bold mb-6">Core Business Modules</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {[
            { title: "Website", icon: Globe, path: "/website", color: "text-blue-500", bg: "bg-blue-500/10", desc: "Digital storefront & ordering" },
            { title: "CRM", icon: Users, path: "/crm", color: "text-purple-500", bg: "bg-purple-500/10", desc: "Lead pipelines & customers" },
            { title: "WhatsApp", icon: MessageCircle, path: "/whatsapp", color: "text-green-500", bg: "bg-green-500/10", desc: "Automated customer chat" },
            { title: "Insights", icon: LineChart, path: "/insights", color: "text-orange-500", bg: "bg-orange-500/10", desc: "AI performance analytics" },
          ].map((feature, i) => (
            <Link key={i} href={feature.path}>
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * i }}
                className="bg-card border border-card-border rounded-2xl p-6 hover:border-primary/50 hover:shadow-md transition-all duration-300 hover:-translate-y-1 cursor-pointer group relative overflow-hidden"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className={`p-3 rounded-xl transition-colors ${feature.bg} ${feature.color}`}>
                    <feature.icon size={24} />
                  </div>
                </div>
                <h4 className="text-lg font-bold group-hover:text-primary transition-colors">{feature.title}</h4>
                <p className="text-sm text-muted-foreground mt-1">{feature.desc}</p>
              </motion.div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
