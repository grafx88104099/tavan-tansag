'use client';

import Image from 'next/image';
import Link from 'next/link';

import { useCatalogProducts } from '@/hooks/use-store-data';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import {
  getCategoryLabel,
  getProductDisplayDescription,
  getProductDisplayName,
} from '@/lib/product-copy';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';

type ProductDetailPageProps = {
  productId: string;
};

export function ProductDetailPage({ productId }: ProductDetailPageProps) {
  const { products } = useCatalogProducts();
  const product = products.find((item) => item.id === productId);

  if (!product) {
    return (
      <div className="container py-10 md:py-14">
        <div className="section-shell px-6 py-14 text-center md:px-10">
          <h1 className="text-4xl font-semibold">Бүтээл олдсонгүй</h1>
          <p className="mt-4 text-base leading-8 text-muted-foreground">
            Энэ бүтээгдэхүүн устсан эсвэл одоогоор системд байхгүй байна.
          </p>
          <Button asChild className="mt-8" variant="outline">
            <Link href="/">Нүүр рүү буцах</Link>
          </Button>
        </div>
      </div>
    );
  }

  const displayName = getProductDisplayName(product);
  const displayDescription = getProductDisplayDescription(product);
  const categoryLabel = getCategoryLabel(product.category);
  const productImages: Array<{ imageUrl: string; imageHint: string }> = product.coverImageUrl
    ? [
        {
          imageUrl: product.coverImageUrl,
          imageHint: product.coverImageHint ?? 'product image',
        },
      ]
    : product.images.flatMap((id) => {
        const placeholder = PlaceHolderImages.find((item) => item.id === id);

        if (!placeholder) {
          return [];
        }

        return [
          {
            imageUrl: placeholder.imageUrl,
            imageHint: placeholder.imageHint,
          },
        ];
      });

  return (
    <div className="container py-10 md:py-14">
      <div className="mb-6 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
        <Link href="/" className="transition-colors hover:text-primary">
          Нүүр
        </Link>
        <span>/</span>
        <span>{displayName}</span>
      </div>

      <div className="grid gap-8 xl:grid-cols-[1.04fr_0.96fr] xl:items-start">
        <div className="section-shell p-4 md:sticky md:top-28 md:p-6">
          {productImages.length > 0 ? (
            <Carousel className="w-full">
              <CarouselContent>
                {productImages.map((image, index) => (
                  <CarouselItem key={`${product.id}-${index}`}>
                    <Card className="overflow-hidden border-primary/10 shadow-none">
                      <CardContent className="relative aspect-square p-0">
                        <Image
                          src={image.imageUrl}
                          alt={`${displayName} - image ${index + 1}`}
                          fill
                          className="object-cover"
                          sizes="(max-width: 768px) 100vw, 50vw"
                          data-ai-hint={image.imageHint}
                        />
                      </CardContent>
                    </Card>
                  </CarouselItem>
                ))}
              </CarouselContent>
              {productImages.length > 1 && <CarouselPrevious className="left-4" />}
              {productImages.length > 1 && <CarouselNext className="right-4" />}
            </Carousel>
          ) : (
            <div className="flex aspect-square items-center justify-center rounded-[1.7rem] border border-primary/10 bg-white/60">
              <p className="text-sm font-medium text-muted-foreground">Зураг ороогүй байна</p>
            </div>
          )}
        </div>

        <div className="section-shell px-6 py-8 md:px-10 md:py-10">
          <div className="space-y-8">
            <div className="space-y-4">
              <span className="section-kicker border-primary/20 bg-primary/8 text-primary">Ангилал · {categoryLabel}</span>
              <h1 className="text-4xl font-semibold leading-tight md:text-5xl">{displayName}</h1>
              <p className="text-base leading-8 text-muted-foreground md:text-lg">{displayDescription}</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button asChild size="lg" variant="outline">
                <Link href="/">Цуглуулга руу буцах</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
