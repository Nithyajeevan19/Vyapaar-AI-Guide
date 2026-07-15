import { createContext, useEffect, useState, ReactNode } from "react";
import { User, onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebase/config";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  currentOrgId: number;
  setCurrentOrgId: (id: number) => void;
  currentBranchId: number;
  setCurrentBranchId: (id: number) => void;
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  currentOrgId: 1,
  setCurrentOrgId: () => {},
  currentBranchId: 1,
  setCurrentBranchId: () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  // Synchronously seed from currentUser or localStorage mock so the spinner almost never shows
  const [user, setUser] = useState<User | null>(() => {
    const mock = localStorage.getItem("vyapaar_mock_user");
    if (mock) {
      try {
        return JSON.parse(mock) as User;
      } catch {
        return {
          uid: "mock-user-1",
          email: "developer@vyapaar.ai",
          displayName: "Mock Developer",
        } as unknown as User;
      }
    }
    return auth.currentUser;
  });
  const [loading, setLoading] = useState(() => {
    if (localStorage.getItem("vyapaar_mock_user")) return false;
    return !auth.currentUser;
  });

  const [currentOrgId, setCurrentOrgIdState] = useState<number>(() => {
    const cached = localStorage.getItem("vyapaar_current_org_id");
    return cached ? parseInt(cached, 10) : 1;
  });

  const [currentBranchId, setCurrentBranchIdState] = useState<number>(() => {
    const cached = localStorage.getItem("vyapaar_current_branch_id");
    return cached ? parseInt(cached, 10) : 1;
  });

  const setCurrentOrgId = (id: number) => {
    setCurrentOrgIdState(id);
    localStorage.setItem("vyapaar_current_org_id", String(id));
  };

  const setCurrentBranchId = (id: number) => {
    setCurrentBranchIdState(id);
    localStorage.setItem("vyapaar_current_branch_id", String(id));
  };

  useEffect(() => {
    let active = true;

    async function syncUser(currentUser: any) {
      try {
        const API_BASE_URL = import.meta.env.VITE_API_URL || "https://vyapaar-ai-guide-1.onrender.com";
        const res = await fetch(`${API_BASE_URL}/api/auth/sync`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: currentUser.uid || currentUser.id,
            email: currentUser.email,
            displayName: currentUser.displayName,
          }),
        });
        if (res.ok && active) {
          const data = await res.json();
          if (data.organization?.id) {
            setCurrentOrgId(data.organization.id);
            if (data.branch?.id) {
              setCurrentBranchId(data.branch.id);
            }
          }
        }
      } catch (err) {
        console.error("Failed to sync user auth state on load:", err);
      }
    }

    const mock = localStorage.getItem("vyapaar_mock_user");
    if (mock) {
      try {
        const parsed = JSON.parse(mock);
        setUser(parsed);
        syncUser(parsed).finally(() => {
          if (active) setLoading(false);
        });
      } catch {
        setLoading(false);
      }
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        syncUser(currentUser).finally(() => {
          if (active) setLoading(false);
        });
      } else {
        setUser(null);
        setLoading(false);
      }
    });

    return () => {
      active = false;
      unsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider 
      value={{ 
        user, 
        loading, 
        currentOrgId, 
        setCurrentOrgId, 
        currentBranchId, 
        setCurrentBranchId 
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
