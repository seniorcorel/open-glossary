import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import {
  onAuthStateChanged,
  signInWithPopup,
  signOut,
  type User,
} from "firebase/auth";
import { doc, getDoc, setDoc, updateDoc, arrayUnion, arrayRemove, onSnapshot, collection, query, where, getDocs } from "firebase/firestore";
import { auth, googleProvider, db } from "../lib/firebase";
import type { UserProfile } from "../types";

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  isModerator: boolean;
  isAdmin: boolean;
  toggleFavorite: (wordId: string) => Promise<void>;
  isFavorite: (wordId: string) => boolean;
  updateUsername: (username: string) => Promise<{ ok: boolean; error?: string }>;
  needsUsername: boolean;
}

const AuthContext = createContext<AuthContextType>(null!);

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    return onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        const profileRef = doc(db, "users", firebaseUser.uid);
        const snap = await getDoc(profileRef);
        if (snap.exists()) {
          setProfile(snap.data() as UserProfile);
        } else {
          const newProfile: UserProfile = {
            uid: firebaseUser.uid,
            displayName: firebaseUser.displayName ?? "Anónimo",
            email: firebaseUser.email ?? "",
            photoURL: firebaseUser.photoURL,
            role: "user",
            moderatorLanguages: [],
            favorites: [],
          };
          await setDoc(profileRef, newProfile);
          setProfile(newProfile);
        }
        const unsub = onSnapshot(profileRef, (docSnap) => {
          if (docSnap.exists()) setProfile(docSnap.data() as UserProfile);
        });
        return unsub;
      } else {
        setProfile(null);
      }
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    if (profile !== null || user === null) setLoading(false);
  }, [profile, user]);

  const isModerator = profile?.role === "moderator" || profile?.role === "admin";
  const isAdmin = profile?.role === "admin";
  const needsUsername = !!user && !!profile && !profile.username;

  async function signInWithGoogle() {
    await signInWithPopup(auth, googleProvider);
  }

  async function logout() {
    await signOut(auth);
  }

  const toggleFavorite = useCallback(async (wordId: string) => {
    if (!user) return;
    const ref = doc(db, "users", user.uid);
    const favs = profile?.favorites ?? [];
    if (favs.includes(wordId)) {
      await updateDoc(ref, { favorites: arrayRemove(wordId) });
    } else {
      await updateDoc(ref, { favorites: arrayUnion(wordId) });
    }
  }, [user, profile]);

  const isFavorite = useCallback((wordId: string) => {
    return (profile?.favorites ?? []).includes(wordId);
  }, [profile]);

  const updateUsername = useCallback(async (username: string): Promise<{ ok: boolean; error?: string }> => {
    if (!user) return { ok: false, error: "Not logged in" };
    const clean = username.trim().toLowerCase().replace(/[^a-z0-9._-]/g, "");
    if (clean.length < 3) return { ok: false, error: "min_length" };
    if (clean.length > 24) return { ok: false, error: "max_length" };
    // Check uniqueness
    const q = query(collection(db, "users"), where("username", "==", clean));
    const snap = await getDocs(q);
    if (!snap.empty && snap.docs[0].id !== user.uid) return { ok: false, error: "taken" };
    await updateDoc(doc(db, "users", user.uid), { username: clean });
    return { ok: true };
  }, [user]);

  return (
    <AuthContext.Provider
      value={{ user, profile, loading, signInWithGoogle, logout, isModerator, isAdmin, toggleFavorite, isFavorite, updateUsername, needsUsername }}
    >
      {children}
    </AuthContext.Provider>
  );
}
