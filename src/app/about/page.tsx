import Image from 'next/image';

import { PageHero } from '@/components/page-hero';
import { BRAND_CONCEPT, BRAND_PILLARS, BRAND_SLOGAN } from '@/lib/brand';
import { PlaceHolderImages } from '@/lib/placeholder-images';

export default function AboutPage() {
  const heroImage = PlaceHolderImages.find((p) => p.id === 'hero-about');
  const storyImage = PlaceHolderImages.find((p) => p.id === 'about-section');

  return (
    <div className="pb-16 md:pb-24">
      <PageHero
        eyebrow={BRAND_SLOGAN}
        title="Бидний тухай"
        description="Монгол уламжлалт хээ, таван хошуу малын бэлгэдэл, үе дамжих үнэт зүйлсийг эрхэм хэрэглээний шинэ хэлээр илэрхийлэхийг зорьдог."
        image={heroImage}
      />

      <section className="container space-y-8 py-12 md:py-16">
        <div className="grid gap-8 lg:grid-cols-[0.96fr_1.04fr]">
          <div className="section-shell px-6 py-8 md:px-10 md:py-10">
            <span className="section-kicker border-primary/20 bg-primary/8 text-primary">Үүсэл санаа</span>
            <div className="mt-5 space-y-5">
              <h2 className="text-4xl font-semibold leading-tight md:text-5xl">
                Хээ, ахуй, үнэт зүйлсийг нэгэн систем болгон харсан брэнд
              </h2>
              <p className="text-base leading-8 text-muted-foreground md:text-lg">{BRAND_CONCEPT}</p>
              <p className="text-base leading-8 text-muted-foreground md:text-lg">
                Бидний зорилго бол Монгол нүүдэлчдийн ахуй соёлын үндэс болсон бэлгэдлийг зөвхөн харагдах дүрслэл төдийгүй
                хэрэглэгчийн туршлага, бүтээгдэхүүний өгүүлэмж, материалын мэдрэмжтэй нь нэгтгэн амилуулах юм.
              </p>
            </div>
          </div>

          <div className="section-shell overflow-hidden p-3">
            <div className="relative min-h-[420px] overflow-hidden rounded-[1.7rem]">
              {storyImage && (
                <Image
                  src={storyImage.imageUrl}
                  alt={storyImage.description}
                  fill
                  className="object-cover"
                  data-ai-hint={storyImage.imageHint}
                />
              )}
              <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(44,28,12,0.08),rgba(44,28,12,0.68))]" />
              <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
                <div className="rounded-[1.6rem] border border-white/15 bg-[rgba(255,255,255,0.14)] p-6 backdrop-blur-md">
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-white/80">Философийн цөм</p>
                  <p className="mt-3 text-xl leading-8 text-white">
                    Тогтвортой дүрс, сүлжилдсэн бүтэц, үе дамжсан үнэ цэнэ нь брэндийн бүх харилцаанд нэгэн мөр шингэсэн байдаг.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="section-shell px-6 py-8 md:px-10 md:py-10">
          <span className="section-kicker border-primary/20 bg-primary/8 text-primary">Бидний зарчим</span>
          <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {BRAND_PILLARS.map((pillar) => (
              <div key={pillar.title} className="rounded-[1.5rem] border border-primary/12 bg-white/60 p-5">
                <h3 className="text-2xl">{pillar.title}</h3>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{pillar.description}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-2">
          <div className="section-shell px-6 py-8 md:px-10 md:py-10">
            <span className="section-kicker border-primary/20 bg-primary/8 text-primary">Яагаад энэ хэлбэр вэ</span>
            <div className="mt-5 space-y-4">
              <h2 className="text-4xl font-semibold leading-tight">Дөрвөлжин нь суурь, сүлжээс нь холбоо</h2>
              <p className="text-base leading-8 text-muted-foreground">
                Дөрвөлжин хэлбэр нь тогтвортой байдал, суурь чанарыг илтгэдэг. Харин сүлжилдсэн бүтэц нь харилцан хамаарал,
                нэгдмэл амьдрал, тасралтгүй үргэлжлэх өв дамжууллын илэрхийлэл болдог.
              </p>
            </div>
          </div>
          <div className="section-shell px-6 py-8 md:px-10 md:py-10">
            <span className="section-kicker border-primary/20 bg-primary/8 text-primary">Брэндийн амлалт</span>
            <div className="mt-5 space-y-4">
              <h2 className="text-4xl font-semibold leading-tight">Эд зүйл биш, өвлөгдөх оролцоо</h2>
              <p className="text-base leading-8 text-muted-foreground">
                Бүтээгдэхүүн, түүх, хэрэглэгчийн туршлага бүгд нэг зорилготой: монгол өвийг орчин үеийн эрхэм хэрэглээний
                мэдрэмжээр сэргээж, хойч үедээ дамжуулах үнэ цэнтэй болгох.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
