'use client';

import { useState } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { generateStoryAction } from '@/app/actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Terminal } from 'lucide-react';
import { Skeleton } from './ui/skeleton';

type FormValues = {
  productName: string;
  category: string;
  stoneType: string;
  material: string;
  heritageContext?: string;
};

export function StoryGeneratorForm() {
  const [generatedStory, setGeneratedStory] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>();

  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    setIsLoading(true);
    setError(null);
    setGeneratedStory(null);
    
    const result = await generateStoryAction(data);
    
    if (result.success && result.data) {
      setGeneratedStory(result.data.description);
    } else {
      setError(result.message || 'Түүх үүсгэх үед алдаа гарлаа.');
    }
    
    setIsLoading(false);
  };

  return (
    <Card className="w-full overflow-hidden">
      <CardHeader className="border-b border-border/50 bg-[linear-gradient(180deg,rgba(173,129,78,0.12),rgba(255,255,255,0))]">
        <span className="section-kicker w-fit">Өвийн өгүүлэмж</span>
        <CardTitle>AI түүх бүтээгч</CardTitle>
        <CardDescription>Бүтээлийн үндсэн мэдээллээ оруулаад монгол өвийн утга агуулгатай тайлбар үүсгэнэ.</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="productName">Бүтээлийн нэр</Label>
              <Input id="productName" {...register('productName', { required: 'Бүтээлийн нэр шаардлагатай' })} />
              {errors.productName && <p className="text-sm text-destructive">{errors.productName.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">Ангилал</Label>
              <Input id="category" {...register('category', { required: 'Ангилал шаардлагатай' })} />
              {errors.category && <p className="text-sm text-destructive">{errors.category.message}</p>}
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="stoneType">Чулуу / шигтгээ</Label>
              <Input id="stoneType" {...register('stoneType', { required: 'Чулууны төрөл шаардлагатай' })} />
              {errors.stoneType && <p className="text-sm text-destructive">{errors.stoneType.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="material">Материал</Label>
              <Input id="material" {...register('material', { required: 'Материал шаардлагатай' })} />
              {errors.material && <p className="text-sm text-destructive">{errors.material.message}</p>}
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="heritageContext">Өв соёлын агуулга</Label>
            <Textarea id="heritageContext" {...register('heritageContext')} placeholder="Жишээ нь: Таван хошуу мал, сүлжилдсэн хээ, өвлөгдөх үнэт зүйлсээс санаа авсан." />
          </div>
        </CardContent>
        <CardFooter className="flex-col items-start gap-4">
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Үүсгэж байна...' : 'Түүх үүсгэх'}
          </Button>

          {isLoading && (
            <div className="w-full space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
            </div>
          )}

          {error && (
            <Alert variant="destructive">
              <AlertTitle>Алдаа</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          {generatedStory && (
            <Alert>
              <Terminal className="h-4 w-4" />
              <AlertTitle>Үүсгэсэн тайлбар</AlertTitle>
              <AlertDescription className="whitespace-pre-wrap text-sm leading-7">
                {generatedStory}
              </AlertDescription>
            </Alert>
          )}
        </CardFooter>
      </form>
    </Card>
  );
}
