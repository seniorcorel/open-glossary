import { useEffect } from "react";
import { usePortal } from "../contexts/PortalContext";

interface Props {
  title?: string;
  description?: string;
  keywords?: string[];
  path?: string;
  type?: string;
}

export default function SEO({ title, description, keywords, path, type = "website" }: Props) {
  const { portal } = usePortal();

  useEffect(() => {
    const portalName = portal.name;
    const seo = portal.seo;

    // Title
    const pageTitle = title ? `${title} — ${portalName}` : seo?.title || portalName;
    document.title = pageTitle;

    // Description
    const desc = description || seo?.description || portal.theme?.tagline || `${portalName} — Collaborative multilingual glossary`;
    setMeta("description", desc);

    // Keywords
    const kw = keywords || seo?.keywords || getDefaultKeywords(portal);
    setMeta("keywords", kw.join(", "));

    // Open Graph
    setMeta("og:title", pageTitle, "property");
    setMeta("og:description", desc, "property");
    setMeta("og:type", type, "property");
    setMeta("og:site_name", portalName, "property");
    if (path) setMeta("og:url", `${window.location.origin}${path}`, "property");
    if (portal.theme?.logo) setMeta("og:image", portal.theme.logo, "property");

    // Twitter
    setMeta("twitter:card", "summary");
    setMeta("twitter:title", pageTitle);
    setMeta("twitter:description", desc);

    // Canonical
    if (path) {
      let link = document.querySelector("link[rel='canonical']") as HTMLLinkElement;
      if (!link) { link = document.createElement("link"); link.rel = "canonical"; document.head.appendChild(link); }
      link.href = `${window.location.origin}${path}`;
    }

    // JSON-LD structured data
    setJsonLd(portalName, desc, portal.theme?.logo);
  }, [title, description, keywords, path, portal]);

  return null;
}

function setMeta(name: string, content: string, attr: "name" | "property" = "name") {
  let el = document.querySelector(`meta[${attr}="${name}"]`) as HTMLMetaElement;
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, name);
    document.head.appendChild(el);
  }
  el.content = content;
}

function setJsonLd(name: string, description: string, logo?: string) {
  let script = document.querySelector("script[data-seo-jsonld]") as HTMLScriptElement;
  if (!script) {
    script = document.createElement("script");
    script.type = "application/ld+json";
    script.dataset.seoJsonld = "true";
    document.head.appendChild(script);
  }
  script.textContent = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "WebSite",
    name,
    description,
    url: window.location.origin,
    ...(logo ? { image: logo } : {}),
    potentialAction: {
      "@type": "SearchAction",
      target: `${window.location.origin}/?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  });
}

function getDefaultKeywords(portal: any): string[] {
  const base = ["glossary", "vocabulary", "language learning", "multilingual", "dictionary"];
  if (portal.id === "laboratorio-italiano" || portal.languages?.includes("it")) {
    return [...base, "italian", "italiano", "learn italian", "italian vocabulary", "italian words", "italian expressions", "italian idioms", "musica italiana", "glossario italiano", "parole italiane", "espressioni italiane"];
  }
  return [...base, "words", "expressions", "idioms", "slang", "proverbs", "translations"];
}
