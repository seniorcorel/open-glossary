import { useState, type FormEvent } from "react";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { db } from "../lib/firebase";
import { useAuth } from "../contexts/AuthContext";
import { useLocale } from "../contexts/LocaleContext";
import { LANGUAGES, ENTRY_TYPES, WORD_TYPES, type EntryType, type WordType } from "../types";
import Flag from "../components/Flag";

export default function NewWordPage() {
  const { user, profile } = useAuth();
  const { t } = useLocale();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [term, setTerm] = useState("");
  const [entryType, setEntryType] = useState<EntryType>("word");
  const [wordType, setWordType] = useState<WordType | "">("");
  const [language, setLanguage] = useState("it");
  const [translation, setTranslation] = useState("");
  const [meaning, setMeaning] = useState("");
  const [examples, setExamples] = useState("");
  const [references, setReferences] = useState("");
  const [tags, setTags] = useState("");
  const [extraTranslations, setExtraTranslations] = useState<{ lang: string; text: string }[]>([]);

  function addTranslation() { setExtraTranslations([...extraTranslations, { lang: "en", text: "" }]); }
  function updateTranslation(i: number, field: "lang" | "text", val: string) { const c = [...extraTranslations]; c[i][field] = val; setExtraTranslations(c); }
  function removeTranslation(i: number) { setExtraTranslations(extraTranslations.filter((_, idx) => idx !== i)); }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!user || !profile) return;
    setSubmitting(true);
    const translations: Record<string, string> = {};
    extraTranslations.forEach((t) => { if (t.text.trim()) translations[t.lang] = t.text.trim(); });
    await addDoc(collection(db, "words"), {
      term: term.trim(), entryType, wordType: wordType || null, language, translation: translation.trim(), translations,
      meaning: meaning.trim(),
      examples: examples.split("\n").map((s) => s.trim()).filter(Boolean),
      references: references.split("\n").map((s) => s.trim()).filter(Boolean),
      tags: tags.split(",").map((s) => s.trim().toLowerCase()).filter(Boolean),
      status: "pending", createdBy: user.uid, createdByName: profile.displayName,
      createdAt: serverTimestamp(), moderatedBy: null, moderatedAt: null,
    });
    navigate("/");
  }

  if (!user) return (
    <div className="max-w-xl mx-auto px-5 py-24 text-center">
      <p className="text-walnut text-lg font-serif">{t("new.login_required")}</p>
    </div>
  );

  const ic = "w-full border border-sand/50 rounded px-4 py-3 text-sm bg-white focus:outline-none focus:ring-1 focus:ring-terracotta-light/40 focus:border-terracotta-light/40 transition-all";
  const label = "block text-[11px] font-medium text-stone tracking-wide uppercase mb-2";

  return (
    <div className="max-w-2xl mx-auto px-5 sm:px-8 py-12">
      <div className="mb-10">
        <h1 className="font-serif text-3xl font-semibold text-ink">{t("new.title")}</h1>
        <p className="text-stone mt-2">{t("new.subtitle")}</p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className={label}>{t("new.entry_type")}</label>
          <div className="flex flex-wrap gap-2">
            {ENTRY_TYPES.map((et) => (
              <button key={et.code} type="button" onClick={() => { setEntryType(et.code); if (et.code !== "word") setWordType(""); }}
                className={`px-4 py-2 rounded text-sm tracking-wide transition-all border ${entryType === et.code ? "bg-espresso text-ivory border-espresso" : "bg-white text-walnut border-sand/40 hover:border-warm-gray"}`}>
                {t(`type.${et.code}`)}
              </button>
            ))}
          </div>
        </div>

        {/* Word type — only for "word" */}
        {entryType === "word" && (
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

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div><label className={label}>{t("new.term")}</label><input required value={term} onChange={(e) => setTerm(e.target.value)} className={ic} placeholder="Magari" /></div>
          <div><label className={label}>{t("new.language")}</label><select value={language} onChange={(e) => setLanguage(e.target.value)} className={ic}>{LANGUAGES.map((l) => <option key={l.code} value={l.code}>{l.name}</option>)}</select></div>
        </div>
        <div>
          <label className={label}>
            <span className="inline-flex items-center gap-1.5">{t("new.translation")} <Flag code={(() => { const m: Record<string,string> = {it:"en",en:"es",es:"en",fr:"en",de:"en",pt:"en",ja:"en",ko:"en",zh:"en",ar:"en"}; return m[language] ?? "en"; })() } className="text-xs" /></span>
          </label>
          <input required value={translation} onChange={(e) => setTranslation(e.target.value)} className={ic} placeholder="Maybe / I wish" />
        </div>
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className={`${label} mb-0`}>{t("new.other_translations")}</label>
            <button type="button" onClick={addTranslation} className="text-xs text-terracotta hover:text-terracotta-light font-medium tracking-wide">{t("new.add_language")}</button>
          </div>
          {extraTranslations.map((tr, i) => (
            <div key={i} className="flex gap-2 mb-2">
              <select value={tr.lang} onChange={(e) => updateTranslation(i, "lang", e.target.value)} className="border border-sand/50 rounded px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-1 focus:ring-terracotta-light/40">
                {LANGUAGES.map((l) => <option key={l.code} value={l.code}>{l.name}</option>)}
              </select>
              <input value={tr.text} onChange={(e) => updateTranslation(i, "text", e.target.value)} className={`flex-1 ${ic}`} />
              <button type="button" onClick={() => removeTranslation(i)} className="text-burgundy hover:text-reject px-2 text-sm">✕</button>
            </div>
          ))}
        </div>
        <div><label className={label}>{t("new.meaning")}</label><textarea value={meaning} onChange={(e) => setMeaning(e.target.value)} className={ic} rows={3} /></div>
        <div><label className={label}>{t("new.examples")}</label><textarea value={examples} onChange={(e) => setExamples(e.target.value)} className={ic} rows={3} /></div>
        <div><label className={label}>{t("new.references")}</label><textarea value={references} onChange={(e) => setReferences(e.target.value)} className={ic} rows={2} /></div>
        <div><label className={label}>{t("new.tags")}</label><input value={tags} onChange={(e) => setTags(e.target.value)} className={ic} /></div>
        <button type="submit" disabled={submitting} className="w-full bg-espresso text-ivory py-3.5 rounded font-medium text-sm tracking-wide hover:bg-ink transition-all disabled:opacity-40">
          {submitting ? t("new.submitting") : t("new.submit")}
        </button>
      </form>
    </div>
  );
}
