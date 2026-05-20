interface Props {
  letters: string[];
}

export default function AlphabetSidebar({ letters }: Props) {
  if (letters.length === 0) return null;

  return (
    <>
      {/* Desktop — fixed right sidebar */}
      <nav className="fixed right-2 sm:right-4 top-1/2 -translate-y-1/2 z-40 hidden lg:flex flex-col gap-0.5" aria-label="Alphabet index">
        {letters.map((letter) => (
          <a
            key={letter}
            href={`#letter-${letter}`}
            className="w-7 h-7 flex items-center justify-center rounded text-[11px] font-serif font-semibold text-stone hover:text-espresso hover:bg-cream transition-all"
            title={letter}
          >
            {letter}
          </a>
        ))}
      </nav>

      {/* Mobile + Tablet — sticky horizontal bar */}
      <div className="sticky top-[57px] z-30 lg:hidden bg-ivory/95 backdrop-blur-sm border-b border-sand/30 py-2 px-3 -mx-5 sm:-mx-8 mb-6">
        <div className="flex gap-1 overflow-x-auto scrollbar-none">
          {letters.map((letter) => (
            <a
              key={letter}
              href={`#letter-${letter}`}
              className="w-7 h-7 flex items-center justify-center shrink-0 rounded text-[12px] font-serif font-semibold text-stone hover:text-espresso hover:bg-cream active:bg-sand/40 transition-all"
            >
              {letter}
            </a>
          ))}
        </div>
      </div>
    </>
  );
}
