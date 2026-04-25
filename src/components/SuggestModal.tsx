import { useState, type FormEvent } from "react";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../lib/firebase";
import { useAuth } from "../contexts/AuthContext";
import { useLocale } from "../contexts/LocaleContext";
import type { Word } from "../types";

interface Props {
  word: Word;
  onClose: () => void;
}

export default function SuggestModal({ word, onClose }: Props) {
  const { user, profile } = useAuth();
  const { t } = useLocale();
  const [field, setField] = useState("translation");
  const [value, setValue] = useState("");
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const fields = [
    { value: "translation", label: t("suggest.field_translation") },
    { value: "meaning", label: t("suggest.field_meaning") },
    { value: "examples", label: t("suggest.field_examples") },
    { value: "tags", label: t("suggest.field_tags") },
    { value: "other", label: t("suggest.field_other") },
  ];

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!user || !profile) return;
    setSubmitting(true);
    await addDoc(collection(db, "suggestions"), {
      wordId: word.id,
      wordTerm: word.term,
      field,
      value: value.trim(),
      reason: reason.trim(),
      status: "pending",
      createdBy: user.uid,
      createdByName: profile.displayName,
      createdAt: serverTimestamp(),
      moderatedBy: null,
      moderatedAt: null,
    });
    setDone(true);
    setSubmitting(false);
  }

  if (!user) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-charcoal/40 backdrop-blur-sm" onClick={onClose}>
        <div className="bg-white rounded-2xl p-6 max-w-md mx-4 shadow-2xl" onClick={(e) => e.stopPropagation()}>
          <p className="text-charcoal/60 text-center">{t("suggest.login_required")}</p>
          <button onClick={onClose} className="mt-4 w-full py-2 bg-cloud rounded-xl text-sm text-charcoal/60 hover:bg-soft-gray/40">{t("suggest.close")}</button>
        </div>
      </div>
    );
  }

  const inputClass = "w-full border border-soft-gray/50 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal/40 focus:border-transparent";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-charcoal/40 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        {done ? (
          <div className="text-center py-4">
            <p className="text-4xl mb-3">🎉</p>
            <p className="text-lg font-medium text-charcoal">{t("suggest.success")}</p>
            <p className="text-sm text-charcoal/50 mt-1">{t("suggest.success_sub")}</p>
            <button onClick={onClose} className="mt-4 px-6 py-2 bg-teal text-white rounded-xl text-sm hover:bg-teal-light transition-all">
              {t("suggest.close")}
            </button>
          </div>
        ) : (
          <>
            <h3 className="text-lg font-bold text-charcoal mb-1">{t("suggest.title")} "{word.term}"</h3>
            <p className="text-sm text-charcoal/50 mb-4">{t("suggest.subtitle")}</p>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-charcoal/70 mb-1">{t("suggest.field")}</label>
                <select value={field} onChange={(e) => setField(e.target.value)} className={inputClass}>
                  {fields.map((f) => <option key={f.value} value={f.value}>{f.label}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-charcoal/70 mb-1">{t("suggest.suggestion")}</label>
                <textarea required value={value} onChange={(e) => setValue(e.target.value)} rows={3} className={inputClass} />
              </div>
              <div>
                <label className="block text-sm font-medium text-charcoal/70 mb-1">{t("suggest.reason")}</label>
                <input value={reason} onChange={(e) => setReason(e.target.value)} className={inputClass} placeholder={t("suggest.reason_placeholder")} />
              </div>
              <div className="flex gap-2 pt-2">
                <button type="button" onClick={onClose} className="flex-1 py-2 bg-cloud rounded-xl text-sm text-charcoal/60 hover:bg-soft-gray/40 transition-all">
                  {t("suggest.cancel")}
                </button>
                <button type="submit" disabled={submitting} className="flex-1 py-2 bg-gradient-to-r from-teal to-teal-light text-white rounded-xl text-sm font-medium hover:shadow-lg transition-all disabled:opacity-50">
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
