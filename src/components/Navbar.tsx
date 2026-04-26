import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useLocale, UI_LOCALES } from "../contexts/LocaleContext";
import Flag from "./Flag";
import Logo from "./Logo";
import Icon from "./Icon";
import { useState, useEffect } from "react";

export default function Navbar() {
  const { user, profile, signInWithGoogle, logout, isModerator, isAdmin } = useAuth();
  const { locale, setLocale, t } = useLocale();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => { setMobileOpen(false); setUserMenuOpen(false); }, [location.pathname]);
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  const navLinks = [
    { to: "/", label: t("nav.explore"), icon: "globe", show: true },
    { to: "/favorites", label: t("nav.favorites"), icon: "heart", show: !!user },
    { to: "/new", label: t("nav.new"), icon: "plus", show: !!user },
    { to: "/moderate", label: t("nav.moderate"), icon: "shield", show: isModerator },
    { to: "/admin", label: t("nav.admin"), icon: "settings", show: isAdmin },
    { to: "/profile", label: t("nav.profile"), icon: "user", show: !!user },
  ].filter((l) => l.show);

  const isActive = (path: string) => location.pathname === path;

  return (
    <>
      <nav className="sticky top-0 z-50 backdrop-blur-xl bg-ivory/90 border-b border-sand/60">
        <div className="max-w-6xl mx-auto px-5 sm:px-8 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 shrink-0">
            <Logo size={30} />
            <span className="font-serif text-lg font-semibold text-espresso tracking-wide">
              Open Glossary
            </span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-6 mr-auto ml-12">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`text-[13px] tracking-wide uppercase transition-all border-b-2 pb-0.5 ${
                  isActive(link.to)
                    ? "text-espresso border-terracotta font-medium"
                    : "text-stone border-transparent hover:text-espresso hover:border-sand"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-3">
            {/* Locale */}
            <div className="hidden sm:flex items-center gap-0.5 border border-sand/60 rounded p-0.5">
              {UI_LOCALES.map((l) => (
                <button
                  key={l.code}
                  onClick={() => setLocale(l.code)}
                  className={`px-1.5 py-1 rounded-md transition-all flex items-center ${
                    locale === l.code ? "bg-cream shadow-sm" : "hover:bg-sand/30"
                  }`}
                  title={l.label}
                >
                  <Flag code={l.code} className="text-sm" />
                </button>
              ))}
            </div>

            {/* User — desktop */}
            {user ? (
              <div className="relative hidden md:block">
                <button onClick={() => setUserMenuOpen(!userMenuOpen)} className="flex items-center gap-2 hover:bg-cream rounded-full p-1 pr-3 transition-all">
                  <img src={user.photoURL ?? ""} alt="" className="w-8 h-8 rounded-full ring-1 ring-sand" />
                  <span className="text-sm text-walnut">{profile?.username ? `@${profile.username}` : user.displayName?.split(" ")[0]}</span>
                </button>
                {userMenuOpen && (
                  <>
                    <div className="fixed inset-0" onClick={() => setUserMenuOpen(false)} />
                    <div className="absolute right-0 mt-2 w-52 bg-white rounded shadow-lg border border-sand/40 py-1 z-50">
                      <div className="px-4 py-3 border-b border-sand/30">
                        <p className="text-sm font-medium text-espresso">{user.displayName}</p>
                        {profile?.username && <p className="text-xs text-terracotta">@{profile.username}</p>}
                        <p className="text-xs text-stone italic">{profile?.role}</p>
                      </div>
                      <Link to="/profile" onClick={() => setUserMenuOpen(false)} className="block px-4 py-2.5 text-sm text-walnut hover:bg-cream/60 transition-all">
                        {t("nav.profile")}
                      </Link>
                      <button onClick={() => { logout(); setUserMenuOpen(false); }} className="w-full text-left px-4 py-2.5 text-sm text-burgundy hover:bg-cream/60 transition-all">
                        {t("nav.sign_out")}
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <button onClick={signInWithGoogle} className="hidden md:block bg-espresso text-ivory px-5 py-2 rounded text-sm font-medium tracking-wide hover:bg-ink transition-all">
                {t("nav.sign_in")}
              </button>
            )}

            {/* Hamburger */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden w-10 h-10 flex items-center justify-center rounded hover:bg-cream transition-all"
              aria-label="Menu"
              aria-expanded={mobileOpen}
            >
              <Icon name={mobileOpen ? "close" : "menu"} size={22} className="text-espresso" />
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile panel */}
      {mobileOpen && (
        <div className="fixed inset-0 z-[60] md:hidden">
          <div className="absolute inset-0 bg-ink/30 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <div className="absolute right-0 top-0 h-full w-72 bg-ivory shadow-2xl flex flex-col animate-slide-in">
            <div className="flex items-center justify-between px-5 py-5 border-b border-sand/40">
              <div className="flex items-center gap-2.5">
                <Logo size={26} />
                <span className="font-serif font-semibold text-espresso">Open Glossary</span>
              </div>
              <button onClick={() => setMobileOpen(false)} className="w-8 h-8 flex items-center justify-center rounded hover:bg-cream" aria-label="Close">
                <Icon name="close" size={18} className="text-stone" />
              </button>
            </div>

            {user && (
              <div className="flex items-center gap-3 px-5 py-4 border-b border-sand/20 bg-cream/40">
                <img src={user.photoURL ?? ""} alt="" className="w-10 h-10 rounded-full ring-1 ring-sand" />
                <div className="min-w-0">
                  <p className="text-sm font-medium text-espresso truncate">{user.displayName}</p>
                  {profile?.username && <p className="text-xs text-terracotta">@{profile.username}</p>}
                  <p className="text-xs text-stone italic">{profile?.role}</p>
                </div>
              </div>
            )}

            <div className="flex-1 overflow-y-auto py-4">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-3 px-6 py-3 text-sm tracking-wide transition-all ${
                    isActive(link.to)
                      ? "text-espresso bg-cream/60 border-r-2 border-terracotta font-medium"
                      : "text-walnut hover:bg-cream/40 hover:text-espresso"
                  }`}
                >
                  <Icon name={link.icon} size={18} className={isActive(link.to) ? "text-terracotta" : "text-stone"} />
                  {link.label}
                </Link>
              ))}
            </div>

            <div className="px-5 py-3 border-t border-sand/30">
              <div className="flex flex-wrap gap-1.5">
                {UI_LOCALES.map((l) => (
                  <button
                    key={l.code}
                    onClick={() => setLocale(l.code)}
                    className={`px-2.5 py-1.5 rounded transition-all flex items-center gap-1.5 text-xs ${
                      locale === l.code ? "bg-espresso text-ivory" : "bg-cream text-walnut hover:bg-sand/40"
                    }`}
                  >
                    <Flag code={l.code} className="text-xs" /> {l.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="px-5 py-4 border-t border-sand/30">
              {user ? (
                <button onClick={() => { logout(); setMobileOpen(false); }} className="w-full py-2.5 rounded text-sm text-burgundy border border-burgundy/20 hover:bg-burgundy/5 transition-all">
                  {t("nav.sign_out")}
                </button>
              ) : (
                <button onClick={() => { signInWithGoogle(); setMobileOpen(false); }} className="w-full py-2.5 rounded text-sm text-ivory bg-espresso hover:bg-ink transition-all">
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
