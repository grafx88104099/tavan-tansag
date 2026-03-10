'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  collection,
  doc,
  onSnapshot,
  orderBy,
  query,
  Timestamp,
} from 'firebase/firestore';

import { firestoreDb } from '@/lib/firebase';
import type { FooterMark, HeritageReel, Product, UserProfile } from '@/lib/types';

const FALLBACK_HERITAGE_REEL: HeritageReel = {
  title: '',
  videoUrl: null,
  videoPath: null,
  posterImageUrl: null,
  updatedAt: null,
};

const FALLBACK_FOOTER_MARK: FooterMark = {
  imageUrl: null,
  imagePath: null,
  updatedAt: null,
};

function normalizeTimestamp(value: unknown) {
  if (value instanceof Timestamp) {
    return value.toDate();
  }

  return null;
}

function normalizeRole(value: unknown): UserProfile['role'] {
  return value === 'admin' ? 'admin' : 'customer';
}

function normalizeProduct(id: string, data: Record<string, unknown>): Product | null {
  if (
    typeof data.name !== 'string' ||
    typeof data.category !== 'string' ||
    typeof data.stoneType !== 'string' ||
    typeof data.material !== 'string' ||
    typeof data.description !== 'string' ||
    typeof data.size !== 'string' ||
    typeof data.price !== 'number'
  ) {
    return null;
  }

  return {
    id,
    name: data.name,
    category: data.category as Product['category'],
    stoneType: data.stoneType as Product['stoneType'],
    material: data.material as Product['material'],
    description: data.description,
    size: data.size,
    price: data.price,
    images: Array.isArray(data.images) ? data.images.filter((item): item is string => typeof item === 'string') : [],
    imagePaths: Array.isArray(data.imagePaths)
      ? data.imagePaths.map((item) => (typeof item === 'string' ? item : null))
      : typeof data.coverImagePath === 'string'
        ? [data.coverImagePath]
        : [],
    coverImageUrl: typeof data.coverImageUrl === 'string' ? data.coverImageUrl : null,
    coverImagePath: typeof data.coverImagePath === 'string' ? data.coverImagePath : null,
    coverImageHint: typeof data.coverImageHint === 'string' ? data.coverImageHint : null,
    createdAt: normalizeTimestamp(data.createdAt),
    updatedAt: normalizeTimestamp(data.updatedAt),
  };
}

function normalizeHeritageReel(data: Record<string, unknown> | undefined): HeritageReel {
  if (!data) {
    return FALLBACK_HERITAGE_REEL;
  }

  return {
    title: typeof data.title === 'string' ? data.title : FALLBACK_HERITAGE_REEL.title,
    videoUrl: typeof data.videoUrl === 'string' ? data.videoUrl : null,
    videoPath: typeof data.videoPath === 'string' ? data.videoPath : null,
    posterImageUrl: typeof data.posterImageUrl === 'string' ? data.posterImageUrl : null,
    updatedAt: normalizeTimestamp(data.updatedAt),
  };
}

function normalizeFooterMark(data: Record<string, unknown> | undefined): FooterMark {
  if (!data) {
    return FALLBACK_FOOTER_MARK;
  }

  return {
    imageUrl: typeof data.imageUrl === 'string' ? data.imageUrl : null,
    imagePath: typeof data.imagePath === 'string' ? data.imagePath : null,
    updatedAt: normalizeTimestamp(data.updatedAt),
  };
}

function normalizeUserProfile(id: string, data: Record<string, unknown>): UserProfile {
  return {
    uid: id,
    email: typeof data.email === 'string' ? data.email : null,
    displayName: typeof data.displayName === 'string' ? data.displayName : null,
    photoURL: typeof data.photoURL === 'string' ? data.photoURL : null,
    providerIds: Array.isArray(data.providerIds)
      ? data.providerIds.filter((item): item is string => typeof item === 'string')
      : [],
    role: normalizeRole(data.role),
    createdAt: normalizeTimestamp(data.createdAt),
    updatedAt: normalizeTimestamp(data.updatedAt),
    lastLoginAt: normalizeTimestamp(data.lastLoginAt),
  };
}

export function useCatalogProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(Boolean(firestoreDb));
  const [hasRemoteProducts, setHasRemoteProducts] = useState(false);

  useEffect(() => {
    if (!firestoreDb) {
      setProducts([]);
      setHasRemoteProducts(false);
      setIsLoading(false);
      return;
    }

    const productsQuery = query(collection(firestoreDb, 'products'), orderBy('updatedAt', 'desc'));
    const unsubscribe = onSnapshot(
      productsQuery,
      (snapshot) => {
        const remoteProducts = snapshot.docs
          .map((item) => normalizeProduct(item.id, item.data()))
          .filter((item): item is Product => Boolean(item));

        if (remoteProducts.length > 0) {
          setProducts(remoteProducts);
          setHasRemoteProducts(true);
        } else {
          setProducts([]);
          setHasRemoteProducts(false);
        }

        setIsLoading(false);
      },
      () => {
        setProducts([]);
        setHasRemoteProducts(false);
        setIsLoading(false);
      }
    );

    return unsubscribe;
  }, []);

  return useMemo(
    () => ({
      products,
      isLoading,
      hasRemoteProducts,
    }),
    [hasRemoteProducts, isLoading, products]
  );
}

export function useHeritageReel() {
  const [heritageReel, setHeritageReel] = useState<HeritageReel>(FALLBACK_HERITAGE_REEL);
  const [isLoading, setIsLoading] = useState(Boolean(firestoreDb));

  useEffect(() => {
    if (!firestoreDb) {
      setHeritageReel(FALLBACK_HERITAGE_REEL);
      setIsLoading(false);
      return;
    }

    const unsubscribe = onSnapshot(
      doc(firestoreDb, 'siteSettings', 'heritage'),
      (snapshot) => {
        setHeritageReel(normalizeHeritageReel(snapshot.data()));
        setIsLoading(false);
      },
      () => {
        setHeritageReel(FALLBACK_HERITAGE_REEL);
        setIsLoading(false);
      }
    );

    return unsubscribe;
  }, []);

  return useMemo(
    () => ({
      heritageReel,
      isLoading,
      hasVideo: Boolean(heritageReel.videoUrl),
    }),
    [heritageReel, isLoading]
  );
}

export function useUserProfiles() {
  const [userProfiles, setUserProfiles] = useState<UserProfile[]>([]);
  const [isLoading, setIsLoading] = useState(Boolean(firestoreDb));

  useEffect(() => {
    if (!firestoreDb) {
      setUserProfiles([]);
      setIsLoading(false);
      return;
    }

    const usersQuery = query(collection(firestoreDb, 'users'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(
      usersQuery,
      (snapshot) => {
        setUserProfiles(
          snapshot.docs.map((item) => normalizeUserProfile(item.id, item.data()))
        );
        setIsLoading(false);
      },
      () => {
        setUserProfiles([]);
        setIsLoading(false);
      }
    );

    return unsubscribe;
  }, []);

  return useMemo(
    () => ({
      userProfiles,
      isLoading,
    }),
    [isLoading, userProfiles]
  );
}

export function useFooterMark() {
  const [footerMark, setFooterMark] = useState<FooterMark>(FALLBACK_FOOTER_MARK);
  const [isLoading, setIsLoading] = useState(Boolean(firestoreDb));

  useEffect(() => {
    if (!firestoreDb) {
      setFooterMark(FALLBACK_FOOTER_MARK);
      setIsLoading(false);
      return;
    }

    const unsubscribe = onSnapshot(
      doc(firestoreDb, 'siteSettings', 'footer'),
      (snapshot) => {
        setFooterMark(normalizeFooterMark(snapshot.data()));
        setIsLoading(false);
      },
      () => {
        setFooterMark(FALLBACK_FOOTER_MARK);
        setIsLoading(false);
      }
    );

    return unsubscribe;
  }, []);

  return useMemo(
    () => ({
      footerMark,
      isLoading,
      hasImage: Boolean(footerMark.imageUrl),
    }),
    [footerMark, isLoading]
  );
}
