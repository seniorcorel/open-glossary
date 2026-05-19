import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../lib/firebase";
import { useLocale } from "../contexts/LocaleContext";
import { useAuth } from "../contexts/AuthContext";
import type { Word } from "../types";
import WordCard from "../components/WordCard";
import Icon from "../components/Icon";

export default function WordDetailPage() {
  const { lang, slug } = useParams<{ lang: string; slug: string }>();
  const { t } = useLocale();
  const { isModerator } = useAuth();
  const navigate = useNavigate();
  const [word, setWord] = useState<Word | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!lang || !slug) return;
    async function load() {
      const q = query(collection(db, "words"), where("slug", "==", slug), where("language", "==", lang));
      const snap = await getDocs(q);
      if (!snap.empty) {
        setWord({ id: snap.docs[0].id, ...snap.docs[0].data() } as Word);
      }
      setLoading(false);
    }
    load();
  }, [lang, slug]);

  function handleShare() {
    const url = window.location.href;
    if (navigator.share) {
      navigator.share({ title: word?.term ?? "", text: `${word?.term} — ${word?.translation}`, url });
    } else {
      navigator.clipboard.writeText(url);
    }
  }

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-5 sm:px-8 py-24 text-center">
        <div className="inline-block w-8 h-8 border-2 border-sand border-t-terracotta rounded-full animate-spin" />
      </div>
    );
  }

  if (!word) {
    return (
      <div className="max-w-xl mx-auto px-5 py-24 text-center">
        <Icon name="book" size={48} className="mx-auto text-sand mb-4" />
        <p className="text-walnut text-lg font-serif">{t("home.no_results")}</p>
        <button onClick={() => navigate("/")} className="mt-4 text-terracotta hover:underline text-sm">
          {t("lang.back_home")}
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-5 sm:px-8 py-12">
      {/* Top bar */}
      <div className="flex items-center justify-between mb-8">
        <button onClick={() => navigate(-1)} className="text-stone hover:text-espresso transition-colors">
          <Icon name="arrow" size={20} />
        </button>
        <button onClick={handleShare} className="flex items-center gap-2 text-sm text-stone hover:text-terracotta transition-all px-3 py-1.5 rounded hover:bg-cream">
          <Icon name="send" size={16} /> {t("word.share")}
        </button>
      </div>

      <WordCard word={word} onDelete={isModerator ? () => { navigate("/"); } : undefined} />
    </div>
  );
}
