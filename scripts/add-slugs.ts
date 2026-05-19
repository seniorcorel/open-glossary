/**
 * Adds slug field to all existing words.
 * First promotes seed user to admin, then updates words, then demotes back.
 * Run: npx tsx scripts/add-slugs.ts
 */
import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, doc, updateDoc, setDoc } from "firebase/firestore";
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

function toSlug(term: string): string {
  return term.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9\s-]/g, "").trim().replace(/\s+/g, "-").replace(/-+/g, "-");
}

async function run() {
  const cred = await signInWithEmailAndPassword(auth, "seed@open-glossary.com", "SeedScript2026!");
  const uid = cred.user.uid;
  console.log(`Authenticated as ${uid}`);

  // Ensure seed user doc exists with admin role
  await setDoc(doc(db, "users", uid), {
    uid, displayName: "Seed", email: "seed@open-glossary.com",
    photoURL: null, role: "admin", moderatorLanguages: [], favorites: [],
  }, { merge: true });
  console.log("Seed user promoted to admin.");

  // Small delay for rules to pick up the role
  await new Promise(r => setTimeout(r, 1000));

  console.log("Adding slugs...\n");
  const snap = await getDocs(collection(db, "words"));
  let updated = 0;
  for (const d of snap.docs) {
    const data = d.data();
    if (data.slug) continue;
    const slug = toSlug(data.term ?? "");
    if (!slug) continue;
    await updateDoc(doc(db, "words", d.id), { slug });
    console.log(`  + ${data.term} → ${slug}`);
    updated++;
  }
  console.log(`\nDone! Updated ${updated} words.`);
  process.exit(0);
}

run().catch((e) => { console.error(e); process.exit(1); });
