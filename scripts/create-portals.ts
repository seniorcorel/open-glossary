/**
 * Creates the portals collection with the default portal and the laboratorio italiano portal.
 * Run: npx tsx scripts/create-portals.ts
 */
import { initializeApp } from "firebase/app";
import { getFirestore, doc, setDoc, serverTimestamp } from "firebase/firestore";
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
  const cred = await signInWithEmailAndPassword(auth, "seed@open-glossary.com", "SeedScript2026!");
  console.log("Authenticated.\n");

  // Default portal (open-glossary.com)
  await setDoc(doc(db, "portals", "default"), {
    slug: "default",
    name: "Open Glossary",
    languages: [], // empty = show all languages
    defaultLanguage: "it",
    theme: {
      tagline: "Discover and share words across languages. Built by the community.",
      quote: "«I limiti del mio linguaggio significano i limiti del mio mondo.»",
      quoteAuthor: "Ludwig Wittgenstein",
    },
    createdBy: cred.user.uid,
    createdAt: serverTimestamp(),
  });
  console.log("+ Created 'default' portal");

  // Il Laboratorio Italiano portal
  await setDoc(doc(db, "portals", "laboratorio-italiano"), {
    slug: "laboratorio-italiano",
    name: "Il Laboratorio Italiano",
    domain: "glosario.illaboratorioitaliano.com",
    languages: ["it"],
    defaultLanguage: "it",
    theme: {
      tagline: "Il glossario della classe",
      quote: "«Una lingua diversa è una diversa visione della vita.»",
      quoteAuthor: "Federico Fellini",
    },
    createdBy: cred.user.uid,
    createdAt: serverTimestamp(),
  });
  console.log("+ Created 'laboratorio-italiano' portal");

  console.log("\nDone!");
  process.exit(0);
}

run().catch((e) => { console.error(e); process.exit(1); });
