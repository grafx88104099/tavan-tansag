import { HeritageReel } from '@/components/heritage-reel';
import { ProductCatalog } from '@/components/product-catalog';

export default function Home() {
  return (
    <div className="container py-8 md:py-10 xl:py-12">
      <div className="grid gap-8 xl:grid-cols-[minmax(320px,420px)_minmax(0,1fr)] xl:items-start">
        <div className="xl:sticky xl:top-28">
          <HeritageReel />
        </div>
        <ProductCatalog useContainer={false} compactGrid className="min-w-0" />
      </div>
    </div>
  );
}
