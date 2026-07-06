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
  X
} from "lucide-react";
import { useState } from "react";

const NAV_ITEMS = [
  { name: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
  { name: "AI Business Setup", path: "/ai-setup", icon: Bot },
  { name: "Website", path: "/website", icon: Globe },
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
        className="md:hidden fixed top-4 left-4 z-50 p-2 bg-sidebar rounded-md text-sidebar-foreground"
        onClick={() => setIsOpen(!isOpen)}
        data-testid="button-toggle-sidebar"
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      <div className={`
        fixed inset-y-0 left-0 z-40 w-64 bg-sidebar border-r border-sidebar-border
        transform transition-transform duration-200 ease-in-out flex flex-col
        ${isOpen ? "translate-x-0" : "-translate-x-full"}
        md:translate-x-0 md:static md:w-64
      `}>
        <div className="p-6 border-b border-sidebar-border">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Vyapaar AI
          </h2>
        </div>

        <nav className="flex-1 overflow-y-auto py-4">
          <ul className="space-y-1 px-3">
            {NAV_ITEMS.map((item) => {
              const isActive = location === item.path;
              return (
                <li key={item.path}>
                  <Link href={item.path} className="block">
                    <div 
                      className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${
                        isActive 
                          ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium" 
                          : "text-muted-foreground hover:bg-sidebar-accent/50 hover:text-foreground"
                      }`}
                      onClick={() => setIsOpen(false)}
                      data-testid={`link-sidebar-${item.name.toLowerCase().replace(" ", "-")}`}
                    >
                      <item.icon size={20} className={isActive ? "text-primary" : ""} />
                      <span>{item.name}</span>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="p-4 border-t border-sidebar-border">
          <div className="flex items-center gap-3 mb-4 px-3">
            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
              {user?.displayName?.[0] || user?.email?.[0]?.toUpperCase() || "U"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">
                {user?.displayName || "User"}
              </p>
              <p className="text-xs text-muted-foreground truncate">
                {user?.email}
              </p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2 text-destructive hover:bg-destructive/10 rounded-md transition-colors"
            data-testid="button-logout"
          >
            <LogOut size={20} />
            <span>Logout</span>
          </button>
        </div>
      </div>
      
      {/* Overlay for mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-30 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
}
