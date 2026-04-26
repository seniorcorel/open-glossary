import { useState, useCallback } from "react";
import type { Word } from "../types";
import { LANGUAGES } from "../types";
import { useLocale } from "../contexts/LocaleContext";
import { useAuth } from "../contexts/AuthContext";
import Flag from "./Flag";
import Icon from "./Icon";
import SuggestModal from "./SuggestModal";
import Comments from "./Comments";

const SPEECH_LOCALES: Record<string, string> = {
  it: "it-IT", en: "en-US", es: "es-ES", fr: "fr-FR",
  de: "de-DE", pt: "pt-BR", ja: "ja-JP", ko: "ko-KR",
  zh: "zh-CN", ar: "ar-SA",
};

// Map language code to a default "translation language" (e.g. Italian words translate to English)
const DEFAULT_TRANS_LANG: Record<string, string> = {
  it: "en", en: "es", es: "en", fr: "en", de: "en", pt: "en", ja: "en", ko: "en", zh: "en", ar: "en",
};

interface Props {
  word: Word;
  showStatus?: boolean;
  onApprove?: (id: string) => void;
  onReject?: (id: string) => void;
  onEdit?: (word: Word) => void;
  onDelete?: (id: string) => void;
}

export default function WordCard({ word, showStatus, onApprove, onReject, onEdit, onDelete }: Props) {
  const [showSuggest, setShowSuggest] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const { t } = useLocale();
  const { user, toggleFavorite, isFavorite, isModerator } = useAuth();
  const lang = LANGUAGES.find((l) => l.code === word.language);
  const isPending = word.status === "pending";
  const isRejected = word.status === "rejected";
  const fav = isFavorite(word.id);

  // Determine the translation language flag
  const transLangCode = DEFAULT_TRANS_LANG[word.language] ?? "en";

  const speak = useCallback(() => {
    if (!("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(word.term);
    utterance.lang = SPEECH_LOCALES[word.language] ?? "en-US";
    utterance.rate = 0.85;
    const voices = window.speechSynthesis.getVoices();
    const match = voices.find((v) => v.lang.startsWith(word.language)) ?? voices.find((v) => v.lang === utterance.lang);
    if (match) utterance.voice = match;
    utterance.onstart = () => setSpeaking(true);
    utterance.onend = () => setSpeaking(false);
    utterance.onerror = () => setSpeaking(false);
    window.speechSynthesis.speak(utterance);
  }, [word.term, word.language]);

  // Display name: prefer username
  const displayAuthor = word.createdByName === "Il Glossario"
    ? "Il Glossario"
    : word.createdByName;

  return (
    <>
      <article
        className={`group relative rounded border transition-all duration-300 hover:shadow-lg ${
          isPending
            ? "border-ochre-light/40 bg-cream/60 opacity-75"
            : isRejected
            ? "border-burgundy/20 bg-ivory opacity-50"
            : "border-sand/50 bg-white hover:border-warm-gray/60 hover:shadow-sand/40"
        }`}
      >
        {showStatus && (isPending || isRejected) && (
          <div className={`absolute -top-2.5 left-4 px-3 py-0.5 rounded-full text-[11px] font-medium tracking-wide uppercase ${
            isPending ? "bg-ochre-light/20 text-walnut" : "bg-burgundy/10 text-burgundy"
          }`}>
            {isPending ? t("word.pending") : t("word.rejected")}
          </div>
        )}

        <div className="p-6">
          {/* Meta row */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="text-[11px] tracking-widest uppercase text-stone font-medium">
                {t(`type.${word.entryType ?? "word"}`)}
              </span>
              {word.wordType && (
                <>
                  <span className="text-sand">·</span>
                  <span className="text-[11px] tracking-wide text-stone italic">
                    {t(`wordtype.${word.wordType}`)}
                  </span>
                </>
              )}
              <span className="text-sand">·</span>
              <span className="inline-flex items-center gap-1 text-[11px] text-stone">
                <Flag code={word.language} className="text-xs" /> {lang?.name}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              {isModerator && onDelete && (
                <button
                  onClick={() => onDelete(word.id)}
                  className="text-warm-gray hover:text-burgundy p-1 rounded hover:bg-cream transition-all"
                  title={t("word.delete")}
                >
                  <Icon name="trash" size={15} />
                </button>
              )}
              {user && (
                <button
                  onClick={() => toggleFavorite(word.id)}
                  className={`transition-all hover:scale-110 ${fav ? "text-terracotta" : "text-warm-gray hover:text-terracotta-light"}`}
                  title={fav ? t("word.unfavorite") : t("word.favorite")}
                >
                  <Icon name={fav ? "heart-filled" : "heart"} size={18} />
                </button>
              )}
            </div>
          </div>

          {/* Term */}
          <div className="flex items-baseline gap-3 mb-1">
            <h3 className="font-serif text-2xl font-semibold text-ink leading-tight">{word.term}</h3>
            <button
              onClick={speak}
              className={`shrink-0 w-7 h-7 flex items-center justify-center rounded-full transition-all ${
                speaking ? "bg-terracotta text-white" : "bg-cream text-stone hover:bg-sand/40 hover:text-walnut"
              }`}
              title={t("word.listen")}
            >
              <Icon name="speak" size={14} />
            </button>
          </div>

          {/* Translation with flag */}
          <p className="text-terracotta font-medium text-[15px] mb-3 italic inline-flex items-center gap-1.5">
            <Flag code={transLangCode} className="text-xs" />
            {word.translation}
          </p>

          {/* Meaning */}
          {word.meaning && (
            <p className="text-sm text-walnut/80 leading-relaxed mb-4">{word.meaning}</p>
          )}

          {/* Other translations */}
          {word.translations && Object.keys(word.translations).length > 0 && (
            <div className="mb-4 flex flex-wrap gap-2">
              {Object.entries(word.translations).map(([code, trans]) => {
                const l = LANGUAGES.find((x) => x.code === code);
                return (
                  <span key={code} className="inline-flex items-center gap-1.5 text-xs bg-cream text-walnut px-2.5 py-1 rounded border border-sand/30">
                    <Flag code={code} className="text-xs" /> {l?.name}: <em>{trans}</em>
                  </span>
                );
              })}
            </div>
          )}

          {/* Examples */}
          {word.examples?.length > 0 && (
            <div className="mb-4 space-y-1.5">
              {word.examples.map((ex, i) => (
                <p key={i} className="text-sm text-stone italic pl-4 border-l-2 border-terracotta-light/30 leading-relaxed">
                  «{ex}»
                </p>
              ))}
            </div>
          )}

          {/* Tags */}
          {word.tags?.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-4">
              {word.tags.map((tag) => (
                <span key={tag} className="text-[11px] text-stone bg-cream px-2 py-0.5 rounded-full border border-sand/20">
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between pt-4 border-t border-sand/30">
            <span className="text-[11px] text-stone tracking-wide">{t("word.by")} {displayAuthor}</span>
            <div className="flex items-center gap-2">
              <button onClick={() => setExpanded(!expanded)} className="text-stone hover:text-walnut p-1.5 rounded hover:bg-cream transition-all" title="Comments">
                <Icon name="comment" size={16} />
              </button>
              <button onClick={() => setShowSuggest(true)} className="text-stone hover:text-terracotta p-1.5 rounded hover:bg-cream transition-all" title={t("word.suggest")}>
                <Icon name="lightbulb" size={16} />
              </button>
            </div>
          </div>

          {/* Moderation */}
          {onApprove && onReject && isPending && (
            <div className="flex gap-2 mt-4">
              {onEdit && (
                <button onClick={() => onEdit(word)} className="flex-1 flex items-center justify-center gap-1.5 bg-cream hover:bg-sand/40 text-walnut text-sm py-2.5 rounded font-medium transition-all">
                  <Icon name="edit" size={15} />
                </button>
              )}
              <button onClick={() => onApprove(word.id)} className="flex-1 flex items-center justify-center gap-1.5 bg-approve text-white text-sm py-2.5 rounded font-medium transition-all hover:opacity-90">
                <Icon name="check" size={15} />
              </button>
              <button onClick={() => onReject(word.id)} className="flex-1 flex items-center justify-center gap-1.5 bg-reject text-white text-sm py-2.5 rounded font-medium transition-all hover:opacity-90">
                <Icon name="x" size={15} />
              </button>
            </div>
          )}

          {/* Comments */}
          {expanded && <Comments wordId={word.id} />}
        </div>
      </article>
      {showSuggest && <SuggestModal word={word} onClose={() => setShowSuggest(false)} />}
    </>
  );
}
