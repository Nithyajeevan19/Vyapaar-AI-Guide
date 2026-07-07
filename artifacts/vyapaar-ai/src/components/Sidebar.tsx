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
  LogOut,
  Menu,
  X,
  Megaphone
} from "lucide-react";
import { useState } from "react";

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

  return (
    <>
      <button 
        className="md:hidden fixed top-4 left-4 z-50 p-2 bg-sidebar rounded-md text-sidebar-foreground border border-sidebar-border shadow-sm"
        onClick={() => setIsOpen(!isOpen)}
        data-testid="button-toggle-sidebar"
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Sidebar Panel */}
      <div className={`
        fixed inset-y-0 left-0 z-40 w-72 bg-sidebar border-r border-sidebar-border
        transform transition-transform duration-300 ease-in-out flex flex-col
        ${isOpen ? "translate-x-0" : "-translate-x-full"}
        md:translate-x-0 md:static md:w-72 shadow-2xl md:shadow-none
      `}>
        {/* Logo area */}
        <div className="p-6 border-b border-sidebar-border flex items-center gap-3">
          <div className="bg-sidebar-primary/20 p-2 rounded-lg text-sidebar-primary">
            <Bot size={22} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-sidebar-foreground tracking-tight">
              Vyapaar AI
            </h2>
            <p className="text-xs text-sidebar-foreground/50 font-medium tracking-widest uppercase">Business Suite</p>
          </div>
        </div>

        <div className="relative flex-1 overflow-hidden flex flex-col">
          <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-0.5 z-10 pb-12">
            {NAV_ITEMS.map((item) => {
              const isActive = location === item.path;
              return (
                <Link key={item.path} href={item.path} className="block">
                  <div 
                    className={`flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all font-medium text-sm ${
                      isActive 
                        ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-md shadow-sidebar-primary/25" 
                        : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground"
                    }`}
                    onClick={() => setIsOpen(false)}
                    data-testid={`link-sidebar-${item.name.toLowerCase().replace(" ", "-")}`}
                  >
                    <item.icon size={18} className={isActive ? "text-sidebar-primary-foreground" : "text-sidebar-foreground/50"} />
                    <span>{item.name}</span>
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
              <p className="text-sm font-semibold text-sidebar-foreground truncate">
                {user?.displayName || "User"}
              </p>
              <p className="text-xs text-sidebar-foreground/50 truncate">
                {user?.email}
              </p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sidebar-foreground/60 hover:text-red-400 hover:bg-red-400/10 rounded-xl transition-all font-medium text-sm"
            data-testid="button-logout"
          >
            <LogOut size={16} />
            <span>Logout</span>
          </button>
        </div>
      </div>
      
      {/* Overlay for mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-30 md:hidden transition-opacity"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
}
