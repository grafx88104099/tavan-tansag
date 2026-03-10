'use client';

import { useHeritageReel } from '@/hooks/use-store-data';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { cn } from '@/lib/utils';

type HeritageReelProps = {
  className?: string;
};

export function HeritageReel({ className }: HeritageReelProps) {
  const { heritageReel } = useHeritageReel();
  const posterImage = heritageReel.posterImageUrl
    ? heritageReel.posterImageUrl
    : PlaceHolderImages.find((item) => item.id === 'hero-heritage')?.imageUrl;

  return (
    <section className={cn('w-full', className)}>
      <div className="mx-auto w-full max-w-[420px]">
        <div className="relative overflow-hidden rounded-[1.8rem]">
          {heritageReel.videoUrl ? (
            <video
              key={heritageReel.videoUrl}
              className="aspect-[9/16] w-full object-cover"
              controls
              playsInline
              preload="metadata"
              poster={posterImage ?? undefined}
            >
              <source src={heritageReel.videoUrl} type="video/mp4" />
              Таны browser video тоглуулахыг дэмжихгүй байна.
            </video>
          ) : (
            <div
              className="flex aspect-[9/16] items-center justify-center bg-cover bg-center"
              style={posterImage ? { backgroundImage: `url(${posterImage})` } : undefined}
            >
              <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(44,28,12,0.18),rgba(44,28,12,0.62))]" />
              <div className="relative z-10 px-6 text-center text-white">
                <p className="text-lg font-semibold">Админаас видео upload хийхэд энд автоматаар тоглоно</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
