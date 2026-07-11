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
    if (localStorage.getItem("vyapaar_mock_user")) {
      setLoading(false);
      return;
    }
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
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
