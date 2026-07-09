import { createContext, useEffect, useState, ReactNode } from "react";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../firebase/config";
import { useAuth } from "../hooks/useAuth";

export type Language = "en" | "te" | "hi" | "ta" | "kn" | "mr";

const LS_KEY = "vyapaar_lang";

export const TRANSLATIONS = {
  en: {
    dashboard: "Dashboard",
    welcome: "Welcome",
    website: "Website",
    crm: "CRM",
    whatsapp: "WhatsApp",
    insights: "Insights",
    marketing: "Marketing",
    settings: "Settings",
    language: "Language",
    comingSoon: "Coming Soon",
    activeProfile: "Active Profile",
    onboardingTitle: "AI Onboarding Setup",
    onboardingDesc: "Talk to our AI Business Consultant to generate your website, CRM, and digital presence in under 2 minutes.",
    continue: "Continue",
    chooseLanguage: "Choose your language",
    greeting: "Namaste",
    editInfo: "Edit Info",
    quickActions: "Quick Actions",
    upcomingFeatures: "Upcoming Features",
    setupPrompt: "You haven't set up your business yet!",
    startSetup: "Start AI Business Setup",
  },
  te: {
    dashboard: "డాష్‌బోర్ड",
    welcome: "స్వాగతం",
    website: "వెబ్‌సైట్",
    crm: "సీఆర్‌ఎమ్",
    whatsapp: "వాట్సాప్",
    insights: "విశ్లేషణలు",
    marketing: "మార్కెటింగ్",
    settings: "ಸೆಟ್ಟಿಂಗ್ಸ್",
    language: "భాష",
    comingSoon: "త్వరలో రాబోతోంది",
    activeProfile: "యాక్టివ్ ప్రొఫైల్",
    onboardingTitle: "AI ఆన్‌బోర్డింగ్ సెటಪ್",
    onboardingDesc: "మీ వెబ్‌సైట్, సీఆర్‌ఎమ్ మరియు డిజిటಲ್ ఉనికిని 2 నిమిషాల్లో రూపొందించడానికి మా AI వ్యాపార సలహాదారుతో మాట్లాడండి.",
    continue: "కొనసాగించు",
    chooseLanguage: "మీ భాషను ఎంచుకోండి",
    greeting: "నమస్తే",
    editInfo: "సవరించు",
    quickActions: "త్వరిత చర్యలు",
    upcomingFeatures: "రాబోయే ఫీచర్లు",
    setupPrompt: "మీరు ఇంకా మీ వ్యాపారాన్ని సెటప్ చేయలేదు!",
    startSetup: "AI వ్యాపార సెటప్‌ను ప్రారంభించండి",
  },
  hi: {
    dashboard: "डैशबोर्ड",
    welcome: "स्वागत है",
    website: "वेबसाइट",
    crm: "सीआरएम",
    whatsapp: "व्हाट्सएप",
    insights: "इनसाइट्स",
    marketing: "मार्केटिंग",
    settings: "सेटिंग्स",
    language: "भाषा",
    comingSoon: "जल्द ही आ रहा है",
    activeProfile: "सक्रिय प्रोफ़ाइल",
    onboardingTitle: "एआई ऑनबोर्डिंग सेटअप",
    onboardingDesc: "अपनी वेबसाइट, सीआरएम और डिजिटल उपस्थिति को 2 मिनट से कम समय में उत्पन्न करने के लिए हमारे एआई बिजनेस सलाहकार से बात करें।",
    continue: "आगे बढ़ें",
    chooseLanguage: "अपनी भाषा चुनें",
    greeting: "नमस्ते",
    editInfo: "जानकारी संपादित करें",
    quickActions: "त्वरित कार्रवाई",
    upcomingFeatures: "आगामी विशेषताएं",
    setupPrompt: "आपने अभी तक अपना व्यवसाय सेटअप नहीं किया है!",
    startSetup: "एआई व्यवसाय सेटअप शुरू करें",
  },
  ta: {
    dashboard: "டாஷ்போர்டு",
    welcome: "வரவேற்கிறோம்",
    website: "இணையதளம்",
    crm: "சிஆர்எம்",
    whatsapp: "வாட்ஸ்அப்",
    insights: "நுண்ணறிவுகள்",
    marketing: "மார்க்கெட்டிங்",
    settings: "அமைப்புகள்",
    language: "மொழி",
    comingSoon: "விரைவில் வருகிறது",
    activeProfile: "செயலில் உள்ள சுயவிவரம்",
    onboardingTitle: "AI ஆன்போர்டிங் அமைப்பு",
    onboardingDesc: "2 நிமிடங்களுக்குள் உங்கள் வலைத்தளம், CRM மற்றும் டிஜிட்டல் இருப்பை உருவாக்க எங்கள் AI வணிக ஆலோசகருடன் பேசுங்கள்.",
    continue: "தொடரவும்",
    chooseLanguage: "உங்கள் மொழியைத் தேர்ந்தெடுக்கவும்",
    greeting: "வணக்கம்",
    editInfo: "விவரங்களை திருத்து",
    quickActions: "விரைவான செயல்கள்",
    upcomingFeatures: "வரவிருக்கும் அம்சங்கள்",
    setupPrompt: "நீங்கள் இன்னும் உங்கள் வணிகத்தை அமைக்கவில்லை!",
    startSetup: "AI வணிக அமைப்பைத் தொடங்கவும்",
  },
  kn: {
    dashboard: "ಡ್ಯಾಶ್‌ಬೋರ್ಡ್",
    welcome: "ಸ್ವಾಗತ",
    website: "ವೆಬ್‌ಸೈಟ್",
    crm: "ಸಿಆರ್ಎಂ",
    whatsapp: "ವಾಟ್ಸಾಪ್",
    insights: "ಒಳನೋಟಗಳು",
    marketing: "ಮಾರ್ಕೆಟಿಂಗ್",
    settings: "ಸಂಯೋಜನೆಗಳು",
    language: "ಭಾಷೆ",
    comingSoon: "ಶೀಘ್ರದಲ್ಲೇ ಬರಲಿದೆ",
    activeProfile: "ಸಕ್ರಿಯ ಪ್ರೊಫೈಲ್",
    onboardingTitle: "AI ಆನ್‌ಬೋರ್ಡಿಂಗ್ ಸೆಟಪ್",
    onboardingDesc: "2 ನಿಮಿಷಗಳಿಗಿಂತ ಕಡಿಮೆ ಅವಧಿಯಲ್ಲಿ ನಿಮ್ಮ ವೆಬ್‌ಸೈಟ್, ಸಿಆರ್‌ಎಂ ಮತ್ತು ಡಿಜಿಟಲ್ ಉಪಸ್ಥಿತಿಯನ್ನು ರಚಿಸಲು ನಮ್ಮ AI ವ್ಯಾಪಾರ ಸಲಹೆಗಾರರೊಂದಿಗೆ ಮಾತನಾಡಿ.",
    continue: "ಮುಂದುವರಿಯಿರಿ",
    chooseLanguage: "ನಿಮ್ಮ ಭಾಷೆಯನ್ನು ಆರಿಸಿ",
    greeting: "ನಮಸ್ಕಾರ",
    editInfo: "ಮಾಹಿತಿ ಸಂಪಾದಿಸಿ",
    quickActions: "ತ್ವರಿತ ಕ್ರಿಯೆಗಳು",
    upcomingFeatures: "ಮುಂಬರುವ ವೈಶಿಷ್ಟ್ಯಗಳು",
    setupPrompt: "ನೀವು ಇನ್ನೂ ನಿಮ್ಮ ವ್ಯವಹಾರವನ್ನು ಸೆಟಪ್ ಮಾಡಿಲ್ಲ!",
    startSetup: "AI ವ್ಯವಹಾರ ಸೆಟಪ್ ಪ್ರಾರಂಭಿಸಿ",
  },
  mr: {
    dashboard: "डॅशबोर्ड",
    welcome: "स्वागत आहे",
    website: "वेबसाइट",
    crm: "सीआरएम",
    whatsapp: "व्हाट्सएप",
    insights: "इनसाइट्स",
    marketing: "मार्केटिंग",
    settings: "सेटिंग्ज",
    language: "भाषा",
    comingSoon: "लवकरच येत आहे",
    activeProfile: "ಸक्रिय प्रोफाइल",
    onboardingTitle: "AI ऑनबोर्डिंग सेटअप",
    onboardingDesc: "तुमची वेबसाइट, सीआरएम आणि डिजिटल उपस्थिती २ मिनिटांपेक्षा कमी वेळात तयार करण्यासाठी आमच्या एआय व्यवसाय सल्लागाराशी बोला.",
    continue: "पुढे जा",
    chooseLanguage: "तुमची भाषा निवडा",
    greeting: "नमस्ते",
    editInfo: "ಮಾಹಿತಿ ಸಂपादीत करा",
    quickActions: "त्वरित कृती",
    upcomingFeatures: "आगामी वैशिष्ट्ये",
    setupPrompt: "तुम्ही अद्याप तुमचा व्यवसाय सेट अप केला नाही!",
    startSetup: "AI व्यवसाय सेटअप सुरू करा",
  }
};

type TranslationKey = keyof typeof TRANSLATIONS.en;

function getCachedLang(): Language {
  try {
    const v = localStorage.getItem(LS_KEY);
    if (v === "en" || v === "te" || v === "hi" || v === "ta" || v === "kn" || v === "mr") return v;
  } catch {}
  return "en";
}

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => Promise<void>;
  loading: boolean;
  t: (key: TranslationKey) => string;
}

export const LanguageContext = createContext<LanguageContextType>({
  language: "en",
  setLanguage: async () => {},
  loading: false,
  t: (key) => TRANSLATIONS.en[key],
});

export function LanguageProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [language, setLanguageState] = useState<Language>(getCachedLang());
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) {
      setLanguageState("en");
      return;
    }

    const cached = localStorage.getItem(LS_KEY);
    if (cached === "en" || cached === "te" || cached === "hi" || cached === "ta" || cached === "kn" || cached === "mr") {
      setLanguageState(cached);
      return;
    }

    let cancelled = false;
    setLoading(true);
    
    // First try database preference backend, then fallback to Firebase Firestore doc
    fetch("http://localhost:5000/api/auth/language-preference", {
      headers: { "x-user-id": user.uid }
    })
      .then(res => res.json())
      .then(data => {
        if (cancelled) return;
        if (data.language) {
          setLanguageState(data.language);
          localStorage.setItem(LS_KEY, data.language);
          setLoading(false);
        } else {
          // Fallback to Firestore doc with timeout
          const getDocPromise = getDoc(doc(db, "users", user.uid));
          const timeoutPromise = new Promise<null>((resolve) => setTimeout(() => resolve(null), 1500));
          Promise.race([getDocPromise, timeoutPromise]).then((snap) => {
            if (cancelled) return;
            if (snap) {
              const lang = snap.data()?.language as Language | undefined;
              if (lang) {
                setLanguageState(lang);
                localStorage.setItem(LS_KEY, lang);
              }
            }
            setLoading(false);
          }).catch(() => {
            if (!cancelled) setLoading(false);
          });
        }
      })
      .catch(() => {
        setLoading(false);
      });

    return () => { cancelled = true; };
  }, [user]);

  const setLanguage = async (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem(LS_KEY, lang);
    if (user) {
      try {
        // Sync with Postgres Backend
        await fetch("http://localhost:5000/api/auth/language-preference", {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            "x-user-id": user.uid,
          },
          body: JSON.stringify({ language: lang })
        });
        
        // Sync with Firestore fallback
        await setDoc(doc(db, "users", user.uid), { language: lang }, { merge: true });
      } catch (err) {
        console.warn("Language Preference Sync Failed:", err);
      }
    }
  };

  const t = (key: TranslationKey): string => {
    const dict = TRANSLATIONS[language] || TRANSLATIONS.en;
    return dict[key] || TRANSLATIONS.en[key] || String(key);
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, loading, t }}>
      {children}
    </LanguageContext.Provider>
  );
}
