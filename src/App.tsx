import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { LocaleProvider } from "./contexts/LocaleContext";
import { PortalProvider, usePortal } from "./contexts/PortalContext";
import Navbar from "./components/Navbar";
import UsernameModal from "./components/UsernameModal";
import HomePage from "./pages/HomePage";
import LanguagePage from "./pages/LanguagePage";
import FavoritesPage from "./pages/FavoritesPage";
import NewWordPage from "./pages/NewWordPage";
import ModeratePage from "./pages/ModeratePage";
import AdminPage from "./pages/AdminPage";
import ProfilePage from "./pages/ProfilePage";
import WordDetailPage from "./pages/WordDetailPage";

function AppContent() {
  const { loading: authLoading, needsUsername } = useAuth();

  if (authLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-ivory">
        <div className="w-8 h-8 border-2 border-sand border-t-terracotta rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-ivory">
      <Navbar />
      {needsUsername && <UsernameModal />}
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/lang/:code" element={<LanguagePage />} />
        <Route path="/:lang/:slug" element={<WordDetailPage />} />
        <Route path="/favorites" element={<FavoritesPage />} />
        <Route path="/new" element={<NewWordPage />} />
        <Route path="/moderate" element={<ModeratePage />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/profile" element={<ProfilePage />} />
      </Routes>
    </div>
  );
}

/** Bridges PortalContext → LocaleProvider with forced locale for single-language portals */
function LocaleBridge({ children }: { children: React.ReactNode }) {
  const { portal, loading } = usePortal();

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-ivory">
        <div className="w-8 h-8 border-2 border-sand border-t-terracotta rounded-full animate-spin" />
      </div>
    );
  }

  // Force locale if portal has exactly one language
  const forcedLocale = portal.languages.length === 1 ? portal.languages[0] : undefined;

  return (
    <LocaleProvider forcedLocale={forcedLocale}>
      {children}
    </LocaleProvider>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <PortalProvider>
        <LocaleBridge>
          <AuthProvider>
            <AppContent />
          </AuthProvider>
        </LocaleBridge>
      </PortalProvider>
    </BrowserRouter>
  );
}
