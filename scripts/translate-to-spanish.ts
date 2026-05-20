/**
 * Updates all existing Italian words: translates from English to Spanish
 * and sets translationLanguage: "es"
 * Run: npx tsx scripts/translate-to-spanish.ts
 */
import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, doc, updateDoc } from "firebase/firestore";
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

// Manual translations from English to Spanish for our 41 words
const translations: Record<string, string> = {
  "Arrampicarsi": "Trepar / Escalar",
  "Arrampicatore sociale": "Trepador social",
  "Barattare": "Intercambiar / Trocar",
  "Cordoglio": "Duelo / Dolor profundo",
  "Ceto": "Clase social",
  "Feritoie": "Aspilleras / Rendijas",
  "Fregarsene": "No importarle nada",
  "Grembo": "Regazo / Vientre",
  "Gremito": "Repleto / Abarrotado",
  "Insidia": "Trampa / Acechanza",
  "Lauta": "Generosa / Abundante",
  "Manganello": "Porra / Cachiporra",
  "Movenze": "Movimientos / Ademanes",
  "Oltralpe": "Más allá de los Alpes",
  "Stuzzicare": "Provocar / Picar",
  "Scoccare": "Disparar / Surgir",
  "Scaltro": "Astuto / Sagaz",
  "Sfigato": "Perdedor / Desafortunado",
  "Sfregiare": "Desfigurar / Marcar",
  "Sgombero": "Desalojo / Desocupación",
  "Spendere e spandere": "Gastar a manos llenas",
  "Tirato": "Elegante / Bien vestido",
  "Viscido": "Viscoso / Repugnante",
  "Zerbino": "Felpudo / Tapete",
  "Farcire": "Rellenar",
  "Zeppo": "Repleto / Atestado",
  "Dilagare": "Propagarse / Desbordarse",
  "Commiserazione": "Conmiseración / Lástima",
  "Fonico": "Técnico de sonido / Fónico",
  "Perentoriamente": "Perentoriamente / Categóricamente",
  "Scabro": "Áspero / Rugoso",
  "Tracotante": "Arrogante / Prepotente",
  "Barlume": "Destello / Atisbo",
  "Blandire": "Halagar / Persuadir con dulzura",
  "Essere alla frutta": "Estar en las últimas",
  "Cavarsela": "Arreglárselas",
  "Farcela": "Lograrlo / Poder con algo",
  "In gamba": "Capaz / Despierto",
  "Sbirciare": "Espiar / Mirar a hurtadillas",
  "Redini": "Riendas",
};

async function run() {
  await signInWithEmailAndPassword(auth, "seed@open-glossary.com", "SeedScript2026!");
  console.log("Authenticated.\n");

  const snap = await getDocs(collection(db, "words"));
  let updated = 0;
  for (const d of snap.docs) {
    const data = d.data();
    const spanishTranslation = translations[data.term];
    if (spanishTranslation) {
      await updateDoc(doc(db, "words", d.id), {
        translation: spanishTranslation,
        translationLanguage: "es",
      });
      console.log(`  ✓ ${data.term} → ${spanishTranslation}`);
      updated++;
    } else if (!data.translationLanguage) {
      // Just set the language field for any we missed
      await updateDoc(doc(db, "words", d.id), { translationLanguage: "es" });
      console.log(`  ~ ${data.term} (set translationLanguage only)`);
      updated++;
    }
  }
  console.log(`\nDone! Updated ${updated} words.`);
  process.exit(0);
}

run().catch((e) => { console.error(e); process.exit(1); });
