import { useState, type FormEvent } from "react";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../lib/firebase";
import { useAuth } from "../contexts/AuthContext";
import { useLocale } from "../contexts/LocaleContext";
import type { Word, EntryType, WordType } from "../types";
import { ENTRY_TYPES, WORD_TYPES } from "../types";
import Flag from "./Flag";
import Icon from "./Icon";

interface Props { word: Word; onClose: () => void; }

const DEFAULT_TRANS_LANG: Record<string, string> = {
  it: "en", en: "es", es: "en", fr: "en", de: "en", pt: "en", ja: "en", ko: "en", zh: "en", ar: "en",
};

export default function SuggestModal({ word, onClose }: Props) {
  const { user, profile } = useAuth();
  const { t } = useLocale();
  const [term, setTerm] = useState(word.term);
  const [entryType, setEntryType] = useState<EntryType>(word.entryType ?? "word");
  const [wordType, setWordType] = useState<WordType | "">(word.wordType ?? "");
  const [translation, setTranslation] = useState(word.translation);
  const [meaning, setMeaning] = useState(word.meaning ?? "");
  const [examples, setExamples] = useState((word.examples ?? []).join("\n"));
  const [tags, setTags] = useState((word.tags ?? []).join(", "));
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const transLang = DEFAULT_TRANS_LANG[word.language] ?? "en";

  function getChanges(): Record<string, any> {
    const changes: Record<string, any> = {};
    if (term.trim() !== word.term) changes.term = term.trim();
    if (entryType !== (word.entryType ?? "word")) changes.entryType = entryType;
    if (wordType !== (word.wordType ?? "")) changes.wordType = wordType;
    if (translation.trim() !== word.translation) changes.translation = translation.trim();
    if (meaning.trim() !== (word.meaning ?? "")) changes.meaning = meaning.trim();
    const newExamples = examples.split("\n").map(s => s.trim()).filter(Boolean);
    if (JSON.stringify(newExamples) !== JSON.stringify(word.examples ?? [])) changes.examples = newExamples;
    const newTags = tags.split(",").map(s => s.trim().toLowerCase()).filter(Boolean);
    if (JSON.stringify(newTags) !== JSON.stringify(word.tags ?? [])) changes.tags = newTags;
    return changes;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!user || !profile) return;
    const changes = getChanges();
    if (Object.keys(changes).length === 0) { onClose(); return; }
    setSubmitting(true);
    const summary = Object.keys(changes).join(", ");
    await addDoc(collection(db, "suggestions"), {
      wordId: word.id, wordTerm: word.term,
      field: summary,
      value: JSON.stringify(changes),
      changes,
      reason: reason.trim(),
      status: "pending",
      createdBy: user.uid, createdByName: profile.username || profile.displayName,
      createdAt: serverTimestamp(), moderatedBy: null, moderatedAt: null,
    });
    setDone(true);
    setSubmitting(false);
  }

  if (!user) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/30 backdrop-blur-sm" onClick={onClose}>
        <div className="bg-white rounded border border-sand/30 p-8 max-w-md mx-4 shadow-2xl" onClick={(e) => e.stopPropagation()}>
          <p className="text-walnut text-center">{t("suggest.login_required")}</p>
          <button onClick={onClose} className="mt-4 w-full py-2.5 bg-cream rounded text-sm text-walnut hover:bg-sand/30">{t("suggest.close")}</button>
        </div>
      </div>
    );
  }

  const ic = "w-full border border-sand/50 rounded px-3.5 py-2.5 text-sm bg-ivory focus:outline-none focus:ring-1 focus:ring-terracotta-light/40 focus:border-terracotta-light/40 transition-all";
  const label = "block text-[11px] font-medium text-stone tracking-wide uppercase mb-1.5";
  const hasChanges = Object.keys(getChanges()).length > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/30 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white rounded border border-sand/30 p-8 max-w-lg w-full mx-4 shadow-2xl max-h-[90vh] overflow-y-auto animate-fade-in" onClick={(e) => e.stopPropagation()}>
        {done ? (
          <div className="text-center py-8">
            <Icon name="check" size={40} className="mx-auto text-approve mb-4" />
            <p className="font-serif text-xl text-espresso mb-2">{t("suggest.changes_sent")}</p>
            <p className="text-sm text-stone">{t("suggest.success_sub")}</p>
            <button onClick={onClose} className="mt-6 bg-espresso text-ivory px-8 py-2.5 rounded text-sm font-medium hover:bg-ink transition-all">
              {t("suggest.close")}
            </button>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-serif text-xl text-espresso">{t("suggest.edit_title")} <em>«{word.term}»</em></h3>
              <button onClick={onClose} className="text-stone hover:text-espresso p-1"><Icon name="close" size={18} /></button>
            </div>
            <p className="text-sm text-stone mb-6">{t("suggest.edit_subtitle")}</p>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Entry type */}
              <div>
                <label className={label}>{t("new.entry_type")}</label>
                <div className="flex flex-wrap gap-1.5">
                  {ENTRY_TYPES.map((et) => (
                    <button key={et.code} type="button" onClick={() => setEntryType(et.code)}
                      className={`px-3 py-1.5 rounded text-xs tracking-wide transition-all border ${entryType === et.code ? "bg-espresso text-ivory border-espresso" : "bg-ivory text-walnut border-sand/40 hover:border-warm-gray"}`}>
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

              {/* Term */}
              <div>
                <label className={label}>{t("new.term")}</label>
                <input value={term} onChange={(e) => setTerm(e.target.value)} className={ic} />
              </div>

              {/* Translation with flag */}
              <div>
                <label className={label}>
                  <span className="inline-flex items-center gap-1.5">{t("new.translation")} <Flag code={transLang} className="text-xs" /></span>
                </label>
                <input value={translation} onChange={(e) => setTranslation(e.target.value)} className={ic} />
              </div>

              {/* Meaning */}
              <div>
                <label className={label}>{t("new.meaning")}</label>
                <textarea value={meaning} onChange={(e) => setMeaning(e.target.value)} className={ic} rows={2} />
              </div>

              {/* Examples */}
              <div>
                <label className={label}>{t("new.examples")}</label>
                <textarea value={examples} onChange={(e) => setExamples(e.target.value)} className={ic} rows={2} />
              </div>

              {/* Tags */}
              <div>
                <label className={label}>{t("new.tags")}</label>
                <input value={tags} onChange={(e) => setTags(e.target.value)} className={ic} />
              </div>

              {/* Reason */}
              <div>
                <label className={label}>{t("suggest.reason")}</label>
                <input value={reason} onChange={(e) => setReason(e.target.value)} className={ic} placeholder={t("suggest.reason_placeholder")} />
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={onClose} className="flex-1 py-2.5 border border-sand/50 rounded text-sm text-walnut hover:bg-cream transition-all">
                  {t("suggest.cancel")}
                </button>
                <button type="submit" disabled={submitting || !hasChanges} className="flex-1 py-2.5 bg-espresso text-ivory rounded text-sm font-medium hover:bg-ink transition-all disabled:opacity-30">
                  {submitting ? t("suggest.submitting") : t("suggest.submit")}
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
