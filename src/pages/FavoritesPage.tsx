import { useEffect, useState } from "react";
import { collection, query, where, onSnapshot, documentId } from "firebase/firestore";
import { db } from "../lib/firebase";
import { useAuth } from "../contexts/AuthContext";
import { useLocale } from "../contexts/LocaleContext";
import type { Word } from "../types";
import Icon from "../components/Icon";
import WordCard from "../components/WordCard";

export default function FavoritesPage() {
  const { user, profile } = useAuth();
  const { t } = useLocale();
  const [words, setWords] = useState<Word[]>([]);
  const [loading, setLoading] = useState(true);
  const favIds = profile?.favorites ?? [];

  useEffect(() => {
    if (!user || favIds.length === 0) { setWords([]); setLoading(false); return; }
    const batches: string[][] = [];
    for (let i = 0; i < favIds.length; i += 30) batches.push(favIds.slice(i, i + 30));
    let allWords: Word[] = [];
    let completed = 0;
    const unsubs: (() => void)[] = [];
    for (const batch of batches) {
      const q = query(collection(db, "words"), where(documentId(), "in", batch));
      const unsub = onSnapshot(q, (snap) => {
        const bw = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Word));
        allWords = [...allWords.filter((w) => !batch.includes(w.id)), ...bw];
        completed++;
        if (completed >= batches.length) { setWords(allWords); setLoading(false); }
      });
      unsubs.push(unsub);
    }
    return () => unsubs.forEach((u) => u());
  }, [user, favIds.join(",")]);

  if (!user) return (
    <div className="max-w-xl mx-auto px-5 py-24 text-center">
      <Icon name="heart" size={48} className="mx-auto text-sand mb-4" />
      <p className="text-walnut text-lg font-serif">{t("favorites.login_required")}</p>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto px-5 sm:px-8 py-12">
      <h1 className="font-serif text-3xl font-semibold text-ink mb-2">{t("favorites.title")}</h1>
      <p className="text-stone text-sm mb-10">{t("favorites.subtitle")}</p>
      {loading ? (
        <div className="text-center py-24"><div className="inline-block w-8 h-8 border-2 border-sand border-t-terracotta rounded-full animate-spin" /></div>
      ) : words.length === 0 ? (
        <div className="text-center py-24">
          <Icon name="heart" size={48} className="mx-auto text-sand mb-4" />
          <p className="text-walnut text-lg font-serif">{t("favorites.empty")}</p>
          <p className="text-stone text-sm mt-2">{t("favorites.empty_hint")}</p>
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {words.sort((a, b) => a.term.localeCompare(b.term)).map((w) => (<WordCard key={w.id} word={w} />))}
        </div>
      )}
    </div>
  );
}
