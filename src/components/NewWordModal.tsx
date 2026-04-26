import { useState, useEffect, useRef, type FormEvent } from "react";
import { collection, addDoc, serverTimestamp, query, where, getDocs } from "firebase/firestore";
import { db } from "../lib/firebase";
import { useAuth } from "../contexts/AuthContext";
import { useLocale } from "../contexts/LocaleContext";
import { LANGUAGES, ENTRY_TYPES, WORD_TYPES, type EntryType, type WordType } from "../types";
import type { Word } from "../types";
import Icon from "./Icon";
import Flag from "./Flag";

const DEFAULT_TRANS_LANG: Record<string, string> = {
  it: "en", en: "es", es: "en", fr: "en", de: "en", pt: "en", ja: "en", ko: "en", zh: "en", ar: "en",
};

const SHOW_WORD_TYPE: Set<EntryType> = new Set(["word"]);

interface Props { onClose: () => void; }

export default function NewWordModal({ onClose }: Props) {
  const { user, profile, signInWithGoogle } = useAuth();
  const { t } = useLocale();
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [term, setTerm] = useState("");
  const [entryType, setEntryType] = useState<EntryType>("word");
  const [wordType, setWordType] = useState<WordType | "">("");
  const [language, setLanguage] = useState("it");
  const [translation, setTranslation] = useState("");
  const [meaning, setMeaning] = useState("");
  const [examples, setExamples] = useState("");
  const [tags, setTags] = useState("");

  // Duplicate detection
  const [matches, setMatches] = useState<Word[]>([]);
  const [editingExisting, setEditingExisting] = useState<Word | null>(null);
  const [reason, setReason] = useState("");
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  const transLang = DEFAULT_TRANS_LANG[language] ?? "en";

  // Search for duplicates when term or language changes
  useEffect(() => {
    if (editingExisting) return;
    const trimmed = term.trim();
    if (trimmed.length < 2) { setMatches([]); return; }
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      const q = query(collection(db, "words"), where("language", "==", language));
      const snap = await getDocs(q);
      const found = snap.docs
        .map((d) => ({ id: d.id, ...d.data() } as Word))
        .filter((w) => w.term.toLowerCase().includes(trimmed.toLowerCase()));
      setMatches(found.slice(0, 5));
    }, 300);
    return () => clearTimeout(debounceRef.current);
  }, [term, language, editingExisting]);

  function selectExisting(word: Word) {
    setEditingExisting(word);
    setTerm(word.term);
    setEntryType(word.entryType ?? "word");
    setWordType(word.wordType ?? "");
    setTranslation(word.translation);
    setMeaning(word.meaning ?? "");
    setExamples((word.examples ?? []).join("\n"));
    setTags((word.tags ?? []).join(", "));
    setMatches([]);
  }

  function getChanges(): Record<string, any> {
    if (!editingExisting) return {};
    const changes: Record<string, any> = {};
    if (term.trim() !== editingExisting.term) changes.term = term.trim();
    if (entryType !== (editingExisting.entryType ?? "word")) changes.entryType = entryType;
    if (SHOW_WORD_TYPE.has(entryType) && wordType !== (editingExisting.wordType ?? "")) changes.wordType = wordType;
    if (translation.trim() !== editingExisting.translation) changes.translation = translation.trim();
    if (meaning.trim() !== (editingExisting.meaning ?? "")) changes.meaning = meaning.trim();
    const newEx = examples.split("\n").map(s => s.trim()).filter(Boolean);
    if (JSON.stringify(newEx) !== JSON.stringify(editingExisting.examples ?? [])) changes.examples = newEx;
    const newTags = tags.split(",").map(s => s.trim().toLowerCase()).filter(Boolean);
    if (JSON.stringify(newTags) !== JSON.stringify(editingExisting.tags ?? [])) changes.tags = newTags;
    return changes;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!user || !profile) return;
    setSubmitting(true);

    if (editingExisting) {
      // Submit as suggestion
      const changes = getChanges();
      if (Object.keys(changes).length === 0) { onClose(); return; }
      await addDoc(collection(db, "suggestions"), {
        wordId: editingExisting.id, wordTerm: editingExisting.term,
        field: Object.keys(changes).join(", "),
        value: JSON.stringify(changes),
        changes,
        reason: reason.trim(),
        status: "pending",
        createdBy: user.uid, createdByName: profile.username || profile.displayName,
        createdAt: serverTimestamp(), moderatedBy: null, moderatedAt: null,
      });
    } else {
      // Check one more time for exact duplicate
      const q = query(collection(db, "words"), where("term", "==", term.trim()), where("language", "==", language));
      const snap = await getDocs(q);
      if (!snap.empty) {
        setSubmitting(false);
        selectExisting({ id: snap.docs[0].id, ...snap.docs[0].data() } as Word);
        return;
      }
      await addDoc(collection(db, "words"), {
        term: term.trim(), entryType, wordType: SHOW_WORD_TYPE.has(entryType) ? (wordType || null) : null,
        language, translation: translation.trim(), translations: {},
        meaning: meaning.trim(),
        examples: examples.split("\n").map((s) => s.trim()).filter(Boolean),
        references: [],
        tags: tags.split(",").map((s) => s.trim().toLowerCase()).filter(Boolean),
        status: "pending", createdBy: user.uid, createdByName: profile.username || profile.displayName,
        createdAt: serverTimestamp(), moderatedBy: null, moderatedAt: null,
      });
    }
    setDone(true);
    setSubmitting(false);
  }

  const ic = "w-full border border-sand/50 rounded px-3.5 py-2.5 text-sm bg-ivory focus:outline-none focus:ring-1 focus:ring-terracotta-light/40 focus:border-terracotta-light/40 transition-all";
  const label = "block text-[11px] font-medium text-stone tracking-wide uppercase mb-1.5";
  const hasChanges = editingExisting ? Object.keys(getChanges()).length > 0 : true;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/30 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white rounded border border-sand/30 p-8 max-w-lg w-full mx-4 shadow-2xl max-h-[90vh] overflow-y-auto animate-fade-in" onClick={(e) => e.stopPropagation()}>
        {!user ? (
          <div className="text-center py-8">
            <Icon name="user" size={40} className="mx-auto text-sand mb-4" />
            <p className="font-serif text-xl text-espresso mb-2">{t("new.login_required")}</p>
            <p className="text-stone text-sm mb-6">{t("app.login_prompt")}</p>
            <button onClick={signInWithGoogle} className="bg-espresso text-ivory px-8 py-2.5 rounded text-sm font-medium tracking-wide hover:bg-ink transition-all">
              {t("nav.sign_in")}
            </button>
          </div>
        ) : done ? (
          <div className="text-center py-8">
            <Icon name="check" size={40} className="mx-auto text-approve mb-4" />
            <p className="font-serif text-xl text-espresso mb-2">
              {editingExisting ? t("suggest.changes_sent") : t("suggest.success")}
            </p>
            <p className="text-stone text-sm">{editingExisting ? t("suggest.success_sub") : t("new.subtitle")}</p>
            <button onClick={onClose} className="mt-6 bg-espresso text-ivory px-8 py-2.5 rounded text-sm font-medium hover:bg-ink transition-all">
              {t("suggest.close")}
            </button>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-serif text-xl text-espresso">
                {editingExisting ? <>{t("suggest.edit_title")} <em>«{editingExisting.term}»</em></> : t("new.title")}
              </h3>
              <button onClick={onClose} className="text-stone hover:text-espresso p-1"><Icon name="close" size={18} /></button>
            </div>
            <p className="text-stone text-sm mb-6">
              {editingExisting ? t("suggest.edit_subtitle") : t("new.subtitle")}
            </p>

            {/* Existing word banner */}
            {editingExisting && (
              <div className="mb-4 p-3 bg-ochre-light/10 border border-ochre-light/30 rounded text-sm text-walnut">
                {t("new.editing_existing")}
                <button onClick={() => { setEditingExisting(null); setMatches([]); }} className="ml-2 text-terracotta underline text-xs">
                  {t("new.create_new_instead")}
                </button>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Entry type */}
              <div>
                <label className={label}>{t("new.entry_type")}</label>
                <div className="flex flex-wrap gap-1.5">
                  {ENTRY_TYPES.map((et) => (
                    <button key={et.code} type="button" onClick={() => { setEntryType(et.code); if (!SHOW_WORD_TYPE.has(et.code)) setWordType(""); }}
                      className={`px-3 py-1.5 rounded text-xs tracking-wide transition-all border ${entryType === et.code ? "bg-espresso text-ivory border-espresso" : "bg-ivory text-walnut border-sand/40 hover:border-warm-gray"}`}>
                      {t(`type.${et.code}`)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Word type — only for "word" */}
              {SHOW_WORD_TYPE.has(entryType) && (
                <div>
                  <label className={label}>{t("new.word_type")}</label>
                  <div className="flex flex-wrap gap-1.5">
                    {WORD_TYPES.map((wt) => (
                      <button key={wt} type="button" onClick={() => setWordType(wordType === wt ? "" : wt)}
                        className={`px-3 py-1.5 rounded text-xs tracking-wide transition-all border ${wordType === wt ? "bg-terracotta text-ivory border-terracotta" : "bg-ivory text-walnut border-sand/40 hover:border-warm-gray"}`}>
                        {t(`wordtype.${wt}`)}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Term + Language */}
              <div className="grid grid-cols-2 gap-3">
                <div className="relative">
                  <label className={label}>{t("new.term")}</label>
                  <input required value={term} onChange={(e) => setTerm(e.target.value)} className={ic} placeholder="Magari" disabled={!!editingExisting} />
                  {/* Autocomplete dropdown */}
                  {!editingExisting && matches.length > 0 && term.trim().length >= 2 && (
                    <div className="absolute z-10 left-0 right-0 top-full mt-1 bg-white border border-sand/50 rounded shadow-lg max-h-48 overflow-y-auto">
                      <p className="px-3 py-2 text-[11px] text-stone tracking-wide uppercase border-b border-sand/20">{t("new.existing_words")}</p>
                      {matches.map((m) => (
                        <button key={m.id} type="button" onClick={() => selectExisting(m)}
                          className="w-full text-left px-3 py-2.5 hover:bg-cream transition-all border-b border-sand/10 last:border-0">
                          <span className="text-sm font-medium text-espresso">{m.term}</span>
                          <span className="text-xs text-stone ml-2 italic">{m.translation}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <div>
                  <label className={label}>{t("new.language")}</label>
                  <select value={language} onChange={(e) => setLanguage(e.target.value)} className={ic} disabled={!!editingExisting}>
                    {LANGUAGES.map((l) => <option key={l.code} value={l.code}>{l.name}</option>)}
                  </select>
                </div>
              </div>

              {/* Translation with flag */}
              <div>
                <label className={label}>
                  <span className="inline-flex items-center gap-1.5">{t("new.translation")} <Flag code={transLang} className="text-xs" /></span>
                </label>
                <input required={!editingExisting} value={translation} onChange={(e) => setTranslation(e.target.value)} className={ic} placeholder="Maybe / I wish" />
              </div>

              <div><label className={label}>{t("new.meaning")}</label><textarea value={meaning} onChange={(e) => setMeaning(e.target.value)} className={ic} rows={2} /></div>
              <div><label className={label}>{t("new.examples")}</label><textarea value={examples} onChange={(e) => setExamples(e.target.value)} className={ic} rows={2} /></div>
              <div><label className={label}>{t("new.tags")}</label><input value={tags} onChange={(e) => setTags(e.target.value)} className={ic} placeholder="informal, daily" /></div>

              {/* Reason — only in edit mode */}
              {editingExisting && (
                <div>
                  <label className={label}>{t("suggest.reason")}</label>
                  <input value={reason} onChange={(e) => setReason(e.target.value)} className={ic} placeholder={t("suggest.reason_placeholder")} />
                </div>
              )}

              <button type="submit" disabled={submitting || (!!editingExisting && !hasChanges)} className="w-full bg-espresso text-ivory py-3 rounded text-sm font-medium tracking-wide hover:bg-ink transition-all disabled:opacity-30">
                {submitting ? t("new.submitting") : editingExisting ? t("suggest.submit") : t("new.submit")}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
