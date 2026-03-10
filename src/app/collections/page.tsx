'use client';

import { PageHero } from '@/components/page-hero';
import { ProductCatalog } from '@/components/product-catalog';
import { BRAND_SLOGAN } from '@/lib/brand';
import { PlaceHolderImages } from '@/lib/placeholder-images';

export default function CollectionsPage() {
  const heroImage = PlaceHolderImages.find((p) => p.id === 'hero-collections');

  return (
    <div className="pb-16 md:pb-24">
      <PageHero
        eyebrow={BRAND_SLOGAN}
        title="Цуглуулга"
        description="Хөөрөг, бөгж, зүүлт, бугуйвч, чулуун гоёл бүрт монгол өвийн утга, геометр, материалын нарийн мэдрэмж шингэсэн."
        image={heroImage}
      />
      <ProductCatalog />
    </div>
  );
}
