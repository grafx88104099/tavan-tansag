'use client';

import { useActionState, useEffect, useRef, useState } from 'react';
import { useFormStatus } from 'react-dom';
import { CheckCircle } from 'lucide-react';

import { submitInquiry } from '@/app/actions';
import { PageHero } from '@/components/page-hero';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { BRAND_SLOGAN } from '@/lib/brand';
import { PlaceHolderImages } from '@/lib/placeholder-images';

const contactTopics = [
  {
    title: 'Захиалга, худалдан авалт',
    description: 'Бүтээгдэхүүний дэлгэрэнгүй, хүргэлт, үнэ болон захиалгын нөхцөлийн талаар.',
  },
  {
    title: 'Өвийн утга, зөвлөгөө',
    description: 'Бэлэг дурсгал, өвлөгдөх бүтээл, сонголтын талаар хувьчилсан зөвлөмж авах.',
  },
  {
    title: 'Хамтын ажиллагаа',
    description: 'Үзэсгэлэн, түншлэл, редакцын болон соёлын хамтын төслүүдийн талаар.',
  },
];

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full">
      {pending ? 'Илгээж байна...' : 'Мессеж илгээх'}
    </Button>
  );
}

export default function ContactPage() {
  const initialState = { message: '', success: false, errors: {} };
  const [state, dispatch] = useActionState(submitInquiry, initialState);
  const formRef = useRef<HTMLFormElement>(null);
  const [messageValue, setMessageValue] = useState('');
  const heroImage = PlaceHolderImages.find((p) => p.id === 'hero-contact');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const productName = params.get('product');
    if (productName) {
      setMessageValue(`"${productName}" бүтээлийн талаар дэлгэрэнгүй мэдээлэл авмаар байна.`);
    }
  }, []);

  useEffect(() => {
    if (state.success) {
      formRef.current?.reset();
      setMessageValue('');
    }
  }, [state.success]);

  return (
    <div className="pb-16 md:pb-24">
      <PageHero
        eyebrow={BRAND_SLOGAN}
        title="Холбоо барих"
        description="Бүтээлийн тухай асуулт, захиалга, хамтын ажиллагаа, өвийн агуулгын зөвлөгөө гээд хэрэгтэй зүйлээ бидэнд илгээнэ үү."
        image={heroImage}
      />

      <section className="container py-12 md:py-16">
        <div className="grid gap-8 lg:grid-cols-[0.88fr_1.12fr]">
          <div className="section-shell px-6 py-8 md:px-8 md:py-9">
            <span className="section-kicker border-primary/20 bg-primary/8 text-primary">Холбогдох шалтгаанууд</span>
            <div className="mt-6 space-y-4">
              {contactTopics.map((topic) => (
                <div key={topic.title} className="rounded-[1.5rem] border border-primary/12 bg-white/60 p-5">
                  <h2 className="text-2xl">{topic.title}</h2>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">{topic.description}</p>
                </div>
              ))}
            </div>
          </div>

          <Card className="overflow-hidden">
            <CardHeader className="border-b border-border/50 bg-[linear-gradient(180deg,rgba(173,129,78,0.12),rgba(255,255,255,0))]">
              <span className="section-kicker w-fit">Мессеж</span>
              <CardTitle>Танд зориулсан хариулт</CardTitle>
            </CardHeader>
            <CardContent>
              {state.success ? (
                <Alert variant="default" className="border-emerald-500/20 bg-emerald-500/8 text-emerald-700 [&>svg]:text-emerald-600">
                  <CheckCircle className="h-4 w-4" />
                  <AlertTitle>Илгээгдлээ</AlertTitle>
                  <AlertDescription>{state.message}</AlertDescription>
                </Alert>
              ) : (
                <form ref={formRef} action={dispatch} className="space-y-6">
                  <div className="space-y-2">
                    <Input name="name" placeholder="Таны нэр" aria-label="Таны нэр" />
                    {state.errors?.name && <p className="text-sm text-destructive">{state.errors.name[0]}</p>}
                  </div>
                  <div className="space-y-2">
                    <Input name="email" type="email" placeholder="Таны имэйл" aria-label="Таны имэйл" />
                    {state.errors?.email && <p className="text-sm text-destructive">{state.errors.email[0]}</p>}
                  </div>
                  <div className="space-y-2">
                    <Textarea
                      name="message"
                      placeholder="Таны мессеж"
                      aria-label="Таны мессеж"
                      rows={6}
                      value={messageValue}
                      onChange={(event) => setMessageValue(event.target.value)}
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
