import { useEffect, useState } from "react";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { Link } from "react-router-dom";
import { db } from "../lib/firebase";
import { useAuth } from "../contexts/AuthContext";
import { useLocale } from "../contexts/LocaleContext";
import type { Word } from "../types";
import { LANGUAGES, ENTRY_TYPES } from "../types";
import Flag from "../components/Flag";
import WordCard from "../components/WordCard";
import Logo from "../components/Logo";

export default function HomePage() {
  const { user } = useAuth();
  const { t } = useLocale();
  const [approvedWords, setApprovedWords] = useState<Word[]>([]);
  const [pendingWords, setPendingWords] = useState<Word[]>([]);
  const [search, setSearch] = useState("");
  const [langFilter, setLangFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [loading, setLoading] = useState(true);

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
      const matchesSearch = !search ||
        w.term.toLowerCase().includes(s) ||
        w.translation.toLowerCase().includes(s) ||
        w.meaning?.toLowerCase().includes(s);
      const matchesLang = !langFilter || w.language === langFilter;
      const matchesType = !typeFilter || (w.entryType ?? "word") === typeFilter;
      return matchesSearch && matchesLang && matchesType;
    })
    .sort((a, b) => a.term.localeCompare(b.term, undefined, { sensitivity: "base" }));

  // Group by first letter
  const grouped: Record<string, Word[]> = {};
  for (const w of filtered) {
    const letter = (w.term[0] ?? "#").toUpperCase();
    if (!grouped[letter]) grouped[letter] = [];
    grouped[letter].push(w);
  }
  const letters = Object.keys(grouped).sort((a, b) => a.localeCompare(b));

  // Count words per language for the language cards
  const langCounts: Record<string, number> = {};
  for (const w of approvedWords) {
    langCounts[w.language] = (langCounts[w.language] ?? 0) + 1;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
      {/* Hero */}
      <div className="text-center mb-10">
        <div className="flex justify-center mb-4">
          <Logo size={64} />
        </div>
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight">
          <span className="bg-gradient-to-r from-teal via-teal-light to-mint-dark bg-clip-text text-transparent">Open</span>
          <span className="text-charcoal"> Glossary</span>
        </h1>
        <p className="mt-3 text-base sm:text-lg text-charcoal/50 max-w-xl mx-auto">{t("app.tagline")}</p>
        {!user && <p className="mt-2 text-sm text-teal">{t("app.login_prompt")}</p>}
      </div>

      {/* Language cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 sm:gap-3 mb-10 px-1 sm:px-0">
        {LANGUAGES.map((l) => (
          <Link
            key={l.code}
            to={`/lang/${l.code}`}
            className="flex items-center gap-2.5 px-4 py-3 rounded-xl bg-white border border-soft-gray/50 hover:border-lavender-dark hover:shadow-lg hover:shadow-lavender/20 transition-all group"
          >
            <Flag code={l.code} className="text-lg" />
            <div className="min-w-0">
              <p className="text-sm font-medium text-charcoal group-hover:text-teal transition-colors truncate">{l.name}</p>
              <p className="text-xs text-charcoal/40">{langCounts[l.code] ?? 0} {t("home.words_label")}</p>
            </div>
          </Link>
        ))}
      </div>

      {/* Search */}
      <div className="max-w-2xl mx-auto mb-6">
        <div className="relative">
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-charcoal/30 text-sm">🔍</span>
          <input
            type="text"
            placeholder={t("home.search")}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-soft-gray/50 rounded-2xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-teal/40 focus:border-transparent transition-all shadow-sm"
          />
        </div>
      </div>

      {/* Language filter pills */}
      <div className="flex flex-wrap justify-center gap-2 mb-4">
        <button
          onClick={() => setLangFilter("")}
          className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
            !langFilter ? "bg-teal text-white shadow-md shadow-teal/20" : "bg-cloud text-charcoal/60 hover:bg-soft-gray/40"
          }`}
        >
          {t("home.all_languages")}
        </button>
        {LANGUAGES.map((l) => (
          <button
            key={l.code}
            onClick={() => setLangFilter(langFilter === l.code ? "" : l.code)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all flex items-center gap-1.5 ${
              langFilter === l.code ? "bg-teal text-white shadow-md shadow-teal/20" : "bg-cloud text-charcoal/60 hover:bg-soft-gray/40"
            }`}
          >
            <Flag code={l.code} className="text-sm" /> {l.name}
          </button>
        ))}
      </div>

      {/* Type filter pills */}
      <div className="flex flex-wrap justify-center gap-2 mb-8">
        <button
          onClick={() => setTypeFilter("")}
          className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
            !typeFilter ? "bg-lavender text-charcoal shadow-md shadow-lavender/30" : "bg-cloud text-charcoal/60 hover:bg-soft-gray/40"
          }`}
        >
          {t("home.all_types")}
        </button>
        {ENTRY_TYPES.map((et) => (
          <button
            key={et.code}
            onClick={() => setTypeFilter(typeFilter === et.code ? "" : et.code)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all flex items-center gap-1.5 ${
              typeFilter === et.code ? "bg-lavender text-charcoal shadow-md shadow-lavender/30" : "bg-cloud text-charcoal/60 hover:bg-soft-gray/40"
            }`}
          >
            {et.icon} {t(`type.${et.code}`)}
          </button>
        ))}
      </div>

      {/* Stats */}
      <div className="flex justify-center gap-6 mb-8 text-sm text-charcoal/40">
        <span>{approvedWords.length} {t("home.approved_count")}</span>
        <span>·</span>
        <span>{pendingWords.length} {t("home.pending_count")}</span>
      </div>

      {/* Letter index */}
      {letters.length > 0 && (
        <div className="flex flex-wrap justify-center gap-1 mb-8">
          {letters.map((letter) => (
            <a key={letter} href={`#letter-${letter}`} className="w-8 h-8 flex items-center justify-center rounded-lg text-sm font-bold text-teal bg-lavender/30 hover:bg-lavender transition-all">
              {letter}
            </a>
          ))}
        </div>
      )}

      {/* Words */}
      {loading ? (
        <div className="text-center py-20">
          <div className="inline-block w-8 h-8 border-4 border-lavender border-t-teal rounded-full animate-spin" />
          <p className="mt-3 text-charcoal/40">{t("home.loading")}</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-5xl mb-4">📝</p>
          <p className="text-charcoal/50 text-lg">{t("home.no_results")}</p>
          <p className="text-charcoal/30 text-sm mt-1">{t("home.be_first")}</p>
        </div>
      ) : (
        <div className="space-y-8">
          {letters.map((letter) => (
            <div key={letter} id={`letter-${letter}`}>
              <div className="flex items-center gap-3 mb-4">
                <span className="w-10 h-10 flex items-center justify-center rounded-xl bg-gradient-to-br from-teal to-teal-light text-white font-bold text-lg shadow-md shadow-teal/20">
                  {letter}
                </span>
                <div className="flex-1 h-px bg-gradient-to-r from-lavender-dark to-transparent" />
                <span className="text-xs text-charcoal/30">{grouped[letter].length}</span>
              </div>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {grouped[letter].map((word) => (
                  <WordCard key={word.id} word={word} showStatus={word.status !== "approved"} />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
