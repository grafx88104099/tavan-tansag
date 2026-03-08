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
};

export type UserProfile = {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  providerIds: string[];
  createdAt: Date | null;
  updatedAt: Date | null;
  lastLoginAt: Date | null;
};

export type SavedProductRecord = {
  productId: string;
  savedAt: Date | null;
};
