export type WordStatus = "pending" | "approved" | "rejected";
export type UserRole = "user" | "moderator" | "admin";
export type UILocale = "en" | "es" | "it" | "fr" | "pt";
export type EntryType = "word" | "expression" | "idiom" | "slang" | "proverb";

export const ENTRY_TYPES: { code: EntryType; icon: string }[] = [
  { code: "word", icon: "📗" },
  { code: "expression", icon: "💬" },
  { code: "idiom", icon: "🎭" },
  { code: "slang", icon: "🤙" },
  { code: "proverb", icon: "📜" },
];

export type WordType = "noun" | "verb" | "adjective" | "adverb" | "pronoun" | "preposition" | "conjunction" | "interjection" | "phrase" | "other";

export const WORD_TYPES: WordType[] = [
  "noun", "verb", "adjective", "adverb", "pronoun", "preposition", "conjunction", "interjection", "phrase", "other",
];

export interface Word {
  id: string;
  term: string;
  entryType: EntryType;
  wordType?: WordType;
  language: string;
  translation: string;
  translations: Record<string, string>;
  meaning: string;
  examples: string[];
  references: string[];
  tags: string[];
  status: WordStatus;
  createdBy: string;
  createdByName: string;
  createdAt: any;
  moderatedBy: string | null;
  moderatedAt: any;
}

export interface Comment {
  id: string;
  wordId: string;
  text: string;
  status: "pending" | "approved" | "rejected";
  createdBy: string;
  createdByName: string;
  createdByPhoto: string | null;
  createdAt: any;
  moderatedBy: string | null;
  moderatedAt: any;
}

export interface Suggestion {
  id: string;
  wordId: string;
  wordTerm: string;
  field: string;
  value: string;
  changes?: Record<string, any>;
  reason: string;
  status: "pending" | "approved" | "rejected";
  createdBy: string;
  createdByName: string;
  createdAt: any;
  moderatedBy: string | null;
  moderatedAt: any;
}

export interface UserProfile {
  uid: string;
  username?: string;
  displayName: string;
  email: string;
  photoURL: string | null;
  role: UserRole;
  moderatorLanguages?: string[];
  favorites?: string[];
}

export const LANGUAGES = [
  { code: "it", name: "Italiano" },
  { code: "en", name: "English" },
  { code: "es", name: "Español" },
  { code: "fr", name: "Français" },
  { code: "de", name: "Deutsch" },
  { code: "pt", name: "Português" },
  { code: "ja", name: "日本語" },
  { code: "ko", name: "한국어" },
  { code: "zh", name: "中文" },
  { code: "ar", name: "العربية" },
] as const;
