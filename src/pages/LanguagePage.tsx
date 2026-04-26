import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { collection, query, where, onSnapshot, doc, deleteDoc } from "firebase/firestore";
import { db } from "../lib/firebase";
import { useAuth } from "../contexts/AuthContext";
import { useLocale } from "../contexts/LocaleContext";
import type { Word } from "../types";
import { LANGUAGES, ENTRY_TYPES } from "../types";
import Flag from "../components/Flag";
import Icon from "../components/Icon";
import WordCard from "../components/WordCard";
import NewWordModal from "../components/NewWordModal";
import ConfirmModal from "../components/ConfirmModal";

export default function LanguagePage() {
  const { code } = useParams<{ code: string }>();
  const { t } = useLocale();
  const { isModerator } = useAuth();
  const [words, setWords] = useState<Word[]>([]);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [showNewWord, setShowNewWord] = useState(false);
  const lang = LANGUAGES.find((l) => l.code === code);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => {
    if (!code) return;
    const q = query(collection(db, "words"), where("language", "==", code), where("status", "==", "approved"));
    const unsub = onSnapshot(q, (snap) => { setWords(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Word))); setLoading(false); });
    return unsub;
  }, [code]);

  const filtered = words
    .filter((w) => {
      const s = search.toLowerCase();
      return (!search || w.term.toLowerCase().includes(s) || w.translation.toLowerCase().includes(s) || w.meaning?.toLowerCase().includes(s))
        && (!typeFilter || (w.entryType ?? "word") === typeFilter);
    })
    .sort((a, b) => a.term.localeCompare(b.term, undefined, { sensitivity: "base" }));

  const grouped: Record<string, Word[]> = {};
  for (const w of filtered) { const l = (w.term[0] ?? "#").toUpperCase(); if (!grouped[l]) grouped[l] = []; grouped[l].push(w); }
  const letters = Object.keys(grouped).sort((a, b) => a.localeCompare(b));

  if (!lang) return (
    <div className="max-w-xl mx-auto px-5 py-24 text-center">
      <Icon name="globe" size={48} className="mx-auto text-sand mb-4" />
      <p className="text-walnut text-lg font-serif">{t("lang.not_found")}</p>
      <Link to="/" className="mt-4 inline-block text-terracotta hover:underline text-sm">{t("lang.back_home")}</Link>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto px-5 sm:px-8 py-12">
      <div className="flex items-center gap-4 mb-10">
        <Link to="/" className="text-stone hover:text-espresso transition-colors"><Icon name="arrow" size={20} /></Link>
        <Flag code={code!} className="text-3xl" />
        <div>
          <h1 className="font-serif text-3xl font-semibold text-ink">{lang.name}</h1>
          <p className="text-stone text-sm">{filtered.length} {t("home.words_label")}</p>
        </div>
      </div>

      <div className="max-w-2xl mb-8">
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Icon name="search" size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-stone" />
            <input type="text" placeholder={t("home.search")} value={search} onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-11 pr-4 py-3.5 border border-sand/50 rounded text-sm bg-white focus:outline-none focus:ring-1 focus:ring-terracotta-light/40 focus:border-terracotta-light/40" />
          </div>
          <button onClick={() => setShowNewWord(true)}
            className="flex items-center gap-2 px-5 py-3.5 bg-espresso text-ivory rounded text-sm font-medium tracking-wide hover:bg-ink transition-all shrink-0">
            <Icon name="plus" size={16} />
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-10">
        <button onClick={() => setTypeFilter("")}
          className={`px-3.5 py-1.5 rounded text-[12px] tracking-wide transition-all border ${!typeFilter ? "bg-terracotta text-ivory border-terracotta" : "bg-white text-stone border-sand/40 hover:border-warm-gray"}`}>
          {t("home.all_types")}
        </button>
        {ENTRY_TYPES.map((et) => (
          <button key={et.code} onClick={() => setTypeFilter(typeFilter === et.code ? "" : et.code)}
            className={`px-3.5 py-1.5 rounded text-[12px] tracking-wide transition-all border ${typeFilter === et.code ? "bg-terracotta text-ivory border-terracotta" : "bg-white text-stone border-sand/40 hover:border-warm-gray"}`}>
            {t(`type.${et.code}`)}
          </button>
        ))}
      </div>

      {letters.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-10">
          {letters.map((l) => (
            <a key={l} href={`#letter-${l}`} className="w-8 h-8 flex items-center justify-center rounded-md text-sm font-serif font-semibold text-walnut bg-cream hover:bg-sand/40 transition-all">{l}</a>
          ))}
        </div>
      )}

      {loading ? (
        <div className="text-center py-24"><div className="inline-block w-8 h-8 border-2 border-sand border-t-terracotta rounded-full animate-spin" /></div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-24">
          <Icon name="book" size={48} className="mx-auto text-sand mb-4" />
          <p className="text-walnut text-lg font-serif">{t("home.no_results")}</p>
        </div>
      ) : (
        <div className="space-y-12 pb-16">
          {letters.map((letter) => (
            <section key={letter} id={`letter-${letter}`}>
              <div className="flex items-center gap-4 mb-6">
                <span className="font-serif text-3xl font-semibold text-terracotta">{letter}</span>
                <div className="flex-1 h-px bg-sand/60" />
                <span className="text-[11px] text-stone">{grouped[letter].length}</span>
              </div>
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {grouped[letter].map((word) => (<WordCard key={word.id} word={word} onDelete={isModerator ? (id) => setDeleteId(id) : undefined} />))}
              </div>
            </section>
          ))}
        </div>
      )}

      {showNewWord && <NewWordModal onClose={() => setShowNewWord(false)} />}
      {deleteId && (
        <ConfirmModal
          title={t("word.delete_title")}
          message={t("word.delete_message")}
          confirmLabel={t("word.delete")}
          cancelLabel={t("suggest.cancel")}
          onConfirm={async () => { if (deleteId) { await deleteDoc(doc(db, "words", deleteId)); } setDeleteId(null); }}
          onCancel={() => setDeleteId(null)}
          danger
        />
      )}
    </div>
  );
}
