import { useEffect, useState } from "react";
import { collection, query, where, onSnapshot, doc, updateDoc, deleteDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../lib/firebase";
import { useAuth } from "../contexts/AuthContext";
import { useLocale } from "../contexts/LocaleContext";
import type { Word, Suggestion, Comment } from "../types";
import { LANGUAGES } from "../types";
import Flag from "../components/Flag";
import Icon from "../components/Icon";
import WordCard from "../components/WordCard";
import EditWordModal from "../components/EditWordModal";
import ConfirmModal from "../components/ConfirmModal";

export default function ModeratePage() {
  const { user, profile, isModerator } = useAuth();
  const { t } = useLocale();
  const [words, setWords] = useState<Word[]>([]);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"words" | "suggestions" | "comments">("words");
  const [editingWord, setEditingWord] = useState<Word | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const modLangs = profile?.moderatorLanguages ?? [];
  const isAdmin = profile?.role === "admin";

  useEffect(() => {
    if (!isModerator) return;
    const unsub1 = onSnapshot(query(collection(db, "words"), where("status", "==", "pending")), (snap) => {
      let all = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Word));
      if (!isAdmin && modLangs.length > 0) all = all.filter((w) => modLangs.includes(w.language));
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

  async function moderate(col: string, id: string, status: "approved" | "rejected") {
    if (!user) return;
    await updateDoc(doc(db, col, id), { status, moderatedBy: user.uid, moderatedAt: serverTimestamp() });
  }

  if (!isModerator) return (
    <div className="max-w-xl mx-auto px-5 py-24 text-center">
      <Icon name="shield" size={48} className="mx-auto text-sand mb-4" />
      <p className="text-walnut text-lg font-serif">{t("moderate.no_access")}</p>
    </div>
  );

  const tabs = [
    { id: "words" as const, label: t("moderate.words"), count: words.length },
    { id: "suggestions" as const, label: t("moderate.suggestions"), count: suggestions.length },
    { id: "comments" as const, label: t("moderate.comments"), count: comments.length },
  ];

  return (
    <div className="max-w-6xl mx-auto px-5 sm:px-8 py-12">
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-serif text-3xl font-semibold text-ink">{t("moderate.title")}</h1>
        {!isAdmin && modLangs.length > 0 && (
          <div className="flex items-center gap-1.5">
            {modLangs.map((code) => (
              <span key={code} className="inline-flex items-center gap-1 text-[11px] bg-cream text-walnut px-2.5 py-1 rounded border border-sand/30">
                <Flag code={code} className="text-xs" /> {LANGUAGES.find((l) => l.code === code)?.name}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="flex gap-1 mb-10 border-b border-sand/40">
        {tabs.map((tb) => (
          <button key={tb.id} onClick={() => setTab(tb.id)}
            className={`px-5 py-3 text-sm tracking-wide transition-all border-b-2 -mb-px ${tab === tb.id ? "text-espresso border-terracotta font-medium" : "text-stone border-transparent hover:text-walnut"}`}>
            {tb.label}
            {tb.count > 0 && <span className={`ml-2 text-[11px] px-1.5 py-0.5 rounded-full ${tab === tb.id ? "bg-terracotta/10 text-terracotta" : "bg-cream text-stone"}`}>{tb.count}</span>}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-24"><div className="inline-block w-8 h-8 border-2 border-sand border-t-terracotta rounded-full animate-spin" /></div>
      ) : tab === "words" ? (
        words.length === 0 ? (
          <div className="text-center py-24"><p className="text-walnut font-serif text-lg">{t("moderate.no_words")}</p></div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {words.map((w) => (<WordCard key={w.id} word={w} showStatus onApprove={(id) => moderate("words", id, "approved")} onReject={(id) => moderate("words", id, "rejected")} onEdit={(w) => setEditingWord(w)} onDelete={(id) => setDeleteId(id)} />))}
          </div>
        )
      ) : tab === "suggestions" ? (
        suggestions.length === 0 ? (
          <div className="text-center py-24"><p className="text-walnut font-serif text-lg">{t("moderate.no_suggestions")}</p></div>
        ) : (
          <div className="space-y-3">
            {suggestions.map((s) => (
              <div key={s.id} className="bg-white border border-sand/40 rounded p-6 hover:shadow-md transition-all">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <p className="text-[11px] text-stone tracking-wide uppercase mb-1">{t("moderate.word_label")}: <span className="text-espresso font-medium normal-case">{s.wordTerm}</span> · {t("moderate.field_label")}: <span className="text-terracotta font-medium normal-case">{s.field}</span></p>
                    <p className="text-espresso mt-1">{s.value}</p>
                    {s.reason && <p className="text-sm text-stone mt-2 italic">«{s.reason}»</p>}
                    <p className="text-[11px] text-stone mt-3">{t("word.by")} {s.createdByName}</p>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <button onClick={() => moderate("suggestions", s.id, "approved")} className="bg-approve text-white text-sm px-4 py-2 rounded font-medium transition-all hover:opacity-90"><Icon name="check" size={16} /></button>
                    <button onClick={() => moderate("suggestions", s.id, "rejected")} className="bg-reject text-white text-sm px-4 py-2 rounded font-medium transition-all hover:opacity-90"><Icon name="x" size={16} /></button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )
      ) : (
        comments.length === 0 ? (
          <div className="text-center py-24"><p className="text-walnut font-serif text-lg">{t("moderate.no_comments")}</p></div>
        ) : (
          <div className="space-y-3">
            {comments.map((c) => (
              <div key={c.id} className="bg-white border border-sand/40 rounded p-6 hover:shadow-md transition-all">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 flex gap-3">
                    {c.createdByPhoto && <img src={c.createdByPhoto} alt="" className="w-8 h-8 rounded-full ring-1 ring-sand" />}
                    <div>
                      <p className="text-sm font-medium text-espresso">{c.createdByName}</p>
                      <p className="text-walnut/70 mt-0.5">{c.text}</p>
                    </div>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <button onClick={() => moderate("comments", c.id, "approved")} className="bg-approve text-white text-sm px-4 py-2 rounded font-medium transition-all hover:opacity-90"><Icon name="check" size={16} /></button>
                    <button onClick={() => moderate("comments", c.id, "rejected")} className="bg-reject text-white text-sm px-4 py-2 rounded font-medium transition-all hover:opacity-90"><Icon name="x" size={16} /></button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )
      )}
      {editingWord && <EditWordModal word={editingWord} onClose={() => setEditingWord(null)} />}
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
