import { createContext, useContext, useState, useCallback, type ReactNode } from "react";
import type { UILocale } from "../types";
import translations from "../i18n/translations";

interface LocaleContextType {
  locale: UILocale;
  setLocale: (l: UILocale) => void;
  t: (key: string) => string;
}

const LocaleContext = createContext<LocaleContextType>(null!);

export function useLocale() {
  return useContext(LocaleContext);
}

const UI_LOCALES: { code: UILocale; label: string }[] = [
  { code: "en", label: "EN" },
  { code: "es", label: "ES" },
  { code: "it", label: "IT" },
  { code: "fr", label: "FR" },
  { code: "pt", label: "PT" },
];

export { UI_LOCALES };

function detectLocale(): UILocale {
  const saved = localStorage.getItem("og_locale") as UILocale | null;
  if (saved && translations[saved]) return saved;
  const browser = navigator.language.slice(0, 2) as UILocale;
  if (translations[browser]) return browser;
  return "en";
}

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<UILocale>(detectLocale);

  const setLocale = useCallback((l: UILocale) => {
    setLocaleState(l);
    localStorage.setItem("og_locale", l);
  }, []);

  const t = useCallback(
    (key: string) => translations[locale]?.[key] ?? translations.en[key] ?? key,
    [locale]
  );

  return (
    <LocaleContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </LocaleContext.Provider>
  );
}
