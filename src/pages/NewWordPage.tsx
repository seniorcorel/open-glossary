import { useState, type FormEvent } from "react";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { db } from "../lib/firebase";
import { useAuth } from "../contexts/AuthContext";
import { useLocale } from "../contexts/LocaleContext";
import { LANGUAGES, ENTRY_TYPES, type EntryType } from "../types";

export default function NewWordPage() {
  const { user, profile } = useAuth();
  const { t } = useLocale();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [term, setTerm] = useState("");
  const [entryType, setEntryType] = useState<EntryType>("word");
  const [language, setLanguage] = useState("it");
  const [translation, setTranslation] = useState("");
  const [meaning, setMeaning] = useState("");
  const [examples, setExamples] = useState("");
  const [references, setReferences] = useState("");
  const [tags, setTags] = useState("");
  const [extraTranslations, setExtraTranslations] = useState<{ lang: string; text: string }[]>([]);

  function addTranslation() { setExtraTranslations([...extraTranslations, { lang: "en", text: "" }]); }
  function updateTranslation(i: number, field: "lang" | "text", val: string) {
    const copy = [...extraTranslations]; copy[i][field] = val; setExtraTranslations(copy);
  }
  function removeTranslation(i: number) { setExtraTranslations(extraTranslations.filter((_, idx) => idx !== i)); }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!user || !profile) return;
    setSubmitting(true);
    const translations: Record<string, string> = {};
    extraTranslations.forEach((t) => { if (t.text.trim()) translations[t.lang] = t.text.trim(); });
    await addDoc(collection(db, "words"), {
      term: term.trim(), entryType, language, translation: translation.trim(), translations,
      meaning: meaning.trim(),
      examples: examples.split("\n").map((s) => s.trim()).filter(Boolean),
      references: references.split("\n").map((s) => s.trim()).filter(Boolean),
      tags: tags.split(",").map((s) => s.trim().toLowerCase()).filter(Boolean),
      status: "pending", createdBy: user.uid, createdByName: profile.displayName,
      createdAt: serverTimestamp(), moderatedBy: null, moderatedAt: null,
    });
    navigate("/");
  }

  if (!user) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center">
        <p className="text-5xl mb-4">🔒</p>
        <p className="text-charcoal/50 text-lg">{t("new.login_required")}</p>
      </div>
    );
  }

  const ic = "w-full border border-soft-gray/50 rounded-xl px-4 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-teal/40 focus:border-transparent transition-all";

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-charcoal">{t("new.title")}</h1>
        <p className="text-charcoal/50 mt-1">{t("new.subtitle")}</p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-charcoal/70 mb-2">{t("new.entry_type")}</label>
          <div className="flex flex-wrap gap-2">
            {ENTRY_TYPES.map((et) => (
              <button
                key={et.code}
                type="button"
                onClick={() => setEntryType(et.code)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-1.5 ${
                  entryType === et.code
                    ? "bg-teal text-white shadow-md shadow-teal/20"
                    : "bg-cloud text-charcoal/60 hover:bg-soft-gray/40"
                }`}
              >
                {et.icon} {t(`type.${et.code}`)}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-charcoal/70 mb-1.5">{t("new.term")}</label>
            <input required value={term} onChange={(e) => setTerm(e.target.value)} className={ic} placeholder="Magari" />
          </div>
          <div>
            <label className="block text-sm font-medium text-charcoal/70 mb-1.5">{t("new.language")}</label>
            <select value={language} onChange={(e) => setLanguage(e.target.value)} className={ic}>
              {LANGUAGES.map((l) => <option key={l.code} value={l.code}>{l.name}</option>)}
            </select>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-charcoal/70 mb-1.5">{t("new.translation")}</label>
          <input required value={translation} onChange={(e) => setTranslation(e.target.value)} className={ic} placeholder="Maybe / I wish" />
        </div>
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-sm font-medium text-charcoal/70">{t("new.other_translations")}</label>
            <button type="button" onClick={addTranslation} className="text-xs text-teal hover:text-teal-light font-medium">{t("new.add_language")}</button>
          </div>
          {extraTranslations.map((tr, i) => (
            <div key={i} className="flex gap-2 mb-2">
              <select value={tr.lang} onChange={(e) => updateTranslation(i, "lang", e.target.value)} className="border border-soft-gray/50 rounded-xl px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-teal/40">
                {LANGUAGES.map((l) => <option key={l.code} value={l.code}>{l.name}</option>)}
              </select>
              <input value={tr.text} onChange={(e) => updateTranslation(i, "text", e.target.value)} className={`flex-1 ${ic}`} />
              <button type="button" onClick={() => removeTranslation(i)} className="text-coral hover:text-coral-light px-2">✕</button>
            </div>
          ))}
        </div>
        <div>
          <label className="block text-sm font-medium text-charcoal/70 mb-1.5">{t("new.meaning")}</label>
          <textarea value={meaning} onChange={(e) => setMeaning(e.target.value)} className={ic} rows={3} />
        </div>
        <div>
          <label className="block text-sm font-medium text-charcoal/70 mb-1.5">{t("new.examples")}</label>
          <textarea value={examples} onChange={(e) => setExamples(e.target.value)} className={ic} rows={3} />
        </div>
        <div>
          <label className="block text-sm font-medium text-charcoal/70 mb-1.5">{t("new.references")}</label>
          <textarea value={references} onChange={(e) => setReferences(e.target.value)} className={ic} rows={2} />
        </div>
        <div>
          <label className="block text-sm font-medium text-charcoal/70 mb-1.5">{t("new.tags")}</label>
          <input value={tags} onChange={(e) => setTags(e.target.value)} className={ic} />
        </div>
        <button type="submit" disabled={submitting} className="w-full bg-gradient-to-r from-teal to-teal-light text-white py-3 rounded-xl font-medium text-sm hover:shadow-lg hover:shadow-teal/20 transition-all active:scale-[0.98] disabled:opacity-50">
          {submitting ? t("new.submitting") : t("new.submit")}
        </button>
      </form>
    </div>
  );
}
