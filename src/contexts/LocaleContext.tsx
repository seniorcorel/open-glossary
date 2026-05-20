import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from "react";
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

interface Props {
  children: ReactNode;
  forcedLocale?: string;
}

export function LocaleProvider({ children, forcedLocale }: Props) {
  const [locale, setLocaleState] = useState<UILocale>(() => {
    // If a forced locale is provided (single-language portal), use it
    if (forcedLocale && translations[forcedLocale as UILocale]) return forcedLocale as UILocale;
    return detectLocale();
  });

  // React to forcedLocale changes (after portal loads)
  useEffect(() => {
    if (forcedLocale && translations[forcedLocale as UILocale]) {
      setLocaleState(forcedLocale as UILocale);
    }
  }, [forcedLocale]);

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
