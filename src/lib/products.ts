import type { Product } from './types';

export const PRODUCT_CATEGORIES: Product['category'][] = [
  'Snuff Bottle',
  'Ring',
  'Bracelet',
  'Earrings',
  'Necklace',
  'Stone Jewelry',
];

export const PRODUCT_STONE_TYPES: Product['stoneType'][] = [
  'Turquoise',
  'Jade',
  'Coral',
  'Lapis Lazuli',
  'Agate',
  'None',
];

export const PRODUCT_MATERIALS: Product['material'][] = ['Silver', 'Gold', 'Bronze', 'Mixed'];

const products: Product[] = [
  {
    id: '1',
    name: 'Khan\'s Legacy Snuff Bottle',
    category: 'Snuff Bottle',
    stoneType: 'Turquoise',
    material: 'Silver',
    description: 'A masterpiece of silversmithing, this snuff bottle features intricate dragon motifs and is adorned with a large, high-quality turquoise stone, symbolizing sky and good fortune.',
    size: '8cm x 5cm',
    price: 1200,
    images: ['product-snuff-bottle-1', 'hero-home'],
  },
  {
    id: '2',
    name: 'Empress Jade Snuff Bottle',
    category: 'Snuff Bottle',
    stoneType: 'Jade',
    material: 'Gold',
    description: 'Carved from a single piece of flawless white jade, this bottle is a symbol of purity and status. The stopper is crafted from 24k gold, adding to its luxurious feel.',
    size: '7cm x 4.5cm',
    price: 2500,
    images: ['product-snuff-bottle-2', 'heritage-craftsmanship'],
  },
  {
    id: '3',
    name: 'Steppe Warrior Ring',
    category: 'Ring',
    stoneType: 'Lapis Lazuli',
    material: 'Silver',
    description: 'A heavy, substantial ring designed for a commanding presence. The deep blue of the lapis lazuli is reminiscent of the Mongolian night sky, set in hand-hammered silver.',
    size: 'US 11',
    price: 450,
    images: ['product-ring-1'],
  },
  {
    id: '4',
    name: 'Nomad\'s Coral Ring',
    category: 'Ring',
    stoneType: 'Coral',
    material: 'Gold',
    description: 'This elegant ring features a vibrant red coral, prized in Mongolian culture for its protective qualities. The delicate gold band is twisted to resemble rope, a nod to nomadic life.',
    size: 'US 7',
    price: 680,
    images: ['product-ring-2'],
  },
  {
    id: '5',
    name: 'Eternal Knot Bracelet',
    category: 'Bracelet',
    stoneType: 'None',
    material: 'Bronze',
    description: 'A solid bronze cuff engraved with the Ulzii, or eternal knot, a symbol of endless wisdom and compassion. Its powerful design makes it a statement piece.',
    size: 'Adjustable, 3cm width',
    price: 320,
    images: ['product-bracelet-1'],
  },
  {
    id: '6',
    name: 'Sky Dancer Earrings',
    category: 'Earrings',
    stoneType: 'Turquoise',
    material: 'Silver',
    description: 'Lightweight and graceful, these silver earrings feature dangling turquoise beads that dance with every movement. They are inspired by the flowing garments of traditional dancers.',
    size: '5cm length',
    price: 210,
    images: ['product-earrings-1'],
  },
  {
    id: '7',
    name: 'Ger-Mothers\'s Coral Necklace',
    category: 'Necklace',
    stoneType: 'Coral',
    material: 'Silver',
    description: 'A traditional multi-strand necklace made with precious red coral beads and ornate silver spacers. A centerpiece of any traditional attire, passed down through generations.',
    size: '45cm length',
    price: 1800,
    images: ['product-necklace-1'],
  },
  {
    id: '8',
    name: 'Gobi Agate Pendant',
    category: 'Stone Jewelry',
    stoneType: 'Agate',
    material: 'Silver',
    description: 'A unique pendant featuring a naturally patterned agate sourced from the Gobi desert. The stone is polished to a high shine and set in a simple, elegant silver clasp.',
    size: 'Pendant is 6cm x 4cm',
    price: 390,
    images: ['product-stone-1'],
  },
];

export function getProducts() {
  return products;
}

export function getProductById(id: string) {
  return products.find((p) => p.id === id);
}

export function getProductCategories(productList = products) {
  const categories = productList.map((p) => p.category);
  return [...new Set(categories)];
}

export function getProductStoneTypes(productList = products) {
  const stones = productList.map((p) => p.stoneType);
  return [...new Set(stones)];
}
