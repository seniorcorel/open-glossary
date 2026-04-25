import { useEffect, useState } from "react";
import { collection, onSnapshot, doc, updateDoc } from "firebase/firestore";
import { db } from "../lib/firebase";
import { useAuth } from "../contexts/AuthContext";
import { useLocale } from "../contexts/LocaleContext";
import type { UserProfile, UserRole } from "../types";
import { LANGUAGES } from "../types";
import Flag from "../components/Flag";

export default function AdminPage() {
  const { isAdmin } = useAuth();
  const { t } = useLocale();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [editingLangs, setEditingLangs] = useState<string | null>(null);

  useEffect(() => {
    if (!isAdmin) return;
    const unsub = onSnapshot(collection(db, "users"), (snap) => {
      setUsers(snap.docs.map((d) => d.data() as UserProfile));
      setLoading(false);
    });
    return unsub;
  }, [isAdmin]);

  async function changeRole(uid: string, role: UserRole) {
    await updateDoc(doc(db, "users", uid), { role });
  }

  async function toggleModeratorLang(uid: string, langCode: string, currentLangs: string[]) {
    const newLangs = currentLangs.includes(langCode)
      ? currentLangs.filter((l) => l !== langCode)
      : [...currentLangs, langCode];
    await updateDoc(doc(db, "users", uid), { moderatorLanguages: newLangs });
  }

  if (!isAdmin) {
    return <div className="max-w-xl mx-auto px-4 py-20 text-center"><p className="text-5xl mb-4">🔒</p><p className="text-charcoal/50 text-lg">{t("admin.no_access")}</p></div>;
  }

  const filtered = users.filter((u) => !search || u.displayName.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase()));
  const roleColors: Record<UserRole, string> = {
    user: "bg-cloud text-charcoal/60",
    moderator: "bg-lavender text-teal",
    admin: "bg-peach text-coral",
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
      <h1 className="text-3xl font-extrabold text-charcoal mb-2">{t("admin.title")}</h1>
      <p className="text-charcoal/50 mb-8">{t("admin.subtitle")}</p>
      <div className="relative mb-6">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-charcoal/30">🔍</span>
        <input type="text" placeholder={t("admin.search")} value={search} onChange={(e) => setSearch(e.target.value)} className="w-full pl-10 pr-4 py-2.5 border border-soft-gray/50 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-teal/40 focus:border-transparent" />
      </div>
      {loading ? (
        <div className="text-center py-20"><div className="inline-block w-8 h-8 border-4 border-lavender border-t-teal rounded-full animate-spin" /></div>
      ) : (
        <div className="space-y-2">
          {filtered.map((u) => (
            <div key={u.uid} className="bg-white border border-soft-gray/50 rounded-2xl p-4 hover:shadow-md transition-all">
              <div className="flex items-center gap-4">
                <img src={u.photoURL ?? ""} alt="" className="w-10 h-10 rounded-full ring-2 ring-lavender" />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-charcoal truncate">{u.displayName}</p>
                  <p className="text-xs text-charcoal/40 truncate">{u.email}</p>
                </div>
                <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${roleColors[u.role]}`}>{u.role}</span>
                <select value={u.role} onChange={(e) => changeRole(u.uid, e.target.value as UserRole)} className="border border-soft-gray/50 rounded-xl px-3 py-1.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-teal/40">
                  <option value="user">👤 User</option>
                  <option value="moderator">🛡️ Moderator</option>
                  <option value="admin">⚙️ Admin</option>
                </select>
                {(u.role === "moderator") && (
                  <button
                    onClick={() => setEditingLangs(editingLangs === u.uid ? null : u.uid)}
                    className="text-xs text-teal hover:text-teal-light px-2 py-1 rounded-lg hover:bg-lavender/20 transition-all"
                  >
                    🌍 {t("admin.languages")}
                  </button>
                )}
              </div>

              {/* Language assignment for moderators */}
              {editingLangs === u.uid && u.role === "moderator" && (
                <div className="mt-3 pt-3 border-t border-soft-gray/30">
                  <p className="text-xs text-charcoal/50 mb-2">{t("admin.assign_languages")}</p>
                  <div className="flex flex-wrap gap-2">
                    {LANGUAGES.map((l) => {
                      const active = (u.moderatorLanguages ?? []).includes(l.code);
                      return (
                        <button
                          key={l.code}
                          onClick={() => toggleModeratorLang(u.uid, l.code, u.moderatorLanguages ?? [])}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                            active ? "bg-teal text-white shadow-sm" : "bg-cloud text-charcoal/50 hover:bg-soft-gray/40"
                          }`}
                        >
                          <Flag code={l.code} className="text-xs" /> {l.name}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
