import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';

import { getProductById, getProducts } from '@/lib/products';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import {
  formatProductPrice,
  getCategoryLabel,
  getMaterialLabel,
  getProductDisplayDescription,
  getProductDisplayName,
  getStoneLabel,
} from '@/lib/product-copy';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

export async function generateStaticParams() {
  const products = getProducts();
  return products.map((product) => ({
    id: product.id,
  }));
}

export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product = getProductById(id);

  if (!product) {
    notFound();
  }

  const productImages = product.images.map((id) => PlaceHolderImages.find((p) => p.id === id)).filter(Boolean);
  const displayName = getProductDisplayName(product);
  const displayDescription = getProductDisplayDescription(product);
  const categoryLabel = getCategoryLabel(product.category);
  const materialLabel = getMaterialLabel(product.material);
  const stoneLabel = getStoneLabel(product.stoneType);

  return (
    <div className="container py-10 md:py-14">
      <div className="mb-6 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
        <Link href="/collections" className="transition-colors hover:text-primary">
          Цуглуулга
        </Link>
        <span>/</span>
        <span>{displayName}</span>
      </div>

      <div className="grid gap-8 xl:grid-cols-[1.04fr_0.96fr] xl:items-start">
        <div className="section-shell p-4 md:sticky md:top-28 md:p-6">
          <Carousel className="w-full">
            <CarouselContent>
              {productImages.map((img, index) => (
                <CarouselItem key={index}>
                  <Card className="overflow-hidden border-primary/10 shadow-none">
                    <CardContent className="p-0 aspect-square relative">
                      {img && (
                        <Image
                          src={img.imageUrl}
                          alt={`${displayName} - image ${index + 1}`}
                          fill
                          className="object-cover"
                          sizes="(max-width: 768px) 100vw, 50vw"
                          data-ai-hint={img.imageHint}
                        />
                      )}
                    </CardContent>
                  </Card>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="left-4" />
            <CarouselNext className="right-4" />
          </Carousel>
        </div>

        <div className="section-shell px-6 py-8 md:px-10 md:py-10">
          <div className="space-y-6">
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary">{categoryLabel}</Badge>
              {product.stoneType !== 'None' && <Badge variant="outline">{stoneLabel}</Badge>}
            </div>

            <div className="space-y-4">
              <span className="section-kicker border-primary/20 bg-primary/8 text-primary">Мөнх Үргэлжлэх Монгол Өв</span>
              <h1 className="text-4xl font-semibold leading-tight md:text-5xl">{displayName}</h1>
              <p className="text-3xl font-semibold text-primary">{formatProductPrice(product.price)}</p>
            </div>

            <Separator />
            <p className="text-base leading-8 text-muted-foreground md:text-lg">{displayDescription}</p>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-[1.5rem] border border-primary/12 bg-white/60 p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Материал</p>
                <p className="mt-2 text-lg font-semibold">{materialLabel}</p>
              </div>
              <div className="rounded-[1.5rem] border border-primary/12 bg-white/60 p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Чулуу</p>
                <p className="mt-2 text-lg font-semibold">{stoneLabel}</p>
              </div>
              <div className="rounded-[1.5rem] border border-primary/12 bg-white/60 p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Хэмжээ</p>
                <p className="mt-2 text-lg font-semibold">{product.size}</p>
              </div>
              <div className="rounded-[1.5rem] border border-primary/12 bg-white/60 p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Төрөл</p>
                <p className="mt-2 text-lg font-semibold">{categoryLabel}</p>
              </div>
            </div>

            <Separator />

            <div className="flex flex-wrap gap-3">
              <Button asChild size="lg">
                <Link href={`/contact?product=${displayName}`}>Захиалга лавлах</Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href="/collections">Цуглуулга руу буцах</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
