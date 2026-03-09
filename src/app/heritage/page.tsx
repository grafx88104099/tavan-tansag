'use client';

import { PlaceHolderImages } from '@/lib/placeholder-images';
import { useHeritageReel } from '@/hooks/use-store-data';

export default function HeritagePage() {
  const { heritageReel } = useHeritageReel();
  const posterImage = heritageReel.posterImageUrl
    ? heritageReel.posterImageUrl
    : PlaceHolderImages.find((item) => item.id === 'hero-heritage')?.imageUrl;

  return (
    <section className="container py-10 md:py-14">
      <div className="section-shell px-6 py-8 md:px-10 md:py-10">
        <div className="flex flex-col items-center text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary">Видео рийл</p>
          <h1 className="mt-3 text-4xl font-semibold md:text-5xl">{heritageReel.title}</h1>
        </div>

        <div className="mx-auto mt-8 w-full max-w-[420px]">
          <div className="overflow-hidden rounded-[2rem] border border-primary/15 bg-[rgba(44,28,12,0.16)] p-3 shadow-[0_24px_80px_rgba(57,36,14,0.24)]">
            <div className="relative overflow-hidden rounded-[1.6rem] bg-[rgba(255,255,255,0.12)]">
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
                    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-white/75">Reel</p>
                    <p className="mt-3 text-lg font-semibold">Админаас видео upload хийхэд энд автоматаар тоглоно</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
