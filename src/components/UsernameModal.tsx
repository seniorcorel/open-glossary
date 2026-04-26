import { useState, type FormEvent } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useLocale } from "../contexts/LocaleContext";

export default function UsernameModal() {
  const { user, updateUsername } = useAuth();
  const { t } = useLocale();
  const [value, setValue] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setSaving(true);
    const result = await updateUsername(value);
    setSaving(false);
    if (!result.ok) {
      if (result.error === "taken") setError(t("profile.taken"));
      else if (result.error === "min_length") setError(t("profile.too_short"));
      else if (result.error === "max_length") setError(t("profile.too_long"));
      else setError("Error");
    }
  }

  if (!user) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-ink/40 backdrop-blur-sm">
      <div className="bg-white rounded border border-sand/30 p-8 max-w-sm w-full mx-4 shadow-2xl animate-fade-in">
        <div className="text-center mb-6">
          {user.photoURL && <img src={user.photoURL} alt="" className="w-16 h-16 rounded-full mx-auto mb-4 ring-2 ring-sand" />}
          <h2 className="font-serif text-xl text-espresso">{t("profile.title")}</h2>
          <p className="text-stone text-sm mt-1">{t("profile.subtitle")}</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[11px] font-medium text-stone tracking-wide uppercase mb-1.5">{t("profile.username_label")}</label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone text-sm">@</span>
              <input
                value={value}
                onChange={(e) => { setValue(e.target.value.toLowerCase().replace(/[^a-z0-9._-]/g, "")); setError(""); }}
                placeholder="your.username"
                maxLength={24}
                className="w-full pl-8 pr-4 py-3 border border-sand/50 rounded text-sm bg-ivory focus:outline-none focus:ring-1 focus:ring-terracotta-light/40 focus:border-terracotta-light/40"
                autoFocus
              />
            </div>
            {error && <p className="text-xs text-burgundy mt-1.5">{error}</p>}
            <p className="text-[11px] text-stone mt-1.5">{t("profile.username_hint")}</p>
          </div>
          <button type="submit" disabled={saving || value.length < 3}
            className="w-full bg-espresso text-ivory py-3 rounded text-sm font-medium tracking-wide hover:bg-ink transition-all disabled:opacity-40">
            {saving ? t("profile.checking") : t("profile.save")}
          </button>
        </form>
      </div>
    </div>
  );
}
