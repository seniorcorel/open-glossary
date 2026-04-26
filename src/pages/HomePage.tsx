import { useEffect, useState } from "react";
import { collection, query, where, onSnapshot, doc, deleteDoc } from "firebase/firestore";
import { Link } from "react-router-dom";
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

export default function HomePage() {
  const { isModerator } = useAuth();
  const { t } = useLocale();
  const [approvedWords, setApprovedWords] = useState<Word[]>([]);
  const [pendingWords, setPendingWords] = useState<Word[]>([]);
  const [search, setSearch] = useState("");
  const [langFilter, setLangFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [showNewWord, setShowNewWord] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => {
    const qApproved = query(collection(db, "words"), where("status", "==", "approved"));
    const qPending = query(collection(db, "words"), where("status", "==", "pending"));
    const unsub1 = onSnapshot(qApproved, (snap) => {
      setApprovedWords(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Word)));
      setLoading(false);
    });
    const unsub2 = onSnapshot(qPending, (snap) => {
      setPendingWords(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Word)));
    });
    return () => { unsub1(); unsub2(); };
  }, []);

  const allWords = [...approvedWords, ...pendingWords];
  const filtered = allWords
    .filter((w) => {
      const s = search.toLowerCase();
      return (!search || w.term.toLowerCase().includes(s) || w.translation.toLowerCase().includes(s) || w.meaning?.toLowerCase().includes(s))
        && (!langFilter || w.language === langFilter)
        && (!typeFilter || (w.entryType ?? "word") === typeFilter);
    })
    .sort((a, b) => a.term.localeCompare(b.term, undefined, { sensitivity: "base" }));

  const grouped: Record<string, Word[]> = {};
  for (const w of filtered) {
    const letter = (w.term[0] ?? "#").toUpperCase();
    if (!grouped[letter]) grouped[letter] = [];
    grouped[letter].push(w);
  }
  const letters = Object.keys(grouped).sort((a, b) => a.localeCompare(b));

  const langCounts: Record<string, number> = {};
  for (const w of approvedWords) langCounts[w.language] = (langCounts[w.language] ?? 0) + 1;

  return (
    <div className="max-w-6xl mx-auto px-5 sm:px-8">
      {/* Hero */}
      <section className="py-16 sm:py-24 text-center max-w-3xl mx-auto">
        <p className="text-[11px] tracking-[0.3em] uppercase text-stone mb-6">
          {t("home.approved_count").replace(/^\d+\s*/, "")} — {approvedWords.length}
        </p>
        <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl font-semibold text-ink leading-[1.1] mb-6">
          {t("app.tagline")}
        </h1>
        <p className="text-stone text-base sm:text-lg leading-relaxed max-w-xl mx-auto">
          {t("app.login_prompt")}
        </p>
        <div className="mt-8 w-16 h-px bg-terracotta/40 mx-auto" />
      </section>

      {/* Language cards */}
      <section className="mb-16">
        <h2 className="font-serif text-xl text-espresso mb-6">{t("home.all_languages")}</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
          {LANGUAGES.map((l) => (
            <Link key={l.code} to={`/lang/${l.code}`}
              className="flex items-center gap-3 px-4 py-3.5 rounded bg-white border border-sand/40 hover:border-warm-gray/60 hover:shadow-md hover:shadow-sand/20 transition-all group">
              <Flag code={l.code} className="text-lg" />
              <div className="min-w-0">
                <p className="text-sm font-medium text-espresso group-hover:text-terracotta transition-colors truncate">{l.name}</p>
                <p className="text-[11px] text-stone">{langCounts[l.code] ?? 0} {t("home.words_label")}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Search + Add button */}
      <section className="max-w-2xl mx-auto mb-8">
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Icon name="search" size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-stone" />
            <input type="text" placeholder={t("home.search")} value={search} onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-11 pr-4 py-3.5 border border-sand/50 rounded text-sm bg-white focus:outline-none focus:ring-1 focus:ring-terracotta-light/40 focus:border-terracotta-light/40 transition-all" />
          </div>
          <button onClick={() => setShowNewWord(true)}
            className="flex items-center gap-2 px-5 py-3.5 bg-espresso text-ivory rounded text-sm font-medium tracking-wide hover:bg-ink transition-all shrink-0">
            <Icon name="plus" size={16} />
            <span className="hidden sm:inline">{t("nav.new")}</span>
          </button>
        </div>
      </section>

      {/* Filters */}
      <section className="flex flex-wrap justify-center gap-1.5 mb-4">
        <button onClick={() => setLangFilter("")}
          className={`px-3.5 py-1.5 rounded text-[12px] tracking-wide transition-all border ${!langFilter ? "bg-espresso text-ivory border-espresso" : "bg-white text-stone border-sand/40 hover:border-warm-gray"}`}>
          {t("home.all_languages")}
        </button>
        {LANGUAGES.map((l) => (
          <button key={l.code} onClick={() => setLangFilter(langFilter === l.code ? "" : l.code)}
            className={`px-3.5 py-1.5 rounded text-[12px] tracking-wide transition-all flex items-center gap-1.5 border ${langFilter === l.code ? "bg-espresso text-ivory border-espresso" : "bg-white text-stone border-sand/40 hover:border-warm-gray"}`}>
            <Flag code={l.code} className="text-xs" /> {l.name}
          </button>
        ))}
      </section>

      <section className="flex flex-wrap justify-center gap-1.5 mb-12">
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
      </section>

      {/* Stats */}
      <div className="flex justify-center gap-8 mb-10 text-[11px] tracking-widest uppercase text-stone">
        <span>{approvedWords.length} {t("home.approved_count")}</span>
        <span className="text-sand">·</span>
        <span>{pendingWords.length} {t("home.pending_count")}</span>
      </div>

      {/* Letter index */}
      {letters.length > 0 && (
        <div className="flex flex-wrap justify-center gap-1 mb-10">
          {letters.map((letter) => (
            <a key={letter} href={`#letter-${letter}`} className="w-8 h-8 flex items-center justify-center rounded text-sm font-serif font-semibold text-walnut bg-cream hover:bg-sand/40 transition-all">
              {letter}
            </a>
          ))}
        </div>
      )}

      {/* Words */}
      {loading ? (
        <div className="text-center py-24">
          <div className="inline-block w-8 h-8 border-2 border-sand border-t-terracotta rounded-full animate-spin" />
          <p className="mt-4 text-stone text-sm">{t("home.loading")}</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-24">
          <Icon name="book" size={48} className="mx-auto text-sand mb-4" />
          <p className="text-walnut text-lg font-serif">{t("home.no_results")}</p>
          <p className="text-stone text-sm mt-2">{t("home.be_first")}</p>
        </div>
      ) : (
        <div className="space-y-12 pb-16">
          {letters.map((letter) => (
            <section key={letter} id={`letter-${letter}`}>
              <div className="flex items-center gap-4 mb-6">
                <span className="font-serif text-3xl font-semibold text-terracotta">{letter}</span>
                <div className="flex-1 h-px bg-sand/60" />
                <span className="text-[11px] text-stone tracking-wide">{grouped[letter].length}</span>
              </div>
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {grouped[letter].map((word) => (
                  <WordCard key={word.id} word={word} showStatus={word.status !== "approved"} onDelete={isModerator ? (id) => setDeleteId(id) : undefined} />
                ))}
              </div>
            </section>
          ))}
        </div>
      )}

      {/* Footer quote */}
      <footer className="py-16 text-center border-t border-sand/40">
        <blockquote className="font-serif text-lg sm:text-xl italic text-walnut/70 max-w-lg mx-auto leading-relaxed">
          «I limiti del mio linguaggio significano i limiti del mio mondo.»
        </blockquote>
        <p className="text-[11px] text-stone tracking-widest uppercase mt-4">— Ludwig Wittgenstein</p>
      </footer>

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
