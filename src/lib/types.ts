export type Product = {
  id: string;
  name: string;
  category: 'Snuff Bottle' | 'Ring' | 'Bracelet' | 'Earrings' | 'Necklace' | 'Stone Jewelry';
  stoneType: 'Turquoise' | 'Jade' | 'Coral' | 'Lapis Lazuli' | 'Agate' | 'None';
  material: 'Silver' | 'Gold' | 'Bronze' | 'Mixed';
  description: string;
  size: string;
  price: number;
  images: string[];
  coverImageUrl?: string | null;
  coverImagePath?: string | null;
  coverImageHint?: string | null;
  createdAt?: Date | null;
  updatedAt?: Date | null;
};

export type UserProfile = {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  providerIds: string[];
  role: 'customer' | 'admin';
  createdAt: Date | null;
  updatedAt: Date | null;
  lastLoginAt: Date | null;
};

export type SavedProductRecord = {
  productId: string;
  savedAt: Date | null;
};

export type HeritageReel = {
  title: string;
  videoUrl: string | null;
  videoPath: string | null;
  posterImageUrl: string | null;
  updatedAt: Date | null;
};
