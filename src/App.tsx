import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { LocaleProvider } from "./contexts/LocaleContext";
import Navbar from "./components/Navbar";
import HomePage from "./pages/HomePage";
import LanguagePage from "./pages/LanguagePage";
import FavoritesPage from "./pages/FavoritesPage";
import NewWordPage from "./pages/NewWordPage";
import ModeratePage from "./pages/ModeratePage";
import AdminPage from "./pages/AdminPage";

function AppContent() {
  const { loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-cloud">
        <div className="w-10 h-10 border-4 border-lavender border-t-teal rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-cloud via-white to-lavender/20">
      <Navbar />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/lang/:code" element={<LanguagePage />} />
        <Route path="/favorites" element={<FavoritesPage />} />
        <Route path="/new" element={<NewWordPage />} />
        <Route path="/moderate" element={<ModeratePage />} />
        <Route path="/admin" element={<AdminPage />} />
      </Routes>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <LocaleProvider>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </LocaleProvider>
    </BrowserRouter>
  );
}
