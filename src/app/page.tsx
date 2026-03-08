import { ProductCatalog } from '@/components/product-catalog';

export default function Home() {
  return (
    <div className="pb-16 md:pb-24">
      <ProductCatalog
        title="Цуглуулга"
        description="Нүүр хуудаснаас шууд хайж, шүүж, бүтээлүүдийг харах боломжтой."
      />
    </div>
  );
}
