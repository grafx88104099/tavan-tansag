import Image from 'next/image';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';

import type { Product } from '@/lib/types';
import {
  formatProductPrice,
  getCategoryLabel,
  getProductDisplayDescription,
  getProductDisplayName,
  getStoneLabel,
} from '@/lib/product-copy';
import { Card, CardContent } from '@/components/ui/card';
import { SaveProductButton } from '@/components/save-product-button';
import { PlaceHolderImages } from '@/lib/placeholder-images';

type ProductCardProps = {
  product: Product;
  displayName?: string;
  displayCategory?: string;
};

export function ProductCard({ product, displayName, displayCategory }: ProductCardProps) {
  const productImage = product.coverImageUrl
    ? {
        imageUrl: product.coverImageUrl,
        imageHint: product.coverImageHint ?? 'product image',
      }
    : PlaceHolderImages.find((p) => p.id === product.images[0]);
  const name = displayName ?? getProductDisplayName(product);
  const category = displayCategory ?? getCategoryLabel(product.category);
  const description = getProductDisplayDescription(product);
  const stoneLabel = getStoneLabel(product.stoneType);
  
  return (
    <Card className="group relative h-full overflow-hidden border-primary/10 transition-all duration-500 ease-in-out hover:-translate-y-1.5 hover:border-primary/30 hover:shadow-[0_24px_60px_rgba(67,46,20,0.14)]">
      <SaveProductButton productId={product.id} productName={name} className="absolute right-4 top-4 z-20" />
      <Link href={`/products/${product.id}`} className="block h-full">
        <CardContent className="flex h-full flex-col p-0">
          <div className="relative aspect-[4/5] w-full overflow-hidden">
            {productImage && (
              <Image
                src={productImage.imageUrl}
                alt={name}
                fill
                className="object-cover transition-transform duration-500 ease-in-out group-hover:scale-105"
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                data-ai-hint={productImage.imageHint}
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-[rgba(44,28,12,0.42)] via-transparent to-transparent" />
            <div className="absolute left-4 top-4 rounded-full border border-white/25 bg-[rgba(255,255,255,0.16)] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-white backdrop-blur">
              {category}
            </div>
          </div>

          <div className="flex flex-1 flex-col gap-4 p-5">
            <div className="space-y-2">
              <h3 className="line-clamp-2 text-2xl leading-tight">{name}</h3>
              <p className="line-clamp-3 text-sm leading-6 text-muted-foreground">{description}</p>
            </div>

            <div className="mt-auto flex items-end justify-between gap-4">
              <div className="space-y-1">
                {product.stoneType !== 'None' && (
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                    {stoneLabel}
                  </p>
                )}
                <p className="text-lg font-semibold text-primary">{formatProductPrice(product.price)}</p>
              </div>
              <span className="inline-flex items-center gap-2 text-sm font-medium text-foreground/75 transition-transform duration-300 group-hover:translate-x-1 group-hover:text-primary">
                Дэлгэрэнгүй
                <ArrowUpRight className="h-4 w-4" />
              </span>
            </div>
          </div>
        </CardContent>
      </Link>
    </Card>
  );
}
