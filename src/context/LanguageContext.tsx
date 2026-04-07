/* eslint-disable @typescript-eslint/no-explicit-any */
import { createContext, useContext, useState, useEffect } from "react";
import en from "@/locales/en.json";
import kn from "@/locales/kn.json";
import hi from "@/locales/hi.json";
import ml from "@/locales/ml.json";

type Lang = "en" | "kn" | "hi" | "ml";

const translations: Record<Lang, any> = { en, kn, hi, ml };

const LanguageContext = createContext<any>(null);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>("en");

  // Load persisted lang on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem("tf_lang") as Lang | null;
      if (saved && translations[saved]) {
        setLangState(saved);
      }
    } catch { }
  }, []);

  // Persist to localStorage whenever lang changes
  const setLang = (l: string) => {
    if (translations[l as Lang]) {
      setLangState(l as Lang);
      try {
        localStorage.setItem("tf_lang", l);
      } catch { }
    }
  };

  /**
   * t function that supports nested keys like "nav.home"
   * and falls back to English if key is missing in current language.
   */
  const t = (key: string) => {
    if (!key) return "";
    const keys = key.split(".");
    
    // 1. Try with current language
    let current: any = translations[lang];
    for (const k of keys) {
      if (current && current[k] !== undefined) {
        current = current[k];
      } else {
        current = undefined;
        break;
      }
    }

    if (current !== undefined && typeof current === "string") return current;

    // 2. Fallback to English
    if (lang !== "en") {
      let english: any = translations["en"];
      for (const k of keys) {
        if (english && english[k] !== undefined) {
          english = english[k];
        } else {
          english = undefined;
          break;
        }
      }
      if (english !== undefined && typeof english === "string") return english;
    }

    // 3. Last fallback: return the key itself or the last part of the key
    return keys[keys.length - 1];
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
