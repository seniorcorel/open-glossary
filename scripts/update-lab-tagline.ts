import { initializeApp } from "firebase/app";
import { getFirestore, doc, updateDoc } from "firebase/firestore";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { config } from "dotenv";
config();

const app = initializeApp({
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID,
});
const db = getFirestore(app);
const auth = getAuth(app);

async function run() {
  await signInWithEmailAndPassword(auth, "seed@open-glossary.com", "SeedScript2026!");
  await updateDoc(doc(db, "portals", "laboratorio-italiano"), {
    "theme.tagline": "Il glossario collaborativo della classe — parole, verbi ed espressioni che scopriamo insieme, lezione dopo lezione.",
  });
  console.log("Done!");
  process.exit(0);
}
run().catch((e) => { console.error(e); process.exit(1); });
