import type { Product } from './types';

export type ProductGalleryImage = {
  url: string;
  path: string | null;
};

export const PRODUCT_CATEGORIES: Product['category'][] = [
  'Snuff Bottle',
  'Ring',
  'Bracelet',
  'Earrings',
  'Necklace',
  'Stone Jewelry',
];

export function getProductCategories(productList: Product[] = []) {
  const categories = productList.map((product) => product.category);
  return [...new Set(categories)];
}

export function getProductStoneTypes(productList: Product[] = []) {
  const stones = productList.map((product) => product.stoneType);
  return [...new Set(stones)];
}

export function getProductGalleryImages(product: Product): ProductGalleryImage[] {
  const galleryImages: ProductGalleryImage[] = [];
  const seenUrls = new Set<string>();
  const seenPaths = new Set<string>();
  const imagePaths = Array.isArray(product.imagePaths) ? product.imagePaths : [];

  const addImage = (url: string | null | undefined, path: string | null = null) => {
    if (!url) {
      return;
    }

    if (seenUrls.has(url)) {
      return;
    }

    if (path && seenPaths.has(path)) {
      return;
    }

    seenUrls.add(url);
    if (path) {
      seenPaths.add(path);
    }
    galleryImages.push({ url, path });
  };

  addImage(product.coverImageUrl, product.coverImagePath ?? null);

  product.images.forEach((imageUrl, index) => {
    const imagePath = imagePaths[index] ?? null;
    addImage(imageUrl, imagePath);
  });

  return galleryImages;
}

export function getProductThumbnailImage(product: Product) {
  return getProductGalleryImages(product)[0] ?? null;
}
