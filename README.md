# 📖 Open Glossary

A community-driven multilingual glossary web app. Users can submit words, expressions, idioms, slang, and proverbs with translations, meanings, and examples. Includes Google auth, a moderation workflow, multi-language UI, and portal system for custom-branded instances.

**Live:** [open-glossary.com](https://open-glossary.com)

## Features

- 🔐 Google authentication with unique usernames
- ✍️ Submit words with type, translation, meaning, examples, tags
- 🔊 Text-to-speech pronunciation for any language
- 🛡️ Moderation workflow (approve/reject/edit)
- 💬 Moderated comments on words
- ❤️ Favorites system
- 💡 Suggest changes to existing words
- 📤 Share words as vertical story images with QR code
- 🔍 Instant search with autocomplete
- 🌍 Multi-language UI (EN, ES, IT, FR, PT)
- 🏛️ Portal system: custom domains, branding, and language filtering
- 📱 Fully responsive with mobile-first design
- 🔤 Sticky alphabet navigation bar

## Tech Stack

- **Frontend:** React 19, TypeScript, Tailwind CSS 4, Vite
- **Backend:** Firebase (Auth, Firestore, Hosting)
- **Fonts:** Playfair Display (serif), Inter (sans)
- **Icons:** Custom SVG icon system

## Setup

### 1. Clone and install

```bash
git clone https://github.com/your-repo/open-glossary.git
cd open-glossary
npm install
```

### 2. Firebase project

1. Create a project at [Firebase Console](https://console.firebase.google.com/)
2. Enable **Authentication** → Google sign-in + Email/Password
3. Enable **Cloud Firestore** (production mode)
4. Copy Firestore rules from `firestore.rules`
5. Copy your web app config

### 3. Environment variables

Create `.env`:

```
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
```

### 4. Run locally

```bash
npm run dev
```

### 5. Deploy

```bash
npm run build
npx firebase deploy
```

## Portal System

Portals allow custom-branded instances sharing the same database:

| Portal | Domain | Languages | Style |
|--------|--------|-----------|-------|
| Default | open-glossary.com | All | Editorial warm |
| Il Laboratorio | glosario.illaboratorioitaliano.com | Italian only | Blue academic |

Create portals in Firestore → `portals` collection. See `scripts/create-portals.ts`.

## Scripts

```bash
npx tsx scripts/seed-words.ts          # Seed Italian words
npx tsx scripts/add-slugs.ts           # Add URL slugs to words
npx tsx scripts/translate-to-spanish.ts # Translate words to Spanish
npx tsx scripts/create-portals.ts      # Create portal documents
npx tsx scripts/update-lab-portal.ts   # Update lab portal theme
```

## Project Structure

```
src/
├── components/     # UI components (WordCard, Navbar, modals, etc.)
├── contexts/       # React contexts (Auth, Locale, Portal)
├── i18n/           # Translations (5 languages)
├── lib/            # Firebase config, utilities
├── pages/          # Route pages
└── types.ts        # TypeScript interfaces
```

## Version

Current: **v1.1.0**

## License

MIT
