"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";

// Import translation files
import enTranslations from "../locales/en.json";
import teTranslations from "../locales/te.json";

export type Language = "en" | "te";
export type TranslationKey = string;

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  isRTL: boolean;
}

const translations = {
  en: enTranslations,
  te: teTranslations,
};

const LanguageContext = createContext<LanguageContextType | undefined>(
  undefined
);

interface LanguageProviderProps {
  children: ReactNode;
}

export function LanguageProvider({ children }: LanguageProviderProps) {
  const [language, setLanguageState] = useState<Language>("en");

  // Load saved language from localStorage on mount
  useEffect(() => {
    const savedLanguage = localStorage.getItem("language") as Language;
    if (savedLanguage && ["en", "te"].includes(savedLanguage)) {
      setLanguageState(savedLanguage);
    }
  }, []);

  // Save language to localStorage when it changes
  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem("language", lang);

    // Update document direction for RTL languages
    document.documentElement.dir = lang === "te" ? "ltr" : "ltr"; // Telugu uses LTR
    document.documentElement.lang = lang === "te" ? "te" : "en";
  };

  // Translation function with nested key support
  const t = (key: string): string => {
    const keys = key.split(".");
    let value: any = translations[language];

    for (const k of keys) {
      if (value && typeof value === "object" && k in value) {
        value = value[k];
      } else {
        // Fallback to English if key not found
        value = translations.en;
        for (const k of keys) {
          if (value && typeof value === "object" && k in value) {
            value = value[k];
          } else {
            console.warn(`Translation key not found: ${key}`);
            return key; // Return the key itself as fallback
          }
        }
        break;
      }
    }

    return typeof value === "string" ? value : key;
  };

  const isRTL = false; // Telugu is LTR, but we keep this for future RTL language support

  const value: LanguageContextType = {
    language,
    setLanguage,
    t,
    isRTL,
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}

// Hook for easier translation access
export function useTranslation() {
  const { t } = useLanguage();
  return { t };
}

// Language configuration
export const LANGUAGES = [
  {
    code: "en" as const,
    name: "English",
    nativeName: "English",
    flag: "🇺🇸",
  },
  {
    code: "te" as const,
    name: "Telugu",
    nativeName: "తెలుగు",
    flag: "🇮🇳",
  },
] as const;
