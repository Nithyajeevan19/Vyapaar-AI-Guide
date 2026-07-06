import { ReactNode } from "react";
import { Sidebar } from "./Sidebar";
import { ProtectedRoute } from "./ProtectedRoute";

export function Layout({ children }: { children: ReactNode }) {
  return (
    <ProtectedRoute>
      <div className="flex h-screen bg-background overflow-hidden text-foreground">
        <Sidebar />
        <main className="flex-1 overflow-y-auto w-full md:w-auto">
          {children}
        </main>
      </div>
    </ProtectedRoute>
  );
}
