import { createContext, useEffect, useState, ReactNode } from "react";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../firebase/config";
import { useAuth } from "../hooks/useAuth";

export type Language = "en" | "te";

const LS_KEY = "vyapaar_lang";

function getCachedLang(): Language {
  try {
    const v = localStorage.getItem(LS_KEY);
    if (v === "en" || v === "te") return v;
  } catch {}
  return "en";
}

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => Promise<void>;
  loading: boolean;
}

export const LanguageContext = createContext<LanguageContextType>({
  language: "en",
  setLanguage: async () => {},
  loading: false,
});

export function LanguageProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  // Seed from localStorage immediately — no Firestore waterfall on first render
  const [language, setLanguageState] = useState<Language>(getCachedLang());
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) {
      setLanguageState("en");
      return;
    }

    // Only fetch from Firestore when there's nothing in localStorage yet
    const cached = localStorage.getItem(LS_KEY);
    if (cached === "en" || cached === "te") return;

    let cancelled = false;
    setLoading(true);
    getDoc(doc(db, "users", user.uid))
      .then((snap) => {
        if (cancelled) return;
        const lang = snap.data()?.language as Language | undefined;
        if (lang === "en" || lang === "te") {
          setLanguageState(lang);
          localStorage.setItem(LS_KEY, lang);
        }
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, [user]);

  const setLanguage = async (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem(LS_KEY, lang);
    if (user) {
      try {
        await setDoc(doc(db, "users", user.uid), { language: lang }, { merge: true });
      } catch {}
    }
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, loading }}>
      {children}
    </LanguageContext.Provider>
  );
}
