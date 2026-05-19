import { useState, useRef, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useLocale } from "../contexts/LocaleContext";
import type { Word } from "../types";
import Flag from "./Flag";
import Icon from "./Icon";

interface Props {
  letters: string[];
  words: Word[];
  onSelectWord: (word: Word) => void;
  onAddNew: () => void;
}

export default function StickyToolbar({ letters, words, onSelectWord, onAddNew }: Props) {
  const { user } = useAuth();
  const { t } = useLocale();
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (searchOpen && inputRef.current) inputRef.current.focus();
  }, [searchOpen]);

  const suggestions = query.trim().length >= 1
    ? words.filter((w) => {
        const q = query.toLowerCase();
        return w.term.toLowerCase().includes(q) || w.translation.toLowerCase().includes(q);
      }).slice(0, 4)
    : [];

  function handleSelect(word: Word) {
    setQuery("");
    setSearchOpen(false);
    onSelectWord(word);
  }

  return (
    <div className="sticky top-[57px] z-30 bg-ivory/95 backdrop-blur-sm border-b border-sand/30 py-2 px-3 sm:px-5 -mx-5 sm:-mx-8">
      <div className="flex items-center gap-2">
        {/* Search toggle / input */}
        {searchOpen ? (
          <div className="relative flex-1 min-w-0">
            <Icon name="search" size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onBlur={() => { if (!query) setTimeout(() => setSearchOpen(false), 200); }}
              placeholder={t("home.search")}
              className="w-full pl-9 pr-8 py-2 border border-sand/50 rounded text-sm bg-white focus:outline-none focus:ring-1 focus:ring-terracotta-light/40"
            />
            <button onClick={() => { setQuery(""); setSearchOpen(false); }} className="absolute right-2 top-1/2 -translate-y-1/2 text-stone hover:text-espresso">
              <Icon name="close" size={14} />
            </button>
            {/* Suggestions dropdown */}
            {suggestions.length > 0 && (
              <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-sand/50 rounded shadow-lg z-20 overflow-hidden">
                {suggestions.map((w) => (
                  <button key={w.id} type="button" onMouseDown={() => handleSelect(w)}
                    className="w-full text-left px-3 py-2.5 hover:bg-cream transition-all border-b border-sand/10 last:border-0 flex items-center gap-2">
                    <span className="text-sm font-serif font-medium text-ink truncate">{w.term}</span>
                    <span className="text-[11px] text-stone italic truncate">{w.translation}</span>
                    <Flag code={w.language} className="text-xs shrink-0 ml-auto" />
                  </button>
                ))}
              </div>
            )}
          </div>
        ) : (
          <button onClick={() => setSearchOpen(true)}
            className="w-8 h-8 flex items-center justify-center rounded bg-cream border border-sand/30 text-stone hover:text-espresso hover:border-warm-gray transition-all shrink-0">
            <Icon name="search" size={15} />
          </button>
        )}

        {/* Add new button */}
        {user && !searchOpen && (
          <button onClick={onAddNew}
            className="w-8 h-8 flex items-center justify-center rounded bg-espresso text-ivory hover:bg-ink transition-all shrink-0">
            <Icon name="plus" size={15} />
          </button>
        )}

        {/* Divider */}
        {!searchOpen && <div className="w-px h-5 bg-sand/50 shrink-0" />}

        {/* Letters */}
        {!searchOpen && (
          <div className="flex gap-0.5 overflow-x-auto scrollbar-none flex-1">
            {letters.map((letter) => (
              <a key={letter} href={`#letter-${letter}`}
                className="w-7 h-7 flex items-center justify-center shrink-0 rounded text-[12px] font-serif font-semibold text-stone hover:text-espresso hover:bg-cream active:bg-sand/40 transition-all">
                {letter}
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
