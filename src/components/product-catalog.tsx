'use client';

import { useDeferredValue, useMemo, useState } from 'react';
import { Search } from 'lucide-react';

import { ProductCard } from '@/components/product-card';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCatalogProducts } from '@/hooks/use-store-data';
import {
  getCategoryLabel,
  getProductDisplayDescription,
  getProductDisplayName,
} from '@/lib/product-copy';
import { getProductCategories } from '@/lib/products';

export function ProductCatalog() {
  const { products: allProducts } = useCatalogProducts();
  const categories = useMemo(() => ['All', ...getProductCategories(allProducts)], [allProducts]);

  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const deferredSearch = useDeferredValue(searchQuery);

  const filteredProducts = useMemo(() => {
    const normalizedSearch = deferredSearch.trim().toLowerCase();

    return allProducts.filter((product) => {
      const categoryMatch = categoryFilter === 'All' || product.category === categoryFilter;

      if (!categoryMatch) {
        return false;
      }

      if (!normalizedSearch) {
        return true;
      }

      const searchableText = [
        getProductDisplayName(product),
        getProductDisplayDescription(product),
        getCategoryLabel(product.category),
      ]
        .join(' ')
        .toLowerCase();

      return searchableText.includes(normalizedSearch);
    });
  }, [allProducts, categoryFilter, deferredSearch]);

  return (
    <section className="container py-10 md:py-14">
      <Card className="mb-10 border-primary/12 bg-white/80 p-5 md:p-6">
        <div className="grid gap-4 md:grid-cols-[minmax(0,1.4fr)_minmax(0,0.7fr)]">
          <div className="relative">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Бүтээгдэхүүн хайх"
              className="pl-11"
            />
          </div>

          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Ангилал" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((category) => (
                <SelectItem key={category} value={category}>
                  {category === 'All' ? 'Бүх ангилал' : getCategoryLabel(category as Parameters<typeof getCategoryLabel>[0])}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </Card>

      {filteredProducts.length > 0 ? (
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 xl:grid-cols-4">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="section-shell px-6 py-14 text-center md:px-10">
          <h2 className="text-3xl font-semibold">Тохирох бүтээл олдсонгүй</h2>
          <p className="mt-3 text-base leading-7 text-muted-foreground">
            Хайлтын үгээ өөрчилж эсвэл шүүлтүүрээ цэвэрлээд дахин оролдоно уу.
          </p>
        </div>
      )}
    </section>
  );
}
