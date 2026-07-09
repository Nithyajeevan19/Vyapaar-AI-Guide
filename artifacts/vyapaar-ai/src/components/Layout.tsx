import { ReactNode } from "react";
import { Sidebar } from "./Sidebar";
import { ProtectedRoute } from "./ProtectedRoute";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "wouter";

export function Layout({ children }: { children: ReactNode }) {
  const [location] = useLocation();

  return (
    <ProtectedRoute>
      <div className="flex h-[100dvh] bg-background overflow-hidden text-foreground">
        <Sidebar />
        <main className="flex-1 overflow-y-auto w-full md:w-auto relative">
          {/* Top fade gradient overlay */}
          <div className="absolute top-0 left-0 right-0 h-6 bg-gradient-to-b from-background to-transparent z-10 pointer-events-none" />
          
          <AnimatePresence mode="wait">
            <motion.div
              key={location}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              className="min-h-full"
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </ProtectedRoute>
  );
}
