interface Props {
  code: string;
  className?: string;
}

// Map language codes to country codes for flag-icons
const LANG_TO_COUNTRY: Record<string, string> = {
  en: "gb",
  es: "es",
  it: "it",
  fr: "fr",
  de: "de",
  pt: "br",
  ja: "jp",
  ko: "kr",
  zh: "cn",
  ar: "sa",
};

export default function Flag({ code, className = "" }: Props) {
  const country = LANG_TO_COUNTRY[code] ?? code;
  return (
    <span
      className={`fi fi-${country} inline-block rounded-sm ${className}`}
      style={{ fontSize: "1em", lineHeight: 1 }}
    />
  );
}
