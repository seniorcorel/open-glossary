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
import { doc, getDoc, setDoc, updateDoc, arrayUnion, arrayRemove, onSnapshot } from "firebase/firestore";
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
        // Listen for profile changes in real-time
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

  // Set loading false once profile is set
  useEffect(() => {
    if (profile !== null || user === null) setLoading(false);
  }, [profile, user]);

  const isModerator = profile?.role === "moderator" || profile?.role === "admin";
  const isAdmin = profile?.role === "admin";

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

  return (
    <AuthContext.Provider
      value={{ user, profile, loading, signInWithGoogle, logout, isModerator, isAdmin, toggleFavorite, isFavorite }}
    >
      {children}
    </AuthContext.Provider>
  );
}
