import { useEffect, useState, type FormEvent } from "react";
import { collection, query, where, onSnapshot, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../lib/firebase";
import { useAuth } from "../contexts/AuthContext";
import { useLocale } from "../contexts/LocaleContext";
import Icon from "./Icon";
import type { Comment } from "../types";

interface Props { wordId: string; }

export default function Comments({ wordId }: Props) {
  const { user, profile } = useAuth();
  const { t } = useLocale();
  const [comments, setComments] = useState<Comment[]>([]);
  const [text, setText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    const q = query(collection(db, "comments"), where("wordId", "==", wordId), where("status", "==", "approved"));
    const unsub = onSnapshot(q, (snap) => {
      setComments(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Comment)).sort((a, b) => (b.createdAt?.seconds ?? 0) - (a.createdAt?.seconds ?? 0)));
    });
    return unsub;
  }, [wordId]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!user || !profile || !text.trim()) return;
    setSubmitting(true);
    await addDoc(collection(db, "comments"), {
      wordId, text: text.trim(), status: "pending",
      createdBy: user.uid, createdByName: profile.displayName, createdByPhoto: user.photoURL,
      createdAt: serverTimestamp(), moderatedBy: null, moderatedAt: null,
    });
    setText("");
    setSubmitting(false);
  }

  const visible = showAll ? comments : comments.slice(0, 3);

  return (
    <div className="mt-4 pt-4 border-t border-sand/30">
      <p className="text-[11px] font-medium text-stone tracking-wide uppercase mb-3">
        {t("comments.title")} ({comments.length})
      </p>
      {visible.map((c) => (
        <div key={c.id} className="flex gap-2.5 mb-3">
          {c.createdByPhoto && <img src={c.createdByPhoto} alt="" className="w-6 h-6 rounded-full mt-0.5 ring-1 ring-sand" />}
          <div className="flex-1 min-w-0">
            <p className="text-xs leading-relaxed">
              <span className="font-medium text-espresso">{c.createdByName}</span>{" "}
              <span className="text-walnut/70">{c.text}</span>
            </p>
          </div>
        </div>
      ))}
      {comments.length > 3 && !showAll && (
        <button onClick={() => setShowAll(true)} className="text-xs text-terracotta hover:text-terracotta-light mb-3 tracking-wide">
          {t("comments.show_all")} ({comments.length})
        </button>
      )}
      {user ? (
        <form onSubmit={handleSubmit} className="flex gap-2 mt-2">
          <input value={text} onChange={(e) => setText(e.target.value)} placeholder={t("comments.placeholder")}
            className="flex-1 text-xs border border-sand/50 rounded px-3 py-2 bg-ivory focus:outline-none focus:ring-1 focus:ring-terracotta-light/40 focus:border-terracotta-light/40" />
          <button type="submit" disabled={submitting || !text.trim()}
            className="text-xs bg-espresso text-ivory px-3 py-2 rounded hover:bg-ink transition-all disabled:opacity-30">
            <Icon name="send" size={14} />
          </button>
        </form>
      ) : (
        <p className="text-[11px] text-stone italic">{t("comments.login_required")}</p>
      )}
    </div>
  );
}
