import Image from 'next/image';
import type { ReactNode } from 'react';

import type { ImagePlaceholder } from '@/lib/placeholder-images';
import { cn } from '@/lib/utils';

type PageHeroProps = {
  eyebrow: string;
  title: string;
  description: string;
  image?: ImagePlaceholder;
  align?: 'left' | 'center';
  children?: ReactNode;
  className?: string;
};

export function PageHero({
  eyebrow,
  title,
  description,
  image,
  align = 'left',
  children,
  className,
}: PageHeroProps) {
  return (
    <section className={cn('relative isolate overflow-hidden', className)}>
      {image && (
        <Image
          src={image.imageUrl}
          alt={image.description}
          fill
          priority
          className="object-cover object-center"
          data-ai-hint={image.imageHint}
        />
      )}
      <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(44,28,12,0.84)_0%,rgba(44,28,12,0.7)_42%,rgba(173,129,78,0.34)_100%)]" />
      <div className="absolute inset-0 brand-pattern opacity-20" />

      <div className="container relative py-24 md:py-32 lg:py-36">
        <div
          className={cn(
            'max-w-3xl space-y-6',
            align === 'center' ? 'mx-auto text-center' : 'text-left'
          )}
        >
          <span className="section-kicker border-white/15 bg-white/10 text-white/90">
            {eyebrow}
          </span>
          <div className="space-y-4">
            <h1 className="max-w-4xl text-4xl font-semibold leading-tight text-white md:text-6xl">
              {title}
            </h1>
            <p className="max-w-2xl text-base leading-7 text-white/80 md:text-xl md:leading-8">
              {description}
            </p>
          </div>
          {children}
        </div>
      </div>
    </section>
  );
}
