import { useEffect, useState } from "react";
import type { Word } from "../types";
import { LANGUAGES } from "../types";
import { useLocale } from "../contexts/LocaleContext";
import Flag from "./Flag";
import Icon from "./Icon";
import WordCard from "./WordCard";
import ShareCard from "./ShareCard";

interface Props {
  word: Word;
  onClose: () => void;
  onDelete?: (id: string) => void;
}

export default function WordDetailModal({ word, onClose, onDelete }: Props) {
  const { t } = useLocale();
  const [showShare, setShowShare] = useState(false);

  useEffect(() => {
    const prevUrl = window.location.pathname;
    const slug = word.slug || word.id;
    const newUrl = `/${word.language}/${slug}`;
    window.history.pushState({ modal: true }, "", newUrl);

    function handlePopState() { onClose(); }
    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("popstate", handlePopState);
      if (window.location.pathname === newUrl) {
        window.history.replaceState(null, "", prevUrl);
      }
    };
  }, [word, onClose]);

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/30 backdrop-blur-sm" onClick={onClose}>
        <div className="bg-ivory rounded border border-sand/30 max-w-2xl w-full mx-4 shadow-2xl max-h-[90vh] overflow-y-auto animate-fade-in" onClick={(e) => e.stopPropagation()}>
          {/* Header bar */}
          <div className="sticky top-0 bg-ivory/95 backdrop-blur-sm border-b border-sand/30 px-6 py-3 flex items-center justify-between z-10">
            <div className="flex items-center gap-2 text-[11px] text-stone tracking-wide">
              <Flag code={word.language} className="text-sm" />
              <span>{LANGUAGES.find((l) => l.code === word.language)?.name}</span>
              <span className="text-sand">/</span>
              <span className="text-espresso font-medium">{word.term}</span>
            </div>
            <div className="flex items-center gap-1">
              <button onClick={() => setShowShare(true)}
                className="w-8 h-8 flex items-center justify-center rounded bg-cream border border-sand/30 text-stone hover:text-terracotta hover:border-terracotta/30 transition-all"
                title={t("word.share")}>
                <Icon name="send" size={14} />
              </button>
              <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded text-stone hover:text-espresso hover:bg-cream transition-all">
                <Icon name="close" size={16} />
              </button>
            </div>
          </div>

          {/* Word card content */}
          <div className="p-6">
            <WordCard word={word} onDelete={onDelete} />
          </div>
        </div>
      </div>

      {showShare && <ShareCard word={word} onClose={() => setShowShare(false)} />}
    </>
  );
}
