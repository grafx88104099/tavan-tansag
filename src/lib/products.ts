import type { Product } from './types';

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
