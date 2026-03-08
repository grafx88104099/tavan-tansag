'use client';

import { useDeferredValue, useMemo, useState } from 'react';
import { Search } from 'lucide-react';

import { ProductCard } from '@/components/product-card';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  getCategoryLabel,
  getMaterialLabel,
  getProductDisplayDescription,
  getProductDisplayName,
  getStoneLabel,
} from '@/lib/product-copy';
import { getProductCategories, getProducts, getProductStoneTypes } from '@/lib/products';

type ProductCatalogProps = {
  title?: string;
  description?: string;
  showIntro?: boolean;
};

export function ProductCatalog({
  title = 'Цуглуулга',
  description = 'Хайлт болон шүүлтүүр ашиглаад өөрт тохирох бүтээлийг шууд олоорой.',
  showIntro = true,
}: ProductCatalogProps) {
  const allProducts = useMemo(() => getProducts(), []);
  const categories = useMemo(() => ['All', ...getProductCategories()], []);
  const stoneTypes = useMemo(() => ['All', ...getProductStoneTypes()], []);

  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [stoneTypeFilter, setStoneTypeFilter] = useState('All');
  const deferredSearch = useDeferredValue(searchQuery);

  const filteredProducts = useMemo(() => {
    const normalizedSearch = deferredSearch.trim().toLowerCase();

    return allProducts.filter((product) => {
      const categoryMatch = categoryFilter === 'All' || product.category === categoryFilter;
      const stoneTypeMatch = stoneTypeFilter === 'All' || product.stoneType === stoneTypeFilter;

      if (!categoryMatch || !stoneTypeMatch) {
        return false;
      }

      if (!normalizedSearch) {
        return true;
      }

      const searchableText = [
        getProductDisplayName(product),
        getProductDisplayDescription(product),
        getCategoryLabel(product.category),
        getStoneLabel(product.stoneType),
        getMaterialLabel(product.material),
      ]
        .join(' ')
        .toLowerCase();

      return searchableText.includes(normalizedSearch);
    });
  }, [allProducts, categoryFilter, deferredSearch, stoneTypeFilter]);

  const hasActiveFilters = searchQuery !== '' || categoryFilter !== 'All' || stoneTypeFilter !== 'All';

  return (
    <section className="container py-10 md:py-14">
      <Card className="mb-10 border-primary/12 bg-white/80 p-6 md:p-8">
        <div className="grid gap-6 lg:grid-cols-[0.82fr_1.18fr] lg:items-end">
          {showIntro ? (
            <div className="space-y-3">
              <span className="section-kicker border-primary/20 bg-primary/8 text-primary">Хайлт ба шүүлтүүр</span>
              <h1 className="text-3xl font-semibold md:text-4xl">{title}</h1>
              <p className="text-sm leading-7 text-muted-foreground md:text-base">{description}</p>
            </div>
          ) : (
            <div className="space-y-3">
              <span className="section-kicker border-primary/20 bg-primary/8 text-primary">Хайлт ба шүүлтүүр</span>
              <p className="text-sm leading-7 text-muted-foreground md:text-base">{description}</p>
            </div>
          )}

          <div className="grid gap-4 md:grid-cols-[minmax(0,1.3fr)_minmax(0,0.7fr)_minmax(0,0.7fr)]">
            <div className="relative">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Бүтээлийн нэр, тайлбар, материал, чулуугаар хайх"
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

            <Select value={stoneTypeFilter} onValueChange={setStoneTypeFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Чулуу" />
              </SelectTrigger>
              <SelectContent>
                {stoneTypes.map((stone) => (
                  <SelectItem key={stone} value={stone}>
                    {stone === 'All' ? 'Бүх чулуу' : getStoneLabel(stone as Parameters<typeof getStoneLabel>[0])}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-border/50 pt-6">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            Нийт {filteredProducts.length} бүтээл
          </p>
          {hasActiveFilters && (
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                setSearchQuery('');
                setCategoryFilter('All');
                setStoneTypeFilter('All');
              }}
            >
              Цэвэрлэх
            </Button>
          )}
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
