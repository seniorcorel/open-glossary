import { usePortal } from "../contexts/PortalContext";
import Icon from "./Icon";

const APP_VERSION = "1.1.0";

export default function Footer() {
  const { portal } = usePortal();
  const footer = portal.footer;
  const theme = portal.theme;

  return (
    <footer className="border-t border-sand/40 mt-16">
      {/* Quote */}
      {theme?.quote && (
        <div className="py-12 text-center max-w-6xl mx-auto px-5">
          <blockquote className="font-serif text-lg sm:text-xl italic text-walnut/70 max-w-lg mx-auto leading-relaxed">
            {theme.quote}
          </blockquote>
          {theme.quoteAuthor && (
            <p className="text-[11px] text-stone tracking-widest uppercase mt-4">— {theme.quoteAuthor}</p>
          )}
        </div>
      )}

      {/* Footer bar */}
      <div className="border-t border-sand/30 py-8 max-w-6xl mx-auto px-5">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Copyright + website */}
          <div className="text-center sm:text-left">
            {footer?.copyright && (
              <p className="text-[11px] text-stone tracking-wide">{footer.copyright}</p>
            )}
            {footer?.website && (
              <a href={footer.website} target="_blank" rel="noopener noreferrer" className="text-[11px] text-stone hover:text-terracotta transition-colors">
                {footer.website.replace(/^https?:\/\//, "")}
              </a>
            )}
            {!footer?.copyright && (
              <p className="text-[11px] text-stone tracking-wide">Open Glossary — {new Date().getFullYear()}</p>
            )}
            {portal.id !== "default" && (
              <p className="text-[10px] text-stone/60 mt-1">
                Powered by <a href="https://open-glossary.com" target="_blank" rel="noopener noreferrer" className="hover:text-terracotta transition-colors underline">Open Glossary</a> · v{APP_VERSION}
              </p>
            )}
            {portal.id === "default" && (
              <p className="text-[10px] text-stone/60 mt-1">v{APP_VERSION}</p>
            )}
          </div>

          {/* Social links */}
          {footer?.social && (
            <div className="flex items-center gap-3">
              {footer.social.facebook && (
                <a href={footer.social.facebook} target="_blank" rel="noopener noreferrer" className="w-8 h-8 flex items-center justify-center rounded bg-cream hover:bg-sand/40 text-stone hover:text-espresso transition-all" title="Facebook">
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z"/></svg>
                </a>
              )}
              {footer.social.instagram && (
                <a href={footer.social.instagram} target="_blank" rel="noopener noreferrer" className="w-8 h-8 flex items-center justify-center rounded bg-cream hover:bg-sand/40 text-stone hover:text-espresso transition-all" title="Instagram">
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5"/><path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
                </a>
              )}
              {footer.social.blog && (
                <a href={footer.social.blog} target="_blank" rel="noopener noreferrer" className="w-8 h-8 flex items-center justify-center rounded bg-cream hover:bg-sand/40 text-stone hover:text-espresso transition-all" title="Blog">
                  <Icon name="book" size={16} />
                </a>
              )}
              {footer.social.youtube && (
                <a href={footer.social.youtube} target="_blank" rel="noopener noreferrer" className="w-8 h-8 flex items-center justify-center rounded bg-cream hover:bg-sand/40 text-stone hover:text-espresso transition-all" title="YouTube">
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M22.54 6.42a2.78 2.78 0 00-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 00-1.94 2A29 29 0 001 11.75a29 29 0 00.46 5.33A2.78 2.78 0 003.4 19.1c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 001.94-2 29 29 0 00.46-5.25 29 29 0 00-.46-5.33z"/><polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02" fill="white"/></svg>
                </a>
              )}
            </div>
          )}
        </div>
      </div>
    </footer>
  );
}
