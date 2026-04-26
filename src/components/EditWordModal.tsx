import { useState, type FormEvent } from "react";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../lib/firebase";
import { useLocale } from "../contexts/LocaleContext";
import type { Word, EntryType, WordType } from "../types";
import { LANGUAGES, ENTRY_TYPES, WORD_TYPES } from "../types";

interface Props { word: Word; onClose: () => void; }

export default function EditWordModal({ word, onClose }: Props) {
  const { t } = useLocale();
  const [term, setTerm] = useState(word.term);
  const [entryType, setEntryType] = useState<EntryType>(word.entryType ?? "word");
  const [wordType, setWordType] = useState<WordType | "">(word.wordType ?? "");
  const [language, setLanguage] = useState(word.language);
  const [translation, setTranslation] = useState(word.translation);
  const [meaning, setMeaning] = useState(word.meaning ?? "");
  const [examples, setExamples] = useState((word.examples ?? []).join("\n"));
  const [references, setReferences] = useState((word.references ?? []).join("\n"));
  const [tags, setTags] = useState((word.tags ?? []).join(", "));
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    await updateDoc(doc(db, "words", word.id), {
      term: term.trim(), entryType, wordType: wordType || null, language, translation: translation.trim(), meaning: meaning.trim(),
      examples: examples.split("\n").map((s) => s.trim()).filter(Boolean),
      references: references.split("\n").map((s) => s.trim()).filter(Boolean),
      tags: tags.split(",").map((s) => s.trim().toLowerCase()).filter(Boolean),
    });
    setSaving(false);
    onClose();
  }

  const ic = "w-full border border-sand/50 rounded px-4 py-2.5 text-sm bg-ivory focus:outline-none focus:ring-1 focus:ring-terracotta-light/40 focus:border-terracotta-light/40";
  const label = "block text-[11px] font-medium text-stone tracking-wide uppercase mb-1.5";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/30 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white rounded p-8 max-w-lg w-full mx-4 shadow-2xl border border-sand/30 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <h3 className="font-serif text-xl text-espresso mb-6">{t("edit.title")}</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className={label}>{t("new.entry_type")}</label>
            <div className="flex flex-wrap gap-2">
              {ENTRY_TYPES.map((et) => (
                <button key={et.code} type="button" onClick={() => setEntryType(et.code)}
                  className={`px-3 py-1.5 rounded text-xs tracking-wide transition-all border ${entryType === et.code ? "bg-espresso text-ivory border-espresso" : "bg-ivory text-walnut border-sand/40 hover:border-warm-gray"}`}>
                  {t(`type.${et.code}`)}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className={label}>{t("new.word_type")}</label>
            <div className="flex flex-wrap gap-1.5">
              {WORD_TYPES.map((wt) => (
                <button key={wt} type="button" onClick={() => setWordType(wordType === wt ? "" : wt)}
                  className={`px-2.5 py-1 rounded text-xs tracking-wide transition-all border ${wordType === wt ? "bg-terracotta text-ivory border-terracotta" : "bg-ivory text-walnut border-sand/40 hover:border-warm-gray"}`}>
                  {t(`wordtype.${wt}`)}
                </button>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className={label}>{t("new.term")}</label><input required value={term} onChange={(e) => setTerm(e.target.value)} className={ic} /></div>
            <div><label className={label}>{t("new.language")}</label><select value={language} onChange={(e) => setLanguage(e.target.value)} className={ic}>{LANGUAGES.map((l) => <option key={l.code} value={l.code}>{l.name}</option>)}</select></div>
          </div>
          <div><label className={label}>{t("new.translation")}</label><input required value={translation} onChange={(e) => setTranslation(e.target.value)} className={ic} /></div>
          <div><label className={label}>{t("new.meaning")}</label><textarea value={meaning} onChange={(e) => setMeaning(e.target.value)} className={ic} rows={2} /></div>
          <div><label className={label}>{t("new.examples")}</label><textarea value={examples} onChange={(e) => setExamples(e.target.value)} className={ic} rows={2} /></div>
          <div><label className={label}>{t("new.references")}</label><textarea value={references} onChange={(e) => setReferences(e.target.value)} className={ic} rows={2} /></div>
          <div><label className={label}>{t("new.tags")}</label><input value={tags} onChange={(e) => setTags(e.target.value)} className={ic} /></div>
          <div className="flex gap-3 pt-3">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 border border-sand/50 rounded text-sm text-walnut hover:bg-cream transition-all">{t("suggest.cancel")}</button>
            <button type="submit" disabled={saving} className="flex-1 py-2.5 bg-espresso text-ivory rounded text-sm font-medium hover:bg-ink transition-all disabled:opacity-40">{saving ? "..." : t("edit.save")}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
