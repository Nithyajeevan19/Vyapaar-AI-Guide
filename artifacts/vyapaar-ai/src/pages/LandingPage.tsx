import { Link } from "wouter";
import { motion } from "framer-motion";
import { Bot, Globe, MessageCircle, Users } from "lucide-react";

export default function LandingPage() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/30 relative overflow-hidden flex flex-col">
      {/* Background Orbs */}
      <motion.div 
        animate={{ scale: [1, 1.1, 1], opacity: [0.2, 0.3, 0.2] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-primary/20 blur-[120px] pointer-events-none" 
      />
      <motion.div 
        animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.4, 0.2] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-accent/20 blur-[120px] pointer-events-none" 
      />

      {/* Navbar */}
      <nav className="relative z-10 container mx-auto px-4 md:px-6 py-6 flex justify-between items-center">
        <div className="flex items-center gap-2 text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
          <Bot className="text-primary" size={28} />
          Vyapaar AI
        </div>
        <Link href="/login" className="block">
          <div className="px-6 py-2 rounded-full bg-card/50 backdrop-blur-md border border-border text-sm font-medium hover:bg-card/80 transition-colors cursor-pointer shadow-sm" data-testid="link-login">
            Login
          </div>
        </Link>
      </nav>

      {/* Hero */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center text-center px-4 md:px-6 py-12 md:py-20">
        <motion.div 
          className="max-w-4xl mx-auto space-y-8"
          initial="hidden"
          animate="visible"
          variants={containerVariants}
        >
          <motion.div variants={itemVariants} className="relative inline-block group">
            <div className="absolute inset-0 bg-gradient-to-r from-primary via-accent to-primary rounded-full blur opacity-50 group-hover:opacity-100 transition duration-1000 group-hover:duration-200 animate-pulse"></div>
            <div className="relative px-4 py-1.5 rounded-full border border-primary/30 bg-background/80 backdrop-blur-sm text-primary text-sm font-bold mb-4">
              India's #1 AI Business Platform
            </div>
          </motion.div>
          
          <motion.h1 variants={itemVariants} className="text-4xl md:text-7xl font-extrabold tracking-tight leading-tight">
            Apna Business, <br />
            <span className="bg-gradient-to-r from-primary via-purple-500 to-accent bg-clip-text text-transparent">Digital Banao</span>
          </motion.h1>
          
          <motion.p variants={itemVariants} className="text-base md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            AI se banaiye apna website, CRM, aur WhatsApp automation -- sirf bolke!
          </motion.p>
          
          <motion.div variants={itemVariants} className="pt-6 md:pt-8">
            <Link href="/login" className="inline-block">
              <div className="px-8 py-4 rounded-full bg-gradient-to-r from-primary to-accent text-primary-foreground font-semibold text-lg shadow-lg hover:shadow-primary/25 hover:opacity-90 hover:scale-105 transition-all duration-300 cursor-pointer" data-testid="button-get-started">
                Get Started
              </div>
            </Link>
          </motion.div>
        </motion.div>

        {/* Divider */}
        <div className="w-full max-w-2xl mx-auto mt-20 h-px bg-gradient-to-r from-transparent via-border to-transparent"></div>

        {/* Feature Cards */}
        <motion.div 
          className="mt-20 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto w-full"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          variants={containerVariants}
        >
          {[
            { title: "Website Generator", icon: Globe, desc: "Instant digital storefronts" },
            { title: "CRM Setup", icon: Users, desc: "Manage customers easily" },
            { title: "WhatsApp Automation", icon: MessageCircle, desc: "24/7 customer support" },
            { title: "AI Insights", icon: Bot, desc: "Smart business analytics" }
          ].map((feature, i) => (
            <motion.div 
              key={i} 
              variants={itemVariants}
              className="p-6 rounded-2xl bg-card border border-card-border hover:border-primary/50 hover:ring-1 hover:ring-primary/20 hover:bg-card/80 transition-all duration-300 hover:-translate-y-1 shadow-sm text-left group"
            >
              <div className="w-12 h-12 rounded-xl bg-primary/10 group-hover:bg-primary/20 transition-colors flex items-center justify-center text-primary mb-4">
                <feature.icon size={24} />
              </div>
              <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
              <p className="text-sm md:text-base text-muted-foreground">{feature.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 mt-auto py-8">
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent"></div>
        <div className="container mx-auto px-4 md:px-6 text-center text-muted-foreground text-sm font-medium">
          &copy; {new Date().getFullYear()} Vyapaar AI. Built for Bharat.
        </div>
      </footer>
    </div>
  );
}
