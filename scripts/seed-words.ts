/**
 * Run with: npx tsx scripts/seed-words.ts
 * Seeds Italian glossary words using Firebase client SDK with anonymous auth.
 * Temporarily requires Firestore rules to allow writes from authenticated users.
 */
import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, serverTimestamp, query, where, getDocs } from "firebase/firestore";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";
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

// Seed account — create or sign in
const SEED_EMAIL = "seed@open-glossary.com";
const SEED_PASS = "SeedScript2026!";

interface SeedWord {
  term: string;
  entryType: "word" | "expression" | "idiom" | "slang" | "proverb";
  translation: string;
  meaning: string;
  examples: string[];
  tags: string[];
  references: string[];
}

const words: SeedWord[] = [
  { term: "Arrampicarsi", entryType: "word", translation: "To climb", meaning: "Salire aggrappandosi con le mani e i piedi o (riferito ad animali) con le zampe.", examples: ["Come lucertole s'arrampicano."], tags: ["verbo", "movimento"], references: ["Frankie Hi-NRG MC — Quelli Che Benpensano"] },
  { term: "Arrampicatore sociale", entryType: "expression", translation: "Social climber", meaning: "Persona che cerca di salire nella scala sociale sfruttando relazioni, opportunismi, o comportamenti calcolati, spesso senza scrupoli.", examples: ["Non mi fido di lui, è un arrampicatore sociale."], tags: ["società", "colloquiale"], references: ["Frankie Hi-NRG MC — Quelli Che Benpensano"] },
  { term: "Barattare", entryType: "word", translation: "To barter / To swap", meaning: "Dare in cambio qualcosa per qualcos'altro.", examples: ["Barattiamo una penna nera per una rossa?"], tags: ["verbo", "scambio"], references: ["Fabrizio De André — Amico Fragile"] },
  { term: "Cordoglio", entryType: "word", translation: "Grief / Deep sorrow", meaning: "Dolore profondo legato a un lutto.", examples: ["Un immenso cordoglio."], tags: ["sentimento", "lutto"], references: ["Carmen Consoli — Parole di burro"] },
  { term: "Ceto", entryType: "word", translation: "Social class", meaning: "Gruppo di persone all'interno della società che condividono una posizione sociale simile.", examples: ["Potrei dire che la mia famiglia è di ceto medio."], tags: ["società"], references: ["Frankie Hi-NRG MC — Quelli Che Benpensano"] },
  { term: "Feritoie", entryType: "word", translation: "Loopholes / Arrow slits", meaning: "Apertura stretta e allungata, tipicamente usata in contesti militari o architettonici.", examples: ["Le feritoie del castello permettevano ai soldati di colpire il nemico senza essere visti."], tags: ["architettura", "poetico"], references: ["Fabrizio De André — Amico fragile"] },
  { term: "Fregarsene", entryType: "expression", translation: "To not give a damn", meaning: "Non dare importanza a qualcosa, non preoccuparsene minimamente.", examples: ["Me ne frego di quello che dice."], tags: ["colloquiale", "verbo pronominale"], references: ["Frankie Hi-NRG MC — Quelli che benpensano"] },
  { term: "Grembo", entryType: "word", translation: "Lap / Womb", meaning: "La concavità compresa tra le ginocchia e il seno di una persona seduta. Figurativamente, il ventre materno. Cavità interna o segreta.", examples: ["Nel grembo umido scuro del tempio — Fabrizio De André"], tags: ["poetico", "polisemico"], references: ["Fabrizio De André — Il sogno di Maria"] },
  { term: "Gremito", entryType: "word", translation: "Packed / Crowded", meaning: "Pieno, per esempio di persone, affollato.", examples: ["La chiesa era gremita di gente."], tags: ["aggettivo"], references: ["Carmen Consoli — Fiori d'arancio"] },
  { term: "Insidia", entryType: "word", translation: "Trap / Snare", meaning: "Qualcosa di ingannevole, poco chiaro, che nasconde un possibile agguato.", examples: ["Ma l'eccezione alla regola insidia la norma — Carmen Consoli"], tags: ["inganno", "poetico"], references: ["Carmen Consoli — L'eccezione"] },
  { term: "Lauta", entryType: "word", translation: "Lavish / Generous", meaning: "Qualcosa di molto vantaggioso, abbondante, splendido.", examples: ["Vorrei che accettassi questa lauta mancia."], tags: ["aggettivo", "formale"], references: ["Carmen Consoli — L'eccezione"] },
  { term: "Manganello", entryType: "word", translation: "Baton / Truncheon", meaning: "Oggetto contundente usato come arma. In senso figurato: violenza, coercizione.", examples: ["Mani che brandiscon manganelli — Frankie Hi-NRG MC"], tags: ["arma", "storia"], references: ["Frankie Hi-NRG MC — Quelli Che Benpensano"] },
  { term: "Movenze", entryType: "word", translation: "Movements / Gestures", meaning: "Il modo di muoversi di una persona, spesso in riferimento a grazia o eleganza.", examples: ["Danzare con movenze agili."], tags: ["eleganza", "corpo"], references: ["Carmen Consoli — L'eccezione"] },
  { term: "Oltralpe", entryType: "word", translation: "Beyond the Alps", meaning: "Di là delle Alpi.", examples: ["Andiamo in vacanza oltralpe."], tags: ["avverbio", "geografia"], references: ["Carmen Consoli — Fiori d'arancio"] },
  { term: "Stuzzicare", entryType: "word", translation: "To tease / To nibble", meaning: "Toccare, provocare o stimolare. Anche: mangiare uno spuntino.", examples: ["Quel profumo mi stuzzica l'appetito."], tags: ["verbo", "cibo"], references: ["Fabrizio De André — Amico Fragile"] },
  { term: "Scoccare", entryType: "word", translation: "To shoot / To spark", meaning: "Senso letterale: viene lanciata. Senso figurato: iniziare, sorgere.", examples: ["Come una freccia dall'arco scocca — Fabrizio De André"], tags: ["poetico", "verbo"], references: ["Fabrizio De André — Bocca di Rosa"] },
  { term: "Scaltro", entryType: "word", translation: "Shrewd / Cunning", meaning: "Accorto, esperto, abile nel valutare situazioni.", examples: ["Un commerciante molto scaltro."], tags: ["aggettivo", "personalità"], references: ["Frankie Hi-NRG MC — Quelli Che Benpensano"] },
  { term: "Sfigato", entryType: "slang", translation: "Loser / Unlucky person", meaning: "Nel linguaggio giovanile, privo di attrattiva, che non ha fortuna.", examples: ["Non esco con sfigati come te."], tags: ["slang", "giovanile"], references: [] },
  { term: "Sfregiare", entryType: "word", translation: "To scar / To disfigure", meaning: "Deturpare, sfigurare con uno o più sfregi.", examples: ["Qualcuno ha sfregiato il muro con delle scritte."], tags: ["verbo", "violenza"], references: ["Frankie Hi-NRG MC — Quelli che benpensano"] },
  { term: "Sgombero", entryType: "word", translation: "Eviction / Clearance", meaning: "Rimozione o evacuazione di persone o oggetti da un luogo.", examples: ["Hanno effettuato uno sgombero dell'appartamento ieri."], tags: ["società", "politica"], references: ["Frankie Hi-NRG MC — Quelli che benpensano"] },
  { term: "Spendere e spandere", entryType: "idiom", translation: "To spend lavishly", meaning: "Spendere senza controllo, sperperare.", examples: ["Quando ha soldi gli piace spendere e spandere."], tags: ["idiomatico", "soldi"], references: ["Frankie Hi-NRG MC — Quelli che benpensano"] },
  { term: "Tirato", entryType: "slang", translation: "Sharp / Well-dressed", meaning: "Vestito in modo molto curato, elegante, impeccabile.", examples: ["Carlo è arrivato molto tirato alla festa."], tags: ["colloquiale", "moda"], references: ["Frankie Hi-NRG MC — Quelli che benpensano"] },
  { term: "Viscido", entryType: "word", translation: "Slimy / Sleazy", meaning: "Scivoloso, appiccicoso. In senso figurato: persona falsa o ripugnante.", examples: ["Mi fa schifo, è un tipo viscido."], tags: ["aggettivo", "figurato"], references: ["Frankie Hi-NRG MC — Quelli che benpensano"] },
  { term: "Zerbino", entryType: "word", translation: "Doormat", meaning: "Piccolo tappeto per pulirsi le scarpe. In senso figurato: persona che si fa calpestare.", examples: ["Si comporta come uno zerbino, accetta ogni critica senza difendersi."], tags: ["figurato", "oggetto"], references: ["Frankie Hi-NRG MC — Quelli Che Benpensano"] },
  { term: "Farcire", entryType: "word", translation: "To stuff / To fill", meaning: "Imbottire con un ripieno.", examples: ["Farcirò le piadine con prosciutto e zucchine grigliate."], tags: ["cucina", "verbo"], references: ["Frankie Hi-NRG MC — Quelli che benpensano"] },
  { term: "Zeppo", entryType: "word", translation: "Packed full", meaning: "Pieno del tutto. Si usa quasi sempre preceduto da 'pieno'.", examples: ["Quel cinema è pieno zeppo di persone."], tags: ["aggettivo", "colloquiale"], references: [] },
  { term: "Dilagare", entryType: "word", translation: "To spread / To overflow", meaning: "Espandersi rapidamente. La diffusione incontrollata di fenomeni.", examples: ["Il dilagare del terrorismo."], tags: ["verbo", "figurato"], references: ["Renzo Stefanel — L'anno che verrà"] },
  { term: "Commiserazione", entryType: "word", translation: "Commiseration / Pity", meaning: "Provare pietà o compassione per qualcuno. Può avere sfumatura negativa.", examples: ["La commiserazione con cui mi guardi mi fa sentire male."], tags: ["sentimento", "formale"], references: ["Renzo Stefanel — L'anno che verrà"] },
  { term: "Fonico", entryType: "word", translation: "Sound engineer / Phonic", meaning: "In linguistica: relativo al suono. In ambito tecnico: la persona che cura l'audio.", examples: ["Fu proprio un fonico leggendario."], tags: ["musica", "linguistica"], references: ["Renzo Stefanel — L'anno che verrà"] },
  { term: "Perentoriamente", entryType: "word", translation: "Peremptorily", meaning: "In modo categorico, senza possibilità di replica.", examples: ["Ha risposto perentoriamente che la decisione era definitiva."], tags: ["avverbio", "formale"], references: ["Renzo Stefanel — L'anno che verrà"] },
  { term: "Scabro", entryType: "word", translation: "Rough / Coarse", meaning: "Ruvido, superficie che genera attrito.", examples: ["Un linguaggio scabro e spigoloso."], tags: ["aggettivo", "letterario"], references: ["Stella Poli — La gioia avvenire"] },
  { term: "Tracotante", entryType: "word", translation: "Arrogant / Overbearing", meaning: "Prepotente, arrogante, presuntuoso, superbo.", examples: ["Un atteggiamento tracotante."], tags: ["aggettivo", "personalità"], references: ["Stella Poli — La gioia avvenire"] },
  { term: "Barlume", entryType: "word", translation: "Glimmer / Faint light", meaning: "Un pizzico, una minima parte di qualcosa.", examples: ["Continuo ad avere un barlume di speranza."], tags: ["figurato", "poetico"], references: ["Stella Poli — La gioia avvenire"] },
  { term: "Blandire", entryType: "word", translation: "To coax / To cajole", meaning: "Convincere qualcuno con parole dolci.", examples: ["Cercava di blandirlo con complimenti."], tags: ["verbo", "persuasione"], references: ["Stella Poli — La gioia avvenire"] },
  { term: "Essere alla frutta", entryType: "idiom", translation: "To be at the end of one's rope", meaning: "Essere stanco, esaurito, al limite. Viene dall'idea del pasto: quando si arriva alla frutta, il pranzo sta finendo.", examples: ["Se continuiamo così, la situazione va alla frutta."], tags: ["idiomatico", "colloquiale"], references: [] },
  { term: "Cavarsela", entryType: "expression", translation: "To manage / To get by", meaning: "Riuscire in qualcosa, uscire da una situazione.", examples: ["Come te la cavi a tennis? Me la cavo abbastanza bene."], tags: ["locuzione", "colloquiale"], references: [] },
  { term: "Farcela", entryType: "expression", translation: "To make it / To succeed", meaning: "Riuscire in qualcosa.", examples: ["Non ce la faccio a imparare nuovo vocabolario."], tags: ["locuzione", "colloquiale"], references: [] },
  { term: "In gamba", entryType: "idiom", translation: "Capable / Smart", meaning: "Espressione colloquiale: persona capace, sveglia, competente.", examples: ["Lei è davvero una ragazza in gamba."], tags: ["idiomatico", "complimento"], references: [] },
  { term: "Sbirciare", entryType: "word", translation: "To peek / To sneak a look", meaning: "Guardare di nascosto.", examples: ["Lo sbirciava dalla finestra."], tags: ["verbo", "colloquiale"], references: ["Stella Poli — La gioia avvenire"] },
  { term: "Redini", entryType: "word", translation: "Reins", meaning: "Finimenti per guidare il cavallo. Fig. Strumento di guida o governo.", examples: ["Lei tiene le redini dei suoi affari."], tags: ["figurato", "potere"], references: ["Carmen Consoli"] },
];

async function seed() {
  // Sign in with email/password (enable Email/Password auth in Firebase Console first)
  let user;
  try {
    const cred = await signInWithEmailAndPassword(auth, SEED_EMAIL, SEED_PASS);
    user = cred.user;
  } catch {
    try {
      const cred = await createUserWithEmailAndPassword(auth, SEED_EMAIL, SEED_PASS);
      user = cred.user;
    } catch (e: any) {
      console.error("Cannot authenticate. Enable Email/Password auth in Firebase Console, or run this after logging in.");
      console.error(e.message);
      process.exit(1);
    }
  }
  console.log(`Authenticated as ${user.email}`);
  console.log(`Seeding ${words.length} Italian words...\n`);

  let added = 0, skipped = 0;

  for (const w of words) {
    const q = query(collection(db, "words"), where("term", "==", w.term), where("language", "==", "it"));
    const existing = await getDocs(q);
    if (!existing.empty) { console.log(`  skip "${w.term}"`); skipped++; continue; }

    await addDoc(collection(db, "words"), {
      term: w.term, entryType: w.entryType, language: "it",
      translation: w.translation, translations: {}, meaning: w.meaning,
      examples: w.examples, references: w.references, tags: w.tags,
      status: "approved", createdBy: user.uid, createdByName: "Il Glossario",
      createdAt: serverTimestamp(), moderatedBy: user.uid, moderatedAt: serverTimestamp(),
    });
    console.log(`  + "${w.term}"`);
    added++;
  }

  console.log(`\nDone! Added: ${added}, Skipped: ${skipped}`);
  process.exit(0);
}

seed().catch((e) => { console.error(e); process.exit(1); });
