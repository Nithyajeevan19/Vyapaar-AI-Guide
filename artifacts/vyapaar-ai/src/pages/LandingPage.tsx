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
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-primary/20 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-accent/20 blur-[120px] pointer-events-none" />

      {/* Navbar */}
      <nav className="relative z-10 container mx-auto px-6 py-6 flex justify-between items-center">
        <div className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
          Vyapaar AI
        </div>
        <Link href="/login" className="block">
          <div className="px-6 py-2 rounded-full bg-card/50 backdrop-blur-md border border-border text-sm font-medium hover:bg-card/80 transition-colors cursor-pointer" data-testid="link-login">
            Login
          </div>
        </Link>
      </nav>

      {/* Hero */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center text-center px-6 py-20">
        <motion.div 
          className="max-w-4xl mx-auto space-y-8"
          initial="hidden"
          animate="visible"
          variants={containerVariants}
        >
          <motion.div variants={itemVariants} className="inline-block px-4 py-1.5 rounded-full border border-primary/30 bg-primary/10 text-primary text-sm font-medium mb-4">
            India's #1 AI Business Platform
          </motion.div>
          
          <motion.h1 variants={itemVariants} className="text-5xl md:text-7xl font-bold tracking-tight leading-tight">
            Apna Business, <br />
            <span className="bg-gradient-to-r from-primary via-purple-500 to-accent bg-clip-text text-transparent">Digital Banao</span>
          </motion.h1>
          
          <motion.p variants={itemVariants} className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            AI se banaiye apna website, CRM, aur WhatsApp automation -- sirf bolke!
          </motion.p>
          
          <motion.div variants={itemVariants} className="pt-8">
            <Link href="/login" className="inline-block">
              <div className="px-8 py-4 rounded-full bg-gradient-to-r from-primary to-accent text-primary-foreground font-semibold text-lg shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 cursor-pointer" data-testid="button-get-started">
                Get Started
              </div>
            </Link>
          </motion.div>
        </motion.div>

        {/* Feature Cards */}
        <motion.div 
          className="mt-32 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto w-full"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
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
              className="p-6 rounded-2xl bg-card/40 backdrop-blur-md border border-card-border hover:bg-card/60 transition-colors text-left"
            >
              <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center text-primary mb-4">
                <feature.icon size={24} />
              </div>
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-border mt-auto py-8">
        <div className="container mx-auto px-6 text-center text-muted-foreground text-sm">
          &copy; {new Date().getFullYear()} Vyapaar AI. Built for Bharat.
        </div>
      </footer>
    </div>
  );
}
