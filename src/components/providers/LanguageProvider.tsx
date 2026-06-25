"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { translations } from "@/lib/translations";

type Language = "en" | "vi";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>("vi"); // Default to 'vi'
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("language");
    if (saved === "vi" || saved === "en") {
      setLanguageState(saved);
    } else {
      const browserLang = navigator.language.startsWith("vi") ? "vi" : "en";
      setLanguageState(browserLang);
      localStorage.setItem("language", browserLang);
    }
    setMounted(true);
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem("language", lang);
  };

  const t = (path: string, params?: Record<string, string | number>): string => {
    const keys = path.split(".");
    
    // Attempt lookup in chosen language
    let current: any = translations[language];
    for (const key of keys) {
      if (current === undefined || current === null) {
        current = null;
        break;
      }
      current = current[key];
    }

    // Fallback to English if translation is missing
    if (typeof current !== "string") {
      current = translations["en"];
      for (const key of keys) {
        if (current === undefined || current === null) {
          current = null;
          break;
        }
        current = current[key];
      }
    }

    // Return the path string if lookup completely fails
    if (typeof current !== "string") {
      return path;
    }

    // Replace parameter placeholders e.g., {total}
    let result = current;
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        result = result.replace(new RegExp(`{${key}}`, "g"), String(value));
      });
    }

    return result;
  };

  // Prevent layout shifts / hydration mismatch by keeping children hidden or loading until mounted
  if (!mounted) {
    return (
      <LanguageContext.Provider value={{ language, setLanguage, t: (k) => k }}>
        <div className="opacity-0">{children}</div>
      </LanguageContext.Provider>
    );
  }

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
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
