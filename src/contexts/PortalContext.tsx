import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { collection, query, where, getDocs, doc, getDoc } from "firebase/firestore";
import { db } from "../lib/firebase";
import type { Portal } from "../types";

interface PortalContextType {
  portal: Portal;
  loading: boolean;
  isFiltered: boolean;
}

const DEFAULT_PORTAL: Portal = {
  id: "default",
  slug: "default",
  name: "Open Glossary",
  languages: [],
  defaultLanguage: "it",
  theme: {
    quote: "«I limiti del mio linguaggio significano i limiti del mio mondo.»",
    quoteAuthor: "Ludwig Wittgenstein",
  },
  createdBy: "system",
  createdAt: null,
};

const PortalContext = createContext<PortalContextType>({ portal: DEFAULT_PORTAL, loading: true, isFiltered: false });

export function usePortal() {
  return useContext(PortalContext);
}

function applyTheme(theme: Portal["theme"]) {
  if (!theme) return;
  const root = document.documentElement;
  if (theme.bg) root.style.setProperty("--portal-bg", theme.bg);
  if (theme.bgSoft) root.style.setProperty("--portal-bg-soft", theme.bgSoft);
  if (theme.line) root.style.setProperty("--portal-line", theme.line);
  if (theme.muted) root.style.setProperty("--portal-muted", theme.muted);
  if (theme.text) root.style.setProperty("--portal-text", theme.text);
  if (theme.textStrong) root.style.setProperty("--portal-text-strong", theme.textStrong);
  if (theme.accent) root.style.setProperty("--portal-accent", theme.accent);
  if (theme.accentSoft) root.style.setProperty("--portal-accent-soft", theme.accentSoft);
  if (theme.fontDisplay) root.style.setProperty("--portal-font-display", theme.fontDisplay);
  if (theme.fontBody) root.style.setProperty("--portal-font-body", theme.fontBody);

  // Override Tailwind theme colors via CSS variables
  if (theme.bg) root.style.setProperty("--color-ivory", theme.bg);
  if (theme.bgSoft) root.style.setProperty("--color-cream", theme.bgSoft);
  if (theme.line) root.style.setProperty("--color-sand", theme.line);
  if (theme.muted) { root.style.setProperty("--color-stone", theme.muted); root.style.setProperty("--color-warm-gray", theme.muted); }
  if (theme.text) root.style.setProperty("--color-walnut", theme.text);
  if (theme.textStrong) { root.style.setProperty("--color-espresso", theme.textStrong); root.style.setProperty("--color-ink", theme.textStrong); }
  if (theme.accent) root.style.setProperty("--color-terracotta", theme.accent);
  if (theme.accentSoft) root.style.setProperty("--color-terracotta-light", theme.accentSoft);
  if (theme.line) root.style.setProperty("--color-sand", theme.line);

  // Apply to body
  if (theme.bg) document.body.style.backgroundColor = theme.bg;
  if (theme.text) document.body.style.color = theme.text;
  if (theme.fontBody) document.body.style.fontFamily = theme.fontBody;
  if (theme.fontDisplay) {
    document.querySelectorAll("h1, h2, h3").forEach((el) => {
      (el as HTMLElement).style.fontFamily = theme.fontDisplay!;
    });
  }

  // Load custom Google Fonts if needed
  const fonts: string[] = [];
  if (theme.fontDisplay?.includes("Cormorant")) fonts.push("Cormorant+Garamond:ital,wght@0,400;0,500;0,600;0,700;1,400");
  if (theme.fontDisplay?.includes("EB Garamond")) fonts.push("EB+Garamond:ital,wght@0,400;0,500;0,600;1,400");
  if (theme.fontBody?.includes("Work Sans")) fonts.push("Work+Sans:wght@300;400;500;600");
  if (fonts.length > 0) {
    const existing = document.querySelector("link[data-portal-fonts]");
    if (existing) existing.remove();
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.dataset.portalFonts = "true";
    link.href = `https://fonts.googleapis.com/css2?${fonts.map(f => `family=${f}`).join("&")}&display=swap`;
    document.head.appendChild(link);
  }
}

async function detectPortal(): Promise<Portal> {
  const hostname = window.location.hostname;

  if (hostname === "localhost" || hostname === "open-glossary.web.app" || hostname === "open-glossary.com" || hostname === "www.open-glossary.com") {
    const snap = await getDoc(doc(db, "portals", "default"));
    if (snap.exists()) return { id: snap.id, ...snap.data() } as Portal;
    return DEFAULT_PORTAL;
  }

  // Custom domain lookup
  const q = query(collection(db, "portals"), where("domain", "==", hostname));
  const snap = await getDocs(q);
  if (!snap.empty) {
    const d = snap.docs[0];
    return { id: d.id, ...d.data() } as Portal;
  }

  // Subdomain pattern
  const parts = hostname.split(".");
  if (parts.length >= 3) {
    const slug = parts[0];
    const q2 = query(collection(db, "portals"), where("slug", "==", slug));
    const snap2 = await getDocs(q2);
    if (!snap2.empty) {
      const d = snap2.docs[0];
      return { id: d.id, ...d.data() } as Portal;
    }
  }

  return DEFAULT_PORTAL;
}

export function PortalProvider({ children }: { children: ReactNode }) {
  const [portal, setPortal] = useState<Portal>(DEFAULT_PORTAL);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    detectPortal().then((p) => {
      setPortal(p);
      applyTheme(p.theme);
      setLoading(false);
    }).catch(() => {
      setPortal(DEFAULT_PORTAL);
      setLoading(false);
    });
  }, []);

  const isFiltered = portal.languages.length > 0;

  return (
    <PortalContext.Provider value={{ portal, loading, isFiltered }}>
      {children}
    </PortalContext.Provider>
  );
}
