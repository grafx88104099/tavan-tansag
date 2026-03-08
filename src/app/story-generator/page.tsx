import { PageHero } from '@/components/page-hero';
import { StoryGeneratorForm } from '@/components/story-generator-form';
import { BRAND_SLOGAN } from '@/lib/brand';
import { PlaceHolderImages } from '@/lib/placeholder-images';

export default function StoryGeneratorPage() {
  const heroImage = PlaceHolderImages.find((p) => p.id === 'hero-about');

  return (
    <div className="pb-16 md:pb-24">
      <PageHero
        eyebrow={BRAND_SLOGAN}
        title="Өвийн түүх үүсгэгч"
        description="Бүтээлийн нэр, материал, чулуу, өв соёлын агуулгаа оруулаад монгол өвийн утгатай редакцын өнгө бүхий тайлбар үүсгээрэй."
        image={heroImage}
      />

      <section className="container py-12 md:py-16">
        <div className="mx-auto max-w-4xl">
          <StoryGeneratorForm />
        </div>
      </section>
    </div>
  );
}
