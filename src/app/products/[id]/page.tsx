import { ProductDetailPage } from '@/components/product-detail-page';

type ProductPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function ProductPage({ params }: ProductPageProps) {
  const { id } = await params;

  return <ProductDetailPage productId={id} />;
}
