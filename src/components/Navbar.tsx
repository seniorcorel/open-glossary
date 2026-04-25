import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useLocale, UI_LOCALES } from "../contexts/LocaleContext";
import Flag from "./Flag";
import Logo from "./Logo";
import { useState, useEffect } from "react";

export default function Navbar() {
  const { user, profile, signInWithGoogle, logout, isModerator, isAdmin } = useAuth();
  const { locale, setLocale, t } = useLocale();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const location = useLocation();

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false);
    setUserMenuOpen(false);
  }, [location.pathname]);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  const navLinks = [
    { to: "/", label: t("nav.explore"), icon: "🌍", show: true },
    { to: "/favorites", label: t("nav.favorites"), icon: "❤️", show: !!user },
    { to: "/new", label: t("nav.new"), icon: "✍️", show: !!user },
    { to: "/moderate", label: t("nav.moderate"), icon: "🛡️", show: isModerator },
    { to: "/admin", label: t("nav.admin"), icon: "⚙️", show: isAdmin },
  ].filter((l) => l.show);

  const isActive = (path: string) => location.pathname === path;

  return (
    <>
      <nav className="sticky top-0 z-50 backdrop-blur-xl bg-cloud/80 border-b border-soft-gray/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 shrink-0">
            <Logo size={32} />
            <span className="text-lg font-bold bg-gradient-to-r from-teal to-teal-light bg-clip-text text-transparent hidden xs:inline">
              Open Glossary
            </span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1 mr-auto ml-8">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`px-3 py-1.5 text-sm rounded-lg transition-all ${
                  isActive(link.to)
                    ? "text-teal bg-lavender/30 font-medium"
                    : "text-charcoal/60 hover:text-teal hover:bg-lavender/20"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right side */}
          <div className="flex items-center gap-2">
            {/* Locale switcher - compact on mobile */}
            <div className="hidden sm:flex items-center bg-soft-gray/30 rounded-lg p-0.5">
              {UI_LOCALES.map((l) => (
                <button
                  key={l.code}
                  onClick={() => setLocale(l.code)}
                  className={`px-1.5 py-1 rounded-md transition-all flex items-center ${
                    locale === l.code ? "bg-white shadow-sm" : "hover:bg-soft-gray/50"
                  }`}
                  title={l.label}
                >
                  <Flag code={l.code} className="text-sm" />
                </button>
              ))}
            </div>

            {/* User avatar / Sign in - desktop */}
            {user ? (
              <div className="relative hidden md:block">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 hover:bg-lavender/20 rounded-full p-1 pr-3 transition-all"
                >
                  <img src={user.photoURL ?? ""} alt="" className="w-8 h-8 rounded-full ring-2 ring-lavender" />
                  <span className="text-sm text-charcoal">{user.displayName?.split(" ")[0]}</span>
                </button>
                {userMenuOpen && (
                  <>
                    <div className="fixed inset-0" onClick={() => setUserMenuOpen(false)} />
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-soft-gray/40 py-1 z-50">
                      <div className="px-4 py-2 border-b border-soft-gray/30">
                        <p className="text-sm font-medium text-charcoal">{user.displayName}</p>
                        <p className="text-xs text-charcoal/40">{profile?.role}</p>
                      </div>
                      <button
                        onClick={() => { logout(); setUserMenuOpen(false); }}
                        className="w-full text-left px-4 py-2 text-sm text-coral hover:bg-coral/5"
                      >
                        {t("nav.sign_out")}
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <button
                onClick={signInWithGoogle}
                className="hidden md:block bg-gradient-to-r from-teal to-teal-light text-white px-4 py-2 rounded-xl text-sm font-medium hover:shadow-lg hover:shadow-teal/20 transition-all active:scale-95"
              >
                {t("nav.sign_in")}
              </button>
            )}

            {/* Hamburger button - mobile only */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden flex flex-col items-center justify-center w-10 h-10 rounded-xl hover:bg-lavender/20 transition-all"
              aria-label="Toggle menu"
              aria-expanded={mobileOpen}
            >
              <span className={`block w-5 h-0.5 bg-charcoal rounded-full transition-all duration-300 ${mobileOpen ? "rotate-45 translate-y-[3px]" : ""}`} />
              <span className={`block w-5 h-0.5 bg-charcoal rounded-full transition-all duration-300 mt-1 ${mobileOpen ? "opacity-0" : ""}`} />
              <span className={`block w-5 h-0.5 bg-charcoal rounded-full transition-all duration-300 mt-1 ${mobileOpen ? "-rotate-45 -translate-y-[7px]" : ""}`} />
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile slide-over menu */}
      {mobileOpen && (
        <div className="fixed inset-0 z-[60] md:hidden">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-charcoal/40 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />

          {/* Panel */}
          <div className="absolute right-0 top-0 h-full w-72 bg-white shadow-2xl flex flex-col animate-slide-in">
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-soft-gray/30">
              <div className="flex items-center gap-2">
                <Logo size={28} />
                <span className="font-bold text-teal">Open Glossary</span>
              </div>
              <button
                onClick={() => setMobileOpen(false)}
                className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-lavender/20 transition-all"
                aria-label="Close menu"
              >
                <span className="text-charcoal/60 text-lg">✕</span>
              </button>
            </div>

            {/* User info */}
            {user && (
              <div className="flex items-center gap-3 px-5 py-4 border-b border-soft-gray/20 bg-lavender/10">
                <img src={user.photoURL ?? ""} alt="" className="w-10 h-10 rounded-full ring-2 ring-lavender" />
                <div className="min-w-0">
                  <p className="text-sm font-medium text-charcoal truncate">{user.displayName}</p>
                  <p className="text-xs text-charcoal/40">{profile?.role}</p>
                </div>
              </div>
            )}

            {/* Nav links */}
            <div className="flex-1 overflow-y-auto py-3">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-3 px-5 py-3 text-sm transition-all ${
                    isActive(link.to)
                      ? "text-teal bg-lavender/20 font-medium border-r-2 border-teal"
                      : "text-charcoal/70 hover:bg-lavender/10 hover:text-teal"
                  }`}
                >
                  <span className="text-base">{link.icon}</span>
                  {link.label}
                </Link>
              ))}
            </div>

            {/* Locale switcher */}
            <div className="px-5 py-3 border-t border-soft-gray/20">
              <p className="text-xs text-charcoal/40 mb-2">🌐 {t("nav.language") || "Language"}</p>
              <div className="flex flex-wrap gap-1.5">
                {UI_LOCALES.map((l) => (
                  <button
                    key={l.code}
                    onClick={() => setLocale(l.code)}
                    className={`px-2.5 py-1.5 rounded-lg transition-all flex items-center gap-1.5 text-xs ${
                      locale === l.code
                        ? "bg-teal text-white shadow-sm"
                        : "bg-cloud text-charcoal/60 hover:bg-soft-gray/30"
                    }`}
                  >
                    <Flag code={l.code} className="text-xs" />
                    {l.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Sign in / Sign out */}
            <div className="px-5 py-4 border-t border-soft-gray/20">
              {user ? (
                <button
                  onClick={() => { logout(); setMobileOpen(false); }}
                  className="w-full py-2.5 rounded-xl text-sm font-medium text-coral border border-coral/20 hover:bg-coral/5 transition-all"
                >
                  {t("nav.sign_out")}
                </button>
              ) : (
                <button
                  onClick={() => { signInWithGoogle(); setMobileOpen(false); }}
                  className="w-full py-2.5 rounded-xl text-sm font-medium text-white bg-gradient-to-r from-teal to-teal-light hover:shadow-lg transition-all"
                >
                  {t("nav.sign_in")}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
