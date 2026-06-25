"use client";

import { useLanguage } from "@/components/providers/LanguageProvider";
import { Button } from "@/components/ui/button";
import { Globe } from "lucide-react";

export function LanguageToggle() {
  const { language, setLanguage } = useLanguage();

  return (
    <Button
      variant="ghost"
      size="sm"
      className="h-9 px-3 gap-1.5 rounded-full text-muted-foreground hover:text-foreground transition-colors font-semibold text-xs"
      onClick={() => setLanguage(language === "en" ? "vi" : "en")}
      title={language === "en" ? "Chuyển sang Tiếng Việt" : "Switch to English"}
      id="language-toggle-btn"
    >
      <Globe className="h-[1rem] w-[1rem] text-primary" />
      <span>{language === "en" ? "EN" : "VI"}</span>
    </Button>
  );
}
