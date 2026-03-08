'use client';

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import {
  GoogleAuthProvider,
  browserLocalPersistence,
  createUserWithEmailAndPassword,
  onIdTokenChanged,
  setPersistence,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
  type User,
} from 'firebase/auth';
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  Timestamp,
} from 'firebase/firestore';

import { firebaseAuth, firestoreDb } from '@/lib/firebase';
import type { SavedProductRecord, UserProfile } from '@/lib/types';

type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated';

type EmailSignInInput = {
  email: string;
  password: string;
};

type EmailSignUpInput = {
  displayName: string;
  email: string;
  password: string;
};

type AuthContextValue = {
  authStatus: AuthStatus;
  currentUser: User | null;
  profile: UserProfile | null;
  savedProducts: SavedProductRecord[];
  savedProductIds: string[];
  isConfigured: boolean;
  signInWithEmail: (input: EmailSignInInput) => Promise<void>;
  signUpWithEmail: (input: EmailSignUpInput) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOutUser: () => Promise<void>;
  toggleSavedProduct: (productId: string) => Promise<boolean>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

function normalizeTimestamp(value: unknown) {
  if (value instanceof Timestamp) {
    return value.toDate();
  }

  return null;
}

function buildProfileFromUser(user: User): UserProfile {
  const providerIds = user.providerData
    .map((item) => item.providerId)
    .filter((providerId): providerId is string => Boolean(providerId));

  return {
    uid: user.uid,
    email: user.email ?? null,
    displayName: user.displayName ?? null,
    photoURL: user.photoURL ?? null,
    providerIds,
    createdAt: null,
    updatedAt: null,
    lastLoginAt: null,
  };
}

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

async function ensureLocalPersistence() {
  if (!firebaseAuth) {
    throw new Error('Firebase Auth тохируулаагүй байна.');
  }

  await setPersistence(firebaseAuth, browserLocalPersistence);
}

async function upsertUserProfile(user: User) {
  if (!firestoreDb) {
    return;
  }

  const profileRef = doc(firestoreDb, 'users', user.uid);
  const profileSnapshot = await getDoc(profileRef);
  const basePayload = {
    uid: user.uid,
    email: user.email ?? null,
    displayName: user.displayName ?? null,
    photoURL: user.photoURL ?? null,
    providerIds: user.providerData
      .map((item) => item.providerId)
      .filter((providerId): providerId is string => Boolean(providerId)),
    updatedAt: serverTimestamp(),
    lastLoginAt: serverTimestamp(),
  };

  if (profileSnapshot.exists()) {
    await setDoc(profileRef, basePayload, { merge: true });
    return;
  }

  await setDoc(
    profileRef,
    {
      ...basePayload,
      createdAt: serverTimestamp(),
    },
    { merge: true }
  );
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [authStatus, setAuthStatus] = useState<AuthStatus>('loading');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [savedProducts, setSavedProducts] = useState<SavedProductRecord[]>([]);

  useEffect(() => {
    if (!firebaseAuth) {
      setAuthStatus('unauthenticated');
      return;
    }

    void ensureLocalPersistence().catch(() => null);

    const unsubscribe = onIdTokenChanged(firebaseAuth, (user) => {
      setCurrentUser(user);
      setAuthStatus(user ? 'authenticated' : 'unauthenticated');
    });

    return unsubscribe;
  }, []);

  useEffect(() => {
    if (!currentUser) {
      setProfile(null);
      setSavedProducts([]);
      return;
    }

    if (!firestoreDb) {
      setProfile(buildProfileFromUser(currentUser));
      setSavedProducts([]);
      return;
    }

    void upsertUserProfile(currentUser).catch(() => null);

    const profileRef = doc(firestoreDb, 'users', currentUser.uid);
    const savedProductsQuery = query(
      collection(firestoreDb, 'users', currentUser.uid, 'savedProducts'),
      orderBy('savedAt', 'desc')
    );

    const unsubscribeProfile = onSnapshot(
      profileRef,
      (snapshot) => {
        if (!snapshot.exists()) {
          setProfile(buildProfileFromUser(currentUser));
          return;
        }

        const data = snapshot.data();
        setProfile({
          uid: currentUser.uid,
          email: typeof data.email === 'string' ? data.email : currentUser.email ?? null,
          displayName:
            typeof data.displayName === 'string' ? data.displayName : currentUser.displayName ?? null,
          photoURL: typeof data.photoURL === 'string' ? data.photoURL : currentUser.photoURL ?? null,
          providerIds: Array.isArray(data.providerIds)
            ? data.providerIds.filter((item): item is string => typeof item === 'string')
            : buildProfileFromUser(currentUser).providerIds,
          createdAt: normalizeTimestamp(data.createdAt),
          updatedAt: normalizeTimestamp(data.updatedAt),
          lastLoginAt: normalizeTimestamp(data.lastLoginAt),
        });
      },
      () => {
        setProfile(buildProfileFromUser(currentUser));
      }
    );

    const unsubscribeSavedProducts = onSnapshot(
      savedProductsQuery,
      (snapshot) => {
        setSavedProducts(
          snapshot.docs.map((item) => {
            const data = item.data();
            return {
              productId: typeof data.productId === 'string' ? data.productId : item.id,
              savedAt: normalizeTimestamp(data.savedAt),
            };
          })
        );
      },
      () => {
        setSavedProducts([]);
      }
    );

    return () => {
      unsubscribeProfile();
      unsubscribeSavedProducts();
    };
  }, [currentUser]);

  const savedProductIds = useMemo(
    () => savedProducts.map((item) => item.productId),
    [savedProducts]
  );

  const value = useMemo<AuthContextValue>(
    () => ({
      authStatus,
      currentUser,
      profile,
      savedProducts,
      savedProductIds,
      isConfigured: Boolean(firebaseAuth && firestoreDb),
      async signInWithEmail({ email, password }) {
        if (!firebaseAuth) {
          throw new Error('Firebase Auth тохируулаагүй байна.');
        }

        await ensureLocalPersistence();
        const credentials = await signInWithEmailAndPassword(
          firebaseAuth,
          normalizeEmail(email),
          password
        );
        await upsertUserProfile(credentials.user);
      },
      async signUpWithEmail({ displayName, email, password }) {
        if (!firebaseAuth) {
          throw new Error('Firebase Auth тохируулаагүй байна.');
        }

        await ensureLocalPersistence();

        const credentials = await createUserWithEmailAndPassword(
          firebaseAuth,
          normalizeEmail(email),
          password
        );

        if (displayName.trim()) {
          await updateProfile(credentials.user, { displayName: displayName.trim() });
        }

        await upsertUserProfile(firebaseAuth.currentUser ?? credentials.user);
      },
      async signInWithGoogle() {
        if (!firebaseAuth) {
          throw new Error('Firebase Auth тохируулаагүй байна.');
        }

        await ensureLocalPersistence();

        const provider = new GoogleAuthProvider();
        provider.setCustomParameters({ prompt: 'select_account' });

        const credentials = await signInWithPopup(firebaseAuth, provider);
        await upsertUserProfile(credentials.user);
      },
      async signOutUser() {
        if (!firebaseAuth) {
          return;
        }

        await signOut(firebaseAuth);
      },
      async toggleSavedProduct(productId: string) {
        if (!currentUser || !firestoreDb) {
          throw new Error('Хадгалахын тулд нэвтэрнэ үү.');
        }

        const savedProductRef = doc(firestoreDb, 'users', currentUser.uid, 'savedProducts', productId);
        const isSaved = savedProductIds.includes(productId);

        if (isSaved) {
          await deleteDoc(savedProductRef);
          return false;
        }

        await setDoc(savedProductRef, {
          productId,
          savedAt: serverTimestamp(),
        });

        return true;
      },
    }),
    [authStatus, currentUser, profile, savedProductIds, savedProducts]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within AuthProvider.');
  }

  return context;
}
