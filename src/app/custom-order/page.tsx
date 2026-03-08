'use client';

import { useActionState, useEffect, useRef } from 'react';
import { useFormStatus } from 'react-dom';
import { CheckCircle } from 'lucide-react';

import { submitCustomOrder } from '@/app/actions';
import { PageHero } from '@/components/page-hero';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { BRAND_SLOGAN } from '@/lib/brand';
import { PlaceHolderImages } from '@/lib/placeholder-images';

const requestSteps = [
  {
    title: '1. Санаагаа хуваалцах',
    description: 'Хэлбэр, хээ, бэлгэдэл, зориулалт, материалын тухай хүссэнээрээ тайлбарлана.',
  },
  {
    title: '2. Ур хийцээ тодорхойлох',
    description: 'Чулуу, металл, хэмжээ, өвлөгдөх утга зэрэг түлхүүр мэдээллээ сонгоно.',
  },
  {
    title: '3. Хамтдаа бүтээх',
    description: 'Таны хүсэлтийг судлаад дархны ажлын чиглэл, дараагийн алхмыг санал болгоно.',
  },
];

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full">
      {pending ? 'Илгээж байна...' : 'Хүсэлт илгээх'}
    </Button>
  );
}

export default function CustomOrderPage() {
  const initialState = { message: '', success: false, errors: {} };
  const [state, dispatch] = useActionState(submitCustomOrder, initialState);
  const formRef = useRef<HTMLFormElement>(null);
  const heroImage = PlaceHolderImages.find((p) => p.id === 'hero-custom-order');

  useEffect(() => {
    if (state.success) {
      formRef.current?.reset();
    }
  }, [state.success]);

  return (
    <div className="pb-16 md:pb-24">
      <PageHero
        eyebrow={BRAND_SLOGAN}
        title="Захиалгат бүтээл"
        description="Өөрийн гэр бүл, дурсамж, бэлгэдэл, өвийн утгыг шингээсэн цорын ганц бүтээлийг хамтран урлая."
        image={heroImage}
      />

      <section className="container py-12 md:py-16">
        <div className="grid gap-8 lg:grid-cols-[0.86fr_1.14fr]">
          <div className="section-shell px-6 py-8 md:px-8 md:py-9">
            <span className="section-kicker border-primary/20 bg-primary/8 text-primary">Захиалгын аялал</span>
            <div className="mt-6 space-y-4">
              {requestSteps.map((step) => (
                <div key={step.title} className="rounded-[1.5rem] border border-primary/12 bg-white/60 p-5">
                  <h2 className="text-2xl">{step.title}</h2>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">{step.description}</p>
                </div>
              ))}
            </div>
          </div>

          <Card className="overflow-hidden">
            <CardHeader className="border-b border-border/50 bg-[linear-gradient(180deg,rgba(173,129,78,0.12),rgba(255,255,255,0))]">
              <span className="section-kicker w-fit">Хүсэлтийн маягт</span>
              <CardTitle>Захиалгын дэлгэрэнгүй</CardTitle>
              <CardDescription>
                Бүтээлийн төрлөө, материалын сонголтоо, утга агуулгаа дэлгэрэнгүй бичих тусам дараагийн алхам илүү оновчтой болно.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {state.success ? (
                <Alert variant="default" className="border-emerald-500/20 bg-emerald-500/8 text-emerald-700 [&>svg]:text-emerald-600">
                  <CheckCircle className="h-4 w-4" />
                  <AlertTitle>Хүсэлт амжилттай илгээгдлээ</AlertTitle>
                  <AlertDescription>{state.message}</AlertDescription>
                </Alert>
              ) : (
                <form ref={formRef} action={dispatch} className="space-y-6">
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="name">Нэр</Label>
                      <Input id="name" name="name" placeholder="Таны нэр" />
                      {state.errors?.name && <p className="text-sm text-destructive">{state.errors.name[0]}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Имэйл</Label>
                      <Input id="email" name="email" type="email" placeholder="Таны имэйл" />
                      {state.errors?.email && <p className="text-sm text-destructive">{state.errors.email[0]}</p>}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                    <div className="space-y-2">
                      <Label htmlFor="productType">Бүтээлийн төрөл</Label>
                      <Input id="productType" name="productType" placeholder="Жишээ нь: бөгж, хөөрөг" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="materials">Материал</Label>
                      <Input id="materials" name="materials" placeholder="Жишээ нь: мөнгө, алт" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="stone">Чулуу / шигтгээ</Label>
                      <Input id="stone" name="stone" placeholder="Жишээ нь: оюу, шүр" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message">Утга агуулга, хийцийн тайлбар</Label>
                    <Textarea
                      id="message"
                      name="message"
                      placeholder="Хээ, бэлгэдэл, зориулалт, гэр бүлийн түүх, өвлүүлэх санаа зэрэг хэрэгтэй бүх мэдээллээ энд бичнэ үү."
                      rows={8}
                    />
                    {state.errors?.message && <p className="text-sm text-destructive">{state.errors.message[0]}</p>}
                  </div>

                  {!state.success && state.message && state.message !== '' && (
                    <p className="text-sm text-destructive">{state.message}</p>
                  )}
                  <SubmitButton />
                </form>
              )}
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
