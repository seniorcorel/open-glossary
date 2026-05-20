import { useState, useEffect, type FormEvent } from "react";
import { collection, query, where, getDocs, doc, updateDoc, arrayUnion, arrayRemove } from "firebase/firestore";
import { db } from "../lib/firebase";
import { useAuth } from "../contexts/AuthContext";
import { useLocale } from "../contexts/LocaleContext";
import { LANGUAGES } from "../types";
import Flag from "../components/Flag";
import Icon from "../components/Icon";

export default function ProfilePage() {
  const { user, profile } = useAuth();
  const { t } = useLocale();
  const [username, setUsername] = useState(profile?.username ?? "");
  const [checking, setChecking] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (profile?.username) setUsername(profile.username);
  }, [profile?.username]);

  async function checkAvailability(name: string): Promise<boolean> {
    if (!name || name.length < 3) return false;
    const q = query(collection(db, "users"), where("username", "==", name.toLowerCase()));
    const snap = await getDocs(q);
    // If the only match is the current user, it's available
    return snap.empty || (snap.size === 1 && snap.docs[0].id === user?.uid);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!user) return;
    const clean = username.trim().toLowerCase().replace(/[^a-z0-9._-]/g, "");
    if (clean.length < 3) { setError(t("profile.too_short")); return; }
    if (clean.length > 24) { setError(t("profile.too_long")); return; }

    setChecking(true);
    setError("");
    const available = await checkAvailability(clean);
    setChecking(false);

    if (!available) { setError(t("profile.taken")); return; }

    setSaving(true);
    await updateDoc(doc(db, "users", user.uid), { username: clean });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  if (!user) return (
    <div className="max-w-xl mx-auto px-5 py-24 text-center">
      <Icon name="user" size={48} className="mx-auto text-sand mb-4" />
      <p className="text-walnut text-lg font-serif">{t("profile.login_required")}</p>
    </div>
  );

  const ic = "w-full border border-sand/50 rounded px-4 py-3 text-sm bg-white focus:outline-none focus:ring-1 focus:ring-terracotta-light/40 focus:border-terracotta-light/40 transition-all";

  return (
    <div className="max-w-lg mx-auto px-5 sm:px-8 py-12">
      <h1 className="font-serif text-3xl font-semibold text-ink mb-2">{t("profile.title")}</h1>
      <p className="text-stone mb-10">{t("profile.subtitle")}</p>

      <div className="flex items-center gap-4 mb-8 p-5 bg-white border border-sand/40 rounded">
        <img src={user.photoURL ?? ""} alt="" className="w-14 h-14 rounded-full ring-1 ring-sand" />
        <div>
          <p className="font-medium text-espresso">{profile?.displayName}</p>
          <p className="text-xs text-stone">{user.email}</p>
          {profile?.username && (
            <p className="text-xs text-terracotta mt-0.5">@{profile.username}</p>
          )}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-[11px] font-medium text-stone tracking-wide uppercase mb-2">
            {t("profile.username_label")}
          </label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-stone text-sm">@</span>
            <input
              value={username}
              onChange={(e) => { setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9._-]/g, "")); setError(""); setSaved(false); }}
              className={`${ic} pl-8`}
              placeholder="your.username"
              maxLength={24}
            />
          </div>
          <p className="text-[11px] text-stone mt-1.5">{t("profile.username_hint")}</p>
          {error && <p className="text-[11px] text-reject mt-1">{error}</p>}
          {saved && <p className="text-[11px] text-approve mt-1">{t("profile.saved")}</p>}
        </div>
        <button type="submit" disabled={checking || saving || username.length < 3}
          className="bg-espresso text-ivory px-6 py-2.5 rounded text-sm font-medium tracking-wide hover:bg-ink transition-all disabled:opacity-40">
          {checking ? t("profile.checking") : saving ? "..." : t("profile.save")}
        </button>
      </form>

      {/* Moderator language selection */}
      {(profile?.role === "moderator" || profile?.role === "admin") && (
        <div className="mt-12 pt-8 border-t border-sand/40">
          <h2 className="font-serif text-xl text-espresso mb-2">{t("profile.mod_languages_title")}</h2>
          <p className="text-stone text-sm mb-6">{t("profile.mod_languages_subtitle")}</p>
          <div className="flex flex-wrap gap-2">
            {LANGUAGES.map((l) => {
              const active = (profile?.moderatorLanguages ?? []).includes(l.code);
              return (
                <button
                  key={l.code}
                  onClick={async () => {
                    if (!user) return;
                    const ref = doc(db, "users", user.uid);
                    if (active) await updateDoc(ref, { moderatorLanguages: arrayRemove(l.code) });
                    else await updateDoc(ref, { moderatorLanguages: arrayUnion(l.code) });
                  }}
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded text-sm tracking-wide transition-all border ${
                    active ? "bg-espresso text-ivory border-espresso" : "bg-white text-walnut border-sand/40 hover:border-warm-gray"
                  }`}
                >
                  <Flag code={l.code} className="text-sm" /> {l.name}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
