import type { Product } from './types';

const categoryLabels: Record<Product['category'], string> = {
  'Snuff Bottle': 'Хөөрөг',
  Ring: 'Бөгж',
  Bracelet: 'Бугуйвч',
  Earrings: 'Ээмэг',
  Necklace: 'Хүзүүний зүүлт',
  'Stone Jewelry': 'Чулуун гоёл',
};

const stoneLabels: Record<Product['stoneType'], string> = {
  Turquoise: 'Оюу',
  Jade: 'Хаш',
  Coral: 'Шүр',
  'Lapis Lazuli': 'Номин',
  Agate: 'Мана',
  None: 'Чулуугүй',
};

const materialLabels: Record<Product['material'], string> = {
  Silver: 'Мөнгө',
  Gold: 'Алт',
  Bronze: 'Хүрэл',
  Mixed: 'Холимог хийц',
};

const productCopy: Record<string, { name: string; description: string }> = {
  '1': {
    name: 'Хааны өв хөөрөг',
    description:
      'Луу хээтэй мөнгөн хүрээг тэнгэрийг бэлгэдэх оюугаар чимсэн, үе дамжин хадгалах эрхэм хөөрөг.',
  },
  '2': {
    name: 'Хатан хаш хөөрөг',
    description:
      'Цагаан хашны тунгалаг өнгө, алтан толгойн чамин харьцааг нэгтгэсэн дээдсийн хийцтэй бүтээл.',
  },
  '3': {
    name: 'Талын дайчны бөгж',
    description:
      'Номин чулуун гүн өнгө, нүдтэй мөнгөн суурь нь зориг тэвчээрийг илэрхийлсэн хүчтэй бөгж.',
  },
  '4': {
    name: 'Нүүдэлчний шүрэн бөгж',
    description:
      'Шүрэн чулуун халуун өнгийг алтан мушгиа хүрээтэй хослуулсан, амьдралын эрч хүчийг бэлгэдэх бөгж.',
  },
  '5': {
    name: 'Мөнх холбоос бугуйвч',
    description:
      'Өлзий хээ сийлсэн хүрэл бугуйвч нь тасралтгүй үргэлжлэх билиг чанарыг биед авчирна.',
  },
  '6': {
    name: 'Хөх тэнгэр ээмэг',
    description:
      'Оюу чулуун дусал хэлбэр ба мөнгөн хийц нь хөдөлгөөн бүрт хөнгөн, эрхэм мэдрэмж төрүүлнэ.',
  },
  '7': {
    name: 'Эхийн улаан шүрэн зүүлт',
    description:
      'Олон үеэр өвлөгдөхүйц төв хийцтэй, улаан шүрэн эгнээтэй уламжлалт монгол зүүлт.',
  },
  '8': {
    name: 'Говийн мана зүүлт',
    description:
      'Говийн байгалийн хээтэй мана чулууг мөнгөн даруулгад суулгасан тайван хэрнээ хүчирхэг бүтээл.',
  },
};

function shouldUseFallbackCopy(product: Product) {
  return !product.createdAt && !product.updatedAt;
}

export function getProductDisplayName(product: Product) {
  if (!shouldUseFallbackCopy(product)) {
    return product.name;
  }

  return productCopy[product.id]?.name ?? product.name;
}

export function getProductDisplayDescription(product: Product) {
  if (!shouldUseFallbackCopy(product)) {
    return product.description;
  }

  return productCopy[product.id]?.description ?? product.description;
}

export function getCategoryLabel(category: Product['category']) {
  return categoryLabels[category];
}

export function getStoneLabel(stoneType: Product['stoneType']) {
  return stoneLabels[stoneType];
}

export function getMaterialLabel(material: Product['material']) {
  return materialLabels[material];
}

export function formatProductPrice(price: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(price);
}
