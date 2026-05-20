/**
 * Updates the laboratorio-italiano portal with blue-accented theme.
 * Run: npx tsx scripts/update-lab-portal.ts
 */
import { initializeApp } from "firebase/app";
import { getFirestore, doc, updateDoc } from "firebase/firestore";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { config } from "dotenv";
config();

const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

async function run() {
  await signInWithEmailAndPassword(auth, "seed@open-glossary.com", "SeedScript2026!");
  console.log("Authenticated.\n");

  await updateDoc(doc(db, "portals", "laboratorio-italiano"), {
    theme: {
      // Base warm neutrals
      bg: "#F6F1E8",
      bgSoft: "#E8EDF2",
      line: "#C8D4DE",
      muted: "#6B8399",
      text: "#2B2622",
      // Blues for buttons and accents
      textStrong: "#385C76",
      accent: "#385C76",
      accentSoft: "#5A8BA8",
      // Fonts
      fontDisplay: '"Cormorant Garamond", "EB Garamond", serif',
      fontBody: '"Inter", "Work Sans", sans-serif',
      // Branding
      logo: "https://illaboratorioitaliano.com/wp-content/uploads/2020/10/cropped-Logo-bianco-fondo-blu-116x117.jpg",
      tagline: "Il glossario della classe — Parole, verbi ed espressioni dalla musica italiana",
      quote: "«Una lingua diversa è una diversa visione della vita.»",
      quoteAuthor: "Federico Fellini",
    },
    footer: {
      copyright: "Il Laboratorio Italiano — 2026",
      website: "https://illaboratorioitaliano.com",
      social: {
        facebook: "https://www.facebook.com/illaboratorioitaliano",
        instagram: "https://www.instagram.com/il_laboratorio_italiano/",
        blog: "https://illaboratorioitaliano.com/blog/",
      },
    },
    seo: {
      title: "Il Laboratorio Italiano — Glossario della classe",
      description: "Glossario collaborativo di italiano: parole, verbi, espressioni e modi di dire dalla musica italiana. Impara l'italiano con la comunità.",
      keywords: ["glossario italiano", "imparare italiano", "parole italiane", "espressioni italiane", "modi di dire italiani", "musica italiana", "vocabolario italiano", "italiano per stranieri", "learn italian", "italian vocabulary", "italian expressions"],
    },
  });
  console.log("+ Updated 'laboratorio-italiano' portal with blue theme");
  console.log("\nDone!");
  process.exit(0);
}

run().catch((e) => { console.error(e); process.exit(1); });
