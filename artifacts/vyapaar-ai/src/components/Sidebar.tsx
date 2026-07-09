import { Link, useLocation } from "wouter";
import { useAuth } from "../hooks/useAuth";
import { auth } from "../firebase/config";
import { signOut } from "firebase/auth";
import { 
  LayoutDashboard, 
  Bot, 
  Globe, 
  Users, 
  MessageCircle, 
  GraduationCap, 
  Landmark, 
  LineChart, 
  UserCircle, 
  HelpCircle,
  Camera,
  LogOut,
  Menu,
  X,
  Megaphone
} from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const NAV_ITEMS = [
  { name: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
  { name: "AI Business Setup", path: "/ai-setup", icon: Bot },
  { name: "Website", path: "/website", icon: Globe },
  { name: "Marketing", path: "/marketing", icon: Megaphone },
  { name: "CRM", path: "/crm", icon: Users },
  { name: "WhatsApp", path: "/whatsapp", icon: MessageCircle },
  { name: "Learning", path: "/learning", icon: GraduationCap },
  { name: "Government Schemes", path: "/schemes", icon: Landmark },
  { name: "AI Insights", path: "/insights", icon: LineChart },
  { name: "Support Agent", path: "/support", icon: HelpCircle },
  { name: "Bill Scanner", path: "/ocr-billing", icon: Camera },
  { name: "Profile", path: "/profile", icon: UserCircle },
];

export function Sidebar() {
  const [location] = useLocation();
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const renderSidebarContent = (isMobile: boolean) => (
    <>
      {/* Logo area */}
      <div className="p-6 border-b border-sidebar-border flex items-center gap-3">
        <div className="bg-sidebar-primary/20 p-2 rounded-lg text-sidebar-primary">
          <Bot size={22} />
        </div>
        <div>
          <h2 className="text-xl font-bold text-sidebar-foreground tracking-tight font-display">
            Vyapaar AI
          </h2>
          <p className="text-xs text-sidebar-foreground/50 font-medium tracking-widest uppercase font-sans">Business Suite</p>
        </div>
      </div>

      <div className="relative flex-1 overflow-hidden flex flex-col">
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-0.5 z-10 pb-12">
          {NAV_ITEMS.map((item) => {
            const isActive = location === item.path;
            return (
              <Link key={item.path} href={item.path} className="block relative">
                <div 
                  className={`flex items-center gap-3 px-4 py-2.5 rounded-xl transition-colors duration-150 font-medium text-sm relative z-10 cursor-pointer ${
                    isActive 
                      ? "text-sidebar-primary-foreground font-bold" 
                      : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground"
                  }`}
                  onClick={() => {
                    if (isMobile) setIsOpen(false);
                  }}
                  data-testid={`link-sidebar-${item.name.toLowerCase().replace(" ", "-")}`}
                >
                  <item.icon size={18} className={isActive ? "text-sidebar-primary-foreground" : "text-sidebar-foreground/50"} />
                  <span className="font-sans">{item.name}</span>
                  
                  {/* Sliding Pill Active Indicator */}
                  {isActive && (
                    <motion.div 
                      layoutId="sidebarActiveNav"
                      className="absolute inset-0 bg-sidebar-primary rounded-xl shadow-raised -z-10"
                      transition={{ type: "spring", stiffness: 220, damping: 25 }}
                    />
                  )}
                </div>
              </Link>
            );
          })}
        </nav>
        {/* Bottom scroll gradient */}
        <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-sidebar to-transparent pointer-events-none z-20" />
      </div>

      <div className="p-4 border-t border-sidebar-border bg-sidebar">
        <div className="flex items-center gap-3 mb-4 px-2">
          <div className="w-10 h-10 rounded-full bg-sidebar-primary flex items-center justify-center text-sidebar-primary-foreground font-bold text-base shadow-sm">
            {user?.displayName?.[0] || user?.email?.[0]?.toUpperCase() || "U"}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-sidebar-foreground truncate font-sans">
              {user?.displayName || "User"}
            </p>
            <p className="text-xs text-sidebar-foreground/50 truncate font-sans">
              {user?.email}
            </p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sidebar-foreground/60 hover:text-red-400 hover:bg-red-400/10 rounded-xl transition-all font-medium text-sm font-sans"
          data-testid="button-logout"
        >
          <LogOut size={16} />
          <span>Logout</span>
        </button>
      </div>
    </>
  );

  return (
    <>
      <button 
        className="md:hidden fixed top-4 left-4 z-50 p-2 bg-sidebar rounded-md text-sidebar-foreground border border-sidebar-border shadow-sm"
        onClick={() => setIsOpen(!isOpen)}
        data-testid="button-toggle-sidebar"
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Desktop Sidebar Panel */}
      <div className="hidden md:flex md:flex-col md:w-72 md:h-full md:bg-sidebar md:border-r md:border-sidebar-border md:static">
        {renderSidebarContent(false)}
      </div>

      {/* Mobile Sidebar Panel with drawer slide-in */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Overlay */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-background/80 backdrop-blur-sm z-30 md:hidden"
              onClick={() => setIsOpen(false)}
            />
            {/* Sidebar Drawer */}
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 left-0 z-40 w-72 bg-sidebar border-r border-sidebar-border flex flex-col shadow-2xl md:hidden"
            >
              {renderSidebarContent(true)}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
