import { useEffect, useState } from "react";
import { collection, onSnapshot, doc, updateDoc } from "firebase/firestore";
import { db } from "../lib/firebase";
import { useAuth } from "../contexts/AuthContext";
import { useLocale } from "../contexts/LocaleContext";
import type { UserProfile, UserRole } from "../types";
import { LANGUAGES } from "../types";
import Flag from "../components/Flag";
import Icon from "../components/Icon";

export default function AdminPage() {
  const { isAdmin } = useAuth();
  const { t } = useLocale();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [editingLangs, setEditingLangs] = useState<string | null>(null);

  useEffect(() => {
    if (!isAdmin) return;
    const unsub = onSnapshot(collection(db, "users"), (snap) => { setUsers(snap.docs.map((d) => d.data() as UserProfile)); setLoading(false); });
    return unsub;
  }, [isAdmin]);

  async function changeRole(uid: string, role: UserRole) { await updateDoc(doc(db, "users", uid), { role }); }
  async function toggleModeratorLang(uid: string, langCode: string, currentLangs: string[]) {
    const newLangs = currentLangs.includes(langCode) ? currentLangs.filter((l) => l !== langCode) : [...currentLangs, langCode];
    await updateDoc(doc(db, "users", uid), { moderatorLanguages: newLangs });
  }

  if (!isAdmin) return (
    <div className="max-w-xl mx-auto px-5 py-24 text-center">
      <Icon name="settings" size={48} className="mx-auto text-sand mb-4" />
      <p className="text-walnut text-lg font-serif">{t("admin.no_access")}</p>
    </div>
  );

  const filtered = users.filter((u) => !search || u.displayName.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase()));
  const roleColors: Record<UserRole, string> = { user: "bg-cream text-stone", moderator: "bg-terracotta/10 text-terracotta", admin: "bg-ochre/10 text-ochre" };

  return (
    <div className="max-w-4xl mx-auto px-5 sm:px-8 py-12">
      <h1 className="font-serif text-3xl font-semibold text-ink mb-2">{t("admin.title")}</h1>
      <p className="text-stone mb-8">{t("admin.subtitle")}</p>
      <div className="relative mb-8">
        <Icon name="search" size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-stone" />
        <input type="text" placeholder={t("admin.search")} value={search} onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-11 pr-4 py-3 border border-sand/50 rounded text-sm bg-white focus:outline-none focus:ring-1 focus:ring-terracotta-light/40 focus:border-terracotta-light/40" />
      </div>
      {loading ? (
        <div className="text-center py-24"><div className="inline-block w-8 h-8 border-2 border-sand border-t-terracotta rounded-full animate-spin" /></div>
      ) : (
        <div className="space-y-3">
          {filtered.map((u) => (
            <div key={u.uid} className="bg-white border border-sand/40 rounded p-5 hover:shadow-md transition-all">
              <div className="flex items-center gap-4">
                <img src={u.photoURL ?? ""} alt="" className="w-10 h-10 rounded-full ring-1 ring-sand" />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-espresso truncate">{u.displayName}</p>
                  <p className="text-[11px] text-stone truncate">{u.email}</p>
                </div>
                <span className={`text-[11px] font-medium px-2.5 py-1 rounded-full tracking-wide ${roleColors[u.role]}`}>{u.role}</span>
                <select value={u.role} onChange={(e) => changeRole(u.uid, e.target.value as UserRole)}
                  className="border border-sand/50 rounded px-3 py-2 text-sm bg-ivory focus:outline-none focus:ring-1 focus:ring-terracotta-light/40">
                  <option value="user">User</option>
                  <option value="moderator">Moderator</option>
                  <option value="admin">Admin</option>
                </select>
                {u.role === "moderator" && (
                  <button onClick={() => setEditingLangs(editingLangs === u.uid ? null : u.uid)}
                    className="text-xs text-terracotta hover:text-terracotta-light px-2 py-1.5 rounded hover:bg-cream transition-all tracking-wide">
                    {t("admin.languages")}
                  </button>
                )}
              </div>
              {editingLangs === u.uid && u.role === "moderator" && (
                <div className="mt-4 pt-4 border-t border-sand/30">
                  <p className="text-[11px] text-stone tracking-wide uppercase mb-3">{t("admin.assign_languages")}</p>
                  <div className="flex flex-wrap gap-2">
                    {LANGUAGES.map((l) => {
                      const active = (u.moderatorLanguages ?? []).includes(l.code);
                      return (
                        <button key={l.code} onClick={() => toggleModeratorLang(u.uid, l.code, u.moderatorLanguages ?? [])}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs tracking-wide transition-all border ${active ? "bg-espresso text-ivory border-espresso" : "bg-ivory text-stone border-sand/40 hover:border-warm-gray"}`}>
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
