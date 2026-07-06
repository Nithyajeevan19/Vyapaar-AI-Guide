import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../firebase/config";
import { useAuth } from "../hooks/useAuth";

export type Language = "en" | "te";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => Promise<void>;
  loading: boolean;
}

export const LanguageContext = createContext<LanguageContextType>({
  language: "en",
  setLanguage: async () => {},
  loading: true,
});

export function LanguageProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [language, setLanguageState] = useState<Language>("en");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadLanguage() {
      if (user) {
        try {
          const docRef = doc(db, "users", user.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists() && docSnap.data().language) {
            setLanguageState(docSnap.data().language as Language);
          }
        } catch (error) {
          console.error("Failed to load language:", error);
        }
      }
      setLoading(false);
    }
    
    if (user) {
      loadLanguage();
    } else {
      setLanguageState("en");
      setLoading(false);
    }
  }, [user]);

  const setLanguage = async (lang: Language) => {
    setLanguageState(lang);
    if (user) {
      try {
        await setDoc(doc(db, "users", user.uid), { language: lang }, { merge: true });
      } catch (error) {
        console.error("Failed to save language:", error);
      }
    }
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, loading }}>
      {children}
    </LanguageContext.Provider>
  );
}
