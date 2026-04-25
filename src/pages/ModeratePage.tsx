import { useEffect, useState } from "react";
import { collection, query, where, onSnapshot, doc, updateDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../lib/firebase";
import { useAuth } from "../contexts/AuthContext";
import { useLocale } from "../contexts/LocaleContext";
import type { Word, Suggestion, Comment } from "../types";
import { LANGUAGES } from "../types";
import Flag from "../components/Flag";
import WordCard from "../components/WordCard";
import EditWordModal from "../components/EditWordModal";

export default function ModeratePage() {
  const { user, profile, isModerator } = useAuth();
  const { t } = useLocale();
  const [words, setWords] = useState<Word[]>([]);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"words" | "suggestions" | "comments">("words");
  const [editingWord, setEditingWord] = useState<Word | null>(null);

  const modLangs = profile?.moderatorLanguages ?? [];
  const isAdmin = profile?.role === "admin";

  useEffect(() => {
    if (!isModerator) return;
    const unsub1 = onSnapshot(query(collection(db, "words"), where("status", "==", "pending")), (snap) => {
      let all = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Word));
      // Filter by moderator languages (admins see all)
      if (!isAdmin && modLangs.length > 0) {
        all = all.filter((w) => modLangs.includes(w.language));
      }
      setWords(all.sort((a, b) => (b.createdAt?.seconds ?? 0) - (a.createdAt?.seconds ?? 0)));
      setLoading(false);
    });
    const unsub2 = onSnapshot(query(collection(db, "suggestions"), where("status", "==", "pending")), (snap) => {
      setSuggestions(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Suggestion)).sort((a, b) => (b.createdAt?.seconds ?? 0) - (a.createdAt?.seconds ?? 0)));
    });
    const unsub3 = onSnapshot(query(collection(db, "comments"), where("status", "==", "pending")), (snap) => {
      setComments(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Comment)).sort((a, b) => (b.createdAt?.seconds ?? 0) - (a.createdAt?.seconds ?? 0)));
    });
    return () => { unsub1(); unsub2(); unsub3(); };
  }, [isModerator, isAdmin, modLangs.join(",")]);

  async function handleModerateWord(id: string, status: "approved" | "rejected") {
    if (!user) return;
    await updateDoc(doc(db, "words", id), { status, moderatedBy: user.uid, moderatedAt: serverTimestamp() });
  }
  async function handleModerateSuggestion(id: string, status: "approved" | "rejected") {
    if (!user) return;
    await updateDoc(doc(db, "suggestions", id), { status, moderatedBy: user.uid, moderatedAt: serverTimestamp() });
  }
  async function handleModerateComment(id: string, status: "approved" | "rejected") {
    if (!user) return;
    await updateDoc(doc(db, "comments", id), { status, moderatedBy: user.uid, moderatedAt: serverTimestamp() });
  }

  if (!isModerator) {
    return <div className="max-w-xl mx-auto px-4 py-20 text-center"><p className="text-5xl mb-4">🔒</p><p className="text-charcoal/50 text-lg">{t("moderate.no_access")}</p></div>;
  }

  const tabs = [
    { id: "words" as const, label: t("moderate.words"), count: words.length, icon: "📝" },
    { id: "suggestions" as const, label: t("moderate.suggestions"), count: suggestions.length, icon: "💡" },
    { id: "comments" as const, label: t("moderate.comments"), count: comments.length, icon: "💬" },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-extrabold text-charcoal">{t("moderate.title")}</h1>
        {!isAdmin && modLangs.length > 0 && (
          <div className="flex items-center gap-1.5">
            {modLangs.map((code) => (
              <span key={code} className="inline-flex items-center gap-1 text-xs bg-lavender/40 text-teal px-2 py-1 rounded-full">
                <Flag code={code} className="text-xs" /> {LANGUAGES.find((l) => l.code === code)?.name}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="flex gap-2 mb-8">
        {tabs.map((tb) => (
          <button key={tb.id} onClick={() => setTab(tb.id)} className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${tab === tb.id ? "bg-teal text-white shadow-lg shadow-teal/20" : "bg-cloud text-charcoal/60 hover:bg-soft-gray/40"}`}>
            {tb.icon} {tb.label}
            {tb.count > 0 && <span className={`px-1.5 py-0.5 rounded-full text-xs ${tab === tb.id ? "bg-white/20" : "bg-lavender text-teal"}`}>{tb.count}</span>}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-20"><div className="inline-block w-8 h-8 border-4 border-lavender border-t-teal rounded-full animate-spin" /></div>
      ) : tab === "words" ? (
        words.length === 0 ? (
          <div className="text-center py-20"><p className="text-5xl mb-4">🎉</p><p className="text-charcoal/50">{t("moderate.no_words")}</p></div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {words.map((word) => (
              <WordCard key={word.id} word={word} showStatus onApprove={(id) => handleModerateWord(id, "approved")} onReject={(id) => handleModerateWord(id, "rejected")} onEdit={(w) => setEditingWord(w)} />
            ))}
          </div>
        )
      ) : tab === "suggestions" ? (
        suggestions.length === 0 ? (
          <div className="text-center py-20"><p className="text-5xl mb-4">🎉</p><p className="text-charcoal/50">{t("moderate.no_suggestions")}</p></div>
        ) : (
          <div className="space-y-3">
            {suggestions.map((s) => (
              <div key={s.id} className="bg-white border border-soft-gray/50 rounded-2xl p-5 hover:shadow-md transition-all">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <p className="text-sm text-charcoal/40 mb-1">{t("moderate.word_label")}: <span className="font-medium text-charcoal">{s.wordTerm}</span> · {t("moderate.field_label")}: <span className="font-medium text-teal">{s.field}</span></p>
                    <p className="text-charcoal">{s.value}</p>
                    {s.reason && <p className="text-sm text-charcoal/50 mt-1 italic">"{s.reason}"</p>}
                    <p className="text-xs text-charcoal/30 mt-2">{t("word.by")} {s.createdByName}</p>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <button onClick={() => handleModerateSuggestion(s.id, "approved")} className="bg-teal hover:bg-teal-light text-white text-sm px-4 py-2 rounded-xl font-medium transition-all active:scale-95">✅</button>
                    <button onClick={() => handleModerateSuggestion(s.id, "rejected")} className="bg-coral hover:bg-coral-light text-white text-sm px-4 py-2 rounded-xl font-medium transition-all active:scale-95">❌</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )
      ) : (
        comments.length === 0 ? (
          <div className="text-center py-20"><p className="text-5xl mb-4">🎉</p><p className="text-charcoal/50">{t("moderate.no_comments")}</p></div>
        ) : (
          <div className="space-y-3">
            {comments.map((c) => (
              <div key={c.id} className="bg-white border border-soft-gray/50 rounded-2xl p-5 hover:shadow-md transition-all">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 flex gap-3">
                    {c.createdByPhoto && <img src={c.createdByPhoto} alt="" className="w-8 h-8 rounded-full" />}
                    <div>
                      <p className="text-sm font-medium text-charcoal">{c.createdByName}</p>
                      <p className="text-charcoal/70 mt-0.5">{c.text}</p>
                    </div>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <button onClick={() => handleModerateComment(c.id, "approved")} className="bg-teal hover:bg-teal-light text-white text-sm px-4 py-2 rounded-xl font-medium transition-all active:scale-95">✅</button>
                    <button onClick={() => handleModerateComment(c.id, "rejected")} className="bg-coral hover:bg-coral-light text-white text-sm px-4 py-2 rounded-xl font-medium transition-all active:scale-95">❌</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )
      )}

      {editingWord && <EditWordModal word={editingWord} onClose={() => setEditingWord(null)} />}
    </div>
  );
}
