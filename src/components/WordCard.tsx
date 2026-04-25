import { useState } from "react";
import type { Word } from "../types";
import { LANGUAGES, ENTRY_TYPES } from "../types";
import { useLocale } from "../contexts/LocaleContext";
import { useAuth } from "../contexts/AuthContext";
import Flag from "./Flag";
import SuggestModal from "./SuggestModal";
import Comments from "./Comments";

interface Props {
  word: Word;
  showStatus?: boolean;
  onApprove?: (id: string) => void;
  onReject?: (id: string) => void;
  onEdit?: (word: Word) => void;
}

const TYPE_COLORS: Record<string, string> = {
  word: "bg-lavender/40 text-teal border-lavender-dark/30",
  expression: "bg-mint/30 text-teal border-mint-dark/30",
  idiom: "bg-lavender/50 text-charcoal border-lavender-dark/40",
  slang: "bg-peach/40 text-coral border-coral/20",
  proverb: "bg-mint/20 text-charcoal border-mint-dark/20",
};

export default function WordCard({ word, showStatus, onApprove, onReject, onEdit }: Props) {
  const [showSuggest, setShowSuggest] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const { t } = useLocale();
  const { user, toggleFavorite, isFavorite } = useAuth();
  const lang = LANGUAGES.find((l) => l.code === word.language);
  const isPending = word.status === "pending";
  const isRejected = word.status === "rejected";
  const entryType = ENTRY_TYPES.find((e) => e.code === word.entryType) ?? ENTRY_TYPES[0];
  const typeColor = TYPE_COLORS[word.entryType ?? "word"] ?? TYPE_COLORS.word;
  const fav = isFavorite(word.id);

  return (
    <>
      <div
        className={`group relative rounded-2xl border transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${
          isPending
            ? "border-peach bg-peach/20 opacity-70"
            : isRejected
            ? "border-coral/30 bg-coral/5 opacity-50"
            : "border-soft-gray/60 bg-white hover:border-lavender-dark hover:shadow-lavender/30"
        }`}
      >
        {showStatus && (isPending || isRejected) && (
          <div className={`absolute -top-2.5 left-4 px-2.5 py-0.5 rounded-full text-xs font-medium ${
            isPending ? "bg-peach text-charcoal" : "bg-coral/20 text-coral"
          }`}>
            {isPending ? t("word.pending") : t("word.rejected")}
          </div>
        )}

        <div className="p-5">
          {/* Type + Language + Favorite */}
          <div className="flex items-center gap-1.5 mb-3">
            <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full border ${typeColor}`}>
              {entryType.icon} {t(`type.${word.entryType ?? "word"}`)}
            </span>
            <span className="inline-flex items-center gap-1 text-xs bg-cloud text-charcoal/60 px-2 py-0.5 rounded-full">
              <Flag code={word.language} className="text-xs" /> {lang?.name}
            </span>
            <div className="ml-auto">
              {user && (
                <button
                  onClick={() => toggleFavorite(word.id)}
                  className={`text-lg transition-all hover:scale-110 ${fav ? "text-coral" : "text-soft-gray hover:text-coral-light"}`}
                  title={fav ? t("word.unfavorite") : t("word.favorite")}
                >
                  {fav ? "❤️" : "🤍"}
                </button>
              )}
            </div>
          </div>

          {/* Term + Translation */}
          <h3 className="text-xl font-bold text-charcoal tracking-tight">{word.term}</h3>
          <p className="text-teal font-medium mt-0.5 mb-2">{word.translation}</p>

          {word.meaning && (
            <p className="text-sm text-charcoal/70 leading-relaxed mb-3">{word.meaning}</p>
          )}

          {/* Other translations */}
          {word.translations && Object.keys(word.translations).length > 0 && (
            <div className="mb-3 flex flex-wrap gap-1.5">
              {Object.entries(word.translations).map(([code, trans]) => {
                const l = LANGUAGES.find((x) => x.code === code);
                return (
                  <span key={code} className="inline-flex items-center gap-1 text-xs bg-lavender/30 text-teal px-2 py-1 rounded-lg">
                    <Flag code={code} className="text-xs" /> {l?.name}: {trans}
                  </span>
                );
              })}
            </div>
          )}

          {/* Examples */}
          {word.examples?.length > 0 && (
            <div className="mb-3 space-y-1">
              {word.examples.map((ex, i) => (
                <p key={i} className="text-sm text-charcoal/50 italic pl-3 border-l-2 border-lavender-dark">"{ex}"</p>
              ))}
            </div>
          )}

          {/* Tags */}
          {word.tags?.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-3">
              {word.tags.map((tag) => (
                <span key={tag} className="text-xs bg-cloud text-charcoal/50 px-2 py-0.5 rounded-full">#{tag}</span>
              ))}
            </div>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between pt-3 border-t border-soft-gray/30">
            <span className="text-xs text-charcoal/40">{t("word.by")} {word.createdByName}</span>
            <div className="flex items-center gap-1">
              <button onClick={() => setExpanded(!expanded)} className="text-xs text-charcoal/40 hover:text-teal hover:bg-lavender/20 px-2 py-1 rounded-lg transition-all">
                💬
              </button>
              <button onClick={() => setShowSuggest(true)} className="text-xs text-teal hover:text-teal-light hover:bg-lavender/20 px-2 py-1 rounded-lg transition-all">
                {t("word.suggest")}
              </button>
            </div>
          </div>

          {/* Moderation */}
          {onApprove && onReject && isPending && (
            <div className="flex gap-2 mt-3">
              {onEdit && (
                <button onClick={() => onEdit(word)} className="flex-1 bg-lavender hover:bg-lavender-dark text-charcoal text-sm py-2 rounded-xl font-medium transition-all active:scale-95">✏️</button>
              )}
              <button onClick={() => onApprove(word.id)} className="flex-1 bg-teal hover:bg-teal-light text-white text-sm py-2 rounded-xl font-medium transition-all active:scale-95">✅</button>
              <button onClick={() => onReject(word.id)} className="flex-1 bg-coral hover:bg-coral-light text-white text-sm py-2 rounded-xl font-medium transition-all active:scale-95">❌</button>
            </div>
          )}

          {/* Comments */}
          {expanded && <Comments wordId={word.id} />}
        </div>
      </div>
      {showSuggest && <SuggestModal word={word} onClose={() => setShowSuggest(false)} />}
    </>
  );
}
