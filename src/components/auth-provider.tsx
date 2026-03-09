'use client';

import { FirebaseError } from 'firebase/app';
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
  getRedirectResult,
  onIdTokenChanged,
  setPersistence,
  signInWithEmailAndPassword,
  signInWithPopup,
  signInWithRedirect,
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

import { isAllowedAdminEmail } from '@/lib/admin-access';
import { getAuthErrorMessage } from '@/lib/auth-utils';
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
  isAdmin: boolean;
  isConfigured: boolean;
  authErrorMessage: string | null;
  clearAuthError: () => void;
  signInWithEmail: (input: EmailSignInInput) => Promise<void>;
  signUpWithEmail: (input: EmailSignUpInput) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOutUser: () => Promise<void>;
  toggleSavedProduct: (productId: string) => Promise<boolean>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

const DEFAULT_ROLE: UserProfile['role'] = 'customer';

function normalizeTimestamp(value: unknown) {
  if (value instanceof Timestamp) {
    return value.toDate();
  }

  return null;
}

function normalizeRole(value: unknown): UserProfile['role'] {
  return value === 'admin' ? 'admin' : DEFAULT_ROLE;
}

function resolveUserRole(user: User, data?: Record<string, unknown>): UserProfile['role'] {
  if (data && (data.role === 'admin' || data.role === 'customer')) {
    return normalizeRole(data.role);
  }

  if (isAllowedAdminEmail(user.email)) {
    return 'admin';
  }

  return DEFAULT_ROLE;
}

function buildProfileFromUser(user: User, role = resolveUserRole(user)): UserProfile {
  const providerIds = user.providerData
    .map((item) => item.providerId)
    .filter((providerId): providerId is string => Boolean(providerId));

  return {
    uid: user.uid,
    email: user.email ?? null,
    displayName: user.displayName ?? null,
    photoURL: user.photoURL ?? null,
    providerIds,
    role,
    createdAt: null,
    updatedAt: null,
    lastLoginAt: null,
  };
}

function buildProfileFromSnapshot(user: User, data?: Record<string, unknown>) {
  const fallbackProfile = buildProfileFromUser(user);

  if (!data) {
    return fallbackProfile;
  }

  return {
    uid: user.uid,
    email: typeof data.email === 'string' ? data.email : user.email ?? null,
    displayName:
      typeof data.displayName === 'string' ? data.displayName : user.displayName ?? null,
    photoURL: typeof data.photoURL === 'string' ? data.photoURL : user.photoURL ?? null,
    providerIds: Array.isArray(data.providerIds)
      ? data.providerIds.filter((item): item is string => typeof item === 'string')
      : fallbackProfile.providerIds,
    role: resolveUserRole(user, data),
    createdAt: normalizeTimestamp(data.createdAt),
    updatedAt: normalizeTimestamp(data.updatedAt),
    lastLoginAt: normalizeTimestamp(data.lastLoginAt),
  } satisfies UserProfile;
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
  const existingData = profileSnapshot.exists()
    ? (profileSnapshot.data() as Record<string, unknown>)
    : undefined;
  const role = resolveUserRole(user, existingData);
  const basePayload = {
    uid: user.uid,
    email: user.email ?? null,
    displayName: user.displayName ?? null,
    photoURL: user.photoURL ?? null,
    providerIds: user.providerData
      .map((item) => item.providerId)
      .filter((providerId): providerId is string => Boolean(providerId)),
    role,
    updatedAt: serverTimestamp(),
    lastLoginAt: serverTimestamp(),
  };
  const legacyPayload = {
    uid: user.uid,
    email: user.email ?? null,
    displayName: user.displayName ?? null,
    photoURL: user.photoURL ?? null,
    providerIds: basePayload.providerIds,
    updatedAt: serverTimestamp(),
    lastLoginAt: serverTimestamp(),
  };

  try {
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
  } catch (error) {
    if (!(error instanceof FirebaseError) || error.code !== 'permission-denied') {
      throw error;
    }

    // Backward compatibility for projects still running older Firestore rules
    // that do not yet allow the `role` field on user profiles.
    if (profileSnapshot.exists()) {
      await setDoc(profileRef, legacyPayload, { merge: true });
      return;
    }

    await setDoc(
      profileRef,
      {
        ...legacyPayload,
        createdAt: serverTimestamp(),
      },
      { merge: true }
    );
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [authStatus, setAuthStatus] = useState<AuthStatus>('loading');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [savedProducts, setSavedProducts] = useState<SavedProductRecord[]>([]);
  const [authErrorMessage, setAuthErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!firebaseAuth) {
      setAuthStatus('unauthenticated');
      return;
    }

    void ensureLocalPersistence().catch(() => null);
    void getRedirectResult(firebaseAuth)
      .then((result) => {
        if (result?.user) {
          setAuthErrorMessage(null);
          return upsertUserProfile(result.user);
        }

        return null;
      })
      .catch((error) => {
        console.error('Firebase redirect auth failed:', error);
        setAuthErrorMessage(getAuthErrorMessage(error));
      });

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
        setProfile(buildProfileFromSnapshot(currentUser, data));
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
  const isAdmin = profile?.role === 'admin' || isAllowedAdminEmail(currentUser?.email);

  const value = useMemo<AuthContextValue>(
    () => ({
      authStatus,
      currentUser,
      profile,
      savedProducts,
      savedProductIds,
      isAdmin,
      isConfigured: Boolean(firebaseAuth && firestoreDb),
      authErrorMessage,
      clearAuthError() {
        setAuthErrorMessage(null);
      },
      async signInWithEmail({ email, password }) {
        if (!firebaseAuth) {
          throw new Error('Firebase Auth тохируулаагүй байна.');
        }

        setAuthErrorMessage(null);
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

        setAuthErrorMessage(null);
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

        setAuthErrorMessage(null);
        await ensureLocalPersistence();

        const provider = new GoogleAuthProvider();
        provider.setCustomParameters({ prompt: 'select_account' });
        try {
          const credentials = await signInWithPopup(firebaseAuth, provider);
          await upsertUserProfile(credentials.user);
        } catch (error) {
          if (
            error instanceof FirebaseError &&
            (error.code === 'auth/popup-blocked' ||
              error.code === 'auth/operation-not-supported-in-this-environment')
          ) {
            await signInWithRedirect(firebaseAuth, provider);
            return;
          }

          throw error;
        }
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
    [authErrorMessage, authStatus, currentUser, isAdmin, profile, savedProductIds, savedProducts]
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
