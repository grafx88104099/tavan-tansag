import Image from 'next/image';

import { PageHero } from '@/components/page-hero';
import { BRAND_PILLARS, BRAND_SLOGAN, FIVE_ANIMALS } from '@/lib/brand';
import { PlaceHolderImages } from '@/lib/placeholder-images';

const symbolismCards = [
  {
    title: 'Дөрвөлжин хэлбэр',
    description: 'Суурь чанар, тогтвортой байдал, бат бөх зохион байгуулалтыг илэрхийлнэ.',
  },
  {
    title: 'Сүлжилдсэн бүтэц',
    description: 'Харилцан хамаарал, нэгдмэл ахуй, өвийг системтэй дамжуулах утгыг өгнө.',
  },
  {
    title: 'Үргэлжлэх хээ',
    description: 'Өргөтгөж хэрэглэж болох геометр нь мөнхийн шинж, тасралтгүй амьд холбоог сануулна.',
  },
  {
    title: 'Таван бэлгэдэл',
    description: 'Морь, хонь, ямаа, тэмээ, үхэр нь нүүдэлчдийн амьдралын үндэс, соёлын амин холбоо юм.',
  },
];

export default function HeritagePage() {
  const heroImage = PlaceHolderImages.find((p) => p.id === 'hero-heritage');
  const craftsmanshipImage = PlaceHolderImages.find((p) => p.id === 'heritage-craftsmanship');

  return (
    <div className="pb-16 md:pb-24">
      <PageHero
        eyebrow={BRAND_SLOGAN}
        title="Өв соёл"
        description="Логоны геометр, таван хошуу малын бэлгэдэл, дархны ур чадварын гүн утгыг нэг дороос тайлбарлана."
        image={heroImage}
      />

      <section className="container space-y-8 py-12 md:py-16">
        <div className="section-shell px-6 py-8 md:px-10 md:py-10">
          <div className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr]">
            <div className="space-y-5">
              <span className="section-kicker border-primary/20 bg-primary/8 text-primary">Концепцийн тайлал</span>
              <h2 className="text-4xl font-semibold leading-tight md:text-5xl">
                Нүүдэлчдийн ахуйгаас урласан тасралтгүй өвийн дүрслэл
              </h2>
              <p className="text-base leading-8 text-muted-foreground md:text-lg">
                Энэхүү дүрслэл нь Монгол уламжлалт хээний үндсэн геометр элементүүдийг ашиглан таван дөрвөлжин хэлбэрийг
                хооронд нь сүлжсэн зохиомж юм. Таван дүрс нь таван хошуу малыг илэрхийлж, нийлээд нэгэн нэгдмэл систем болно.
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {symbolismCards.map((card) => (
                <div key={card.title} className="rounded-[1.5rem] border border-primary/12 bg-white/60 p-5">
                  <h3 className="text-2xl">{card.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">{card.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="section-shell px-6 py-8 md:px-10 md:py-10">
          <span className="section-kicker border-primary/20 bg-primary/8 text-primary">Таван хошуу мал</span>
          <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
            {FIVE_ANIMALS.map((animal) => (
              <div key={animal.name} className="rounded-[1.5rem] border border-primary/12 bg-white/60 p-5">
                <h3 className="text-3xl">{animal.name}</h3>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{animal.description}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-[1.02fr_0.98fr]">
          <div className="section-shell overflow-hidden p-3">
            <div className="relative min-h-[420px] overflow-hidden rounded-[1.7rem]">
              {craftsmanshipImage && (
                <Image
                  src={craftsmanshipImage.imageUrl}
                  alt={craftsmanshipImage.description}
                  fill
                  className="object-cover"
                  data-ai-hint={craftsmanshipImage.imageHint}
                />
              )}
              <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(44,28,12,0.08),rgba(44,28,12,0.64))]" />
            </div>
          </div>

          <div className="section-shell px-6 py-8 md:px-10 md:py-10">
            <span className="section-kicker border-primary/20 bg-primary/8 text-primary">Утгын давхаргууд</span>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              {BRAND_PILLARS.map((pillar) => (
                <div key={pillar.title} className="rounded-[1.5rem] border border-primary/12 bg-white/60 p-5">
                  <h3 className="text-2xl">{pillar.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">{pillar.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
