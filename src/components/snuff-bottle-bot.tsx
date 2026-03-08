'use client';

import type { ChangeEvent } from 'react';
import { useRef, useState } from 'react';
import { analyzeSnuffBottleAction } from '@/app/actions';
import type { AnalyzeSnuffBottleOutput } from '@/ai/flows/snuff-bottle-analyzer';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { Bot, Camera, CircleAlert, Gem, Loader2, RefreshCcw, Sparkles, Upload } from 'lucide-react';

type PreparedImage = {
  dataUrl: string;
  height: number;
  mimeType: 'image/jpeg' | 'image/png' | 'image/webp';
  name: string;
  width: number;
};

const SUPPORTED_IMAGE_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);
const MAX_UPLOAD_SIZE_BYTES = 10 * 1024 * 1024;
const MAX_DATA_URL_LENGTH = 4_500_000;
const RESIZE_STEPS = [
  { maxDimension: 1600, quality: 0.86 },
  { maxDimension: 1280, quality: 0.82 },
  { maxDimension: 1024, quality: 0.78 },
];

function getDomainCategoryMeta(category: AnalyzeSnuffBottleOutput['domainCategory']) {
  switch (category) {
    case 'complete_snuff_bottle':
      return {
        label: 'Бүтэн хөөрөг',
        className: 'border-primary/40 bg-primary/10 text-primary',
      };
    case 'coral_top':
      return {
        label: 'Шүрэн толгой',
        className: 'border-orange-500/30 bg-orange-500/10 text-orange-700',
      };
    case 'top_or_cap':
      return {
        label: 'Толгой / таг',
        className: 'border-amber-500/30 bg-amber-500/10 text-amber-700',
      };
    case 'loose_stone_or_bead':
      return {
        label: 'Чулуу / деталь',
        className: 'border-sky-500/30 bg-sky-500/10 text-sky-700',
      };
    default:
      return {
        label: 'Холбогдолгүй',
        className: 'border-zinc-500/30 bg-zinc-500/10 text-zinc-700',
      };
  }
}

function getConfidenceMeta(level: AnalyzeSnuffBottleOutput['confidenceLevel']) {
  switch (level) {
    case 'high':
      return {
        label: 'Өндөр итгэл',
        className: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-700',
      };
    case 'medium':
      return {
        label: 'Дунд итгэл',
        className: 'border-amber-500/30 bg-amber-500/10 text-amber-700',
      };
    default:
      return {
        label: 'Бага итгэл',
        className: 'border-rose-500/30 bg-rose-500/10 text-rose-700',
      };
  }
}

async function loadImage(file: File): Promise<HTMLImageElement> {
  const objectUrl = URL.createObjectURL(file);

  try {
    const image = await new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error('Зургийг уншиж чадсангүй.'));
      img.src = objectUrl;
    });

    return image;
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

async function prepareImage(file: File): Promise<PreparedImage> {
  if (!SUPPORTED_IMAGE_TYPES.has(file.type)) {
    throw new Error('Зөвхөн JPEG, PNG, WEBP зураг оруулна уу.');
  }

  if (file.size > MAX_UPLOAD_SIZE_BYTES) {
    throw new Error('10MB-аас бага хэмжээтэй зураг оруулна уу.');
  }

  const image = await loadImage(file);
  let bestResult: PreparedImage | null = null;

  for (const step of RESIZE_STEPS) {
    const scale = Math.min(1, step.maxDimension / Math.max(image.naturalWidth, image.naturalHeight));
    const width = Math.max(1, Math.round(image.naturalWidth * scale));
    const height = Math.max(1, Math.round(image.naturalHeight * scale));
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;

    const context = canvas.getContext('2d');
    if (!context) {
      throw new Error('Зургийн canvas үүсгэж чадсангүй.');
    }

    context.drawImage(image, 0, 0, width, height);
    const dataUrl = canvas.toDataURL('image/jpeg', step.quality);

    bestResult = {
      dataUrl,
      height,
      mimeType: 'image/jpeg',
      name: file.name,
      width,
    };

    if (dataUrl.length <= MAX_DATA_URL_LENGTH) {
      break;
    }
  }

  if (!bestResult) {
    throw new Error('Зургийг боловсруулах боломжгүй байна.');
  }

  if (bestResult.dataUrl.length > 5_800_000) {
    throw new Error('Зураг хэт том хэвээр байна. Илүү ойроос эсвэл бага нягтралтай зураг оруулна уу.');
  }

  return bestResult;
}

export function SnuffBottleBot() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const requestIdRef = useRef(0);
  const [selectedImage, setSelectedImage] = useState<PreparedImage | null>(null);
  const [analysis, setAnalysis] = useState<AnalyzeSnuffBottleOutput | null>(null);
  const [note, setNote] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleChooseFile = () => {
    fileInputRef.current?.click();
  };

  const handleReset = () => {
    requestIdRef.current += 1;
    setSelectedImage(null);
    setAnalysis(null);
    setError(null);
    setNote('');
    setIsLoading(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    try {
      setError(null);
      setAnalysis(null);
      const prepared = await prepareImage(file);
      setSelectedImage(prepared);
    } catch (fileError) {
      setSelectedImage(null);
      setAnalysis(null);
      setError(fileError instanceof Error ? fileError.message : 'Зургийг бэлтгэх үед алдаа гарлаа.');
    }
  };

  const handleAnalyze = async () => {
    if (!selectedImage) {
      setError('Эхлээд хөөрөгний зураг оруулна уу.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setAnalysis(null);
    const requestId = requestIdRef.current + 1;
    requestIdRef.current = requestId;

    const result = await analyzeSnuffBottleAction({
      photoDataUri: selectedImage.dataUrl,
      mimeType: selectedImage.mimeType,
      context: note.trim() || undefined,
    });

    if (requestIdRef.current !== requestId) {
      return;
    }

    if (result.success && result.data) {
      setAnalysis(result.data);
    } else {
      setError(result.message || 'Таних үед алдаа гарлаа.');
    }

    setIsLoading(false);
  };

  const confidence = analysis ? getConfidenceMeta(analysis.confidenceLevel) : null;
  const domainCategory = analysis ? getDomainCategoryMeta(analysis.domainCategory) : null;

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          size="icon"
          className="fixed bottom-6 right-6 z-50 h-16 w-16 rounded-full border border-primary/30 bg-primary text-primary-foreground shadow-[0_18px_50px_rgba(173,129,78,0.4)] transition-transform hover:scale-[1.03] hover:bg-primary/90"
        >
          <span className="relative flex items-center justify-center">
            <Bot className="h-7 w-7" />
            <span className="absolute -right-1 -top-1 rounded-full bg-white px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-primary">
              AI
            </span>
          </span>
          <span className="sr-only">Хөөрөг танигчийг нээх</span>
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-[min(94vw,56rem)] overflow-hidden border-border/60 bg-background p-0">
        <ScrollArea className="max-h-[85vh]">
          <div className="bg-[radial-gradient(circle_at_top_left,rgba(173,129,78,0.28),transparent_34%),linear-gradient(180deg,rgba(255,255,255,0.04),transparent)]">
            <DialogHeader className="space-y-3 px-6 pb-5 pt-6 text-left">
              <div className="flex items-center gap-3">
                <div className="rounded-2xl border border-primary/20 bg-primary/10 p-3 text-primary">
                  <Gem className="h-6 w-6" />
                </div>
                <div>
                  <DialogTitle className="text-2xl">Хөөрөг танигч</DialogTitle>
                  <DialogDescription className="mt-1 max-w-2xl text-sm leading-6 text-muted-foreground">
                    Хөөрөг, хөөрөгний толгой, ялангуяа шүрэн толгойг AI нь тусгайлан ялгаж, их биеийн материал, металл эд анги,
                    чулууны төрлийг харагдаж буй шинжээр нь
                    ялгаж тайлбарлана.
                  </DialogDescription>
                </div>
              </div>

              <div className="grid gap-3 rounded-2xl border border-border/60 bg-background/70 p-4 md:grid-cols-3">
                <div className="space-y-1">
                  <p className="text-sm font-semibold">1. Зураг оруулах</p>
                  <p className="text-xs text-muted-foreground">Хөөрөгний их бие, таг, шигтгээ, эсвэл тусдаа шүрэн толгой сайн харагдах зураг хамгийн тохиромжтой.</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-semibold">2. AI шинжилгээ</p>
                  <p className="text-xs text-muted-foreground">Материал ба чулууг хиймлээр таамаглахгүй, шүрэн толгойн хэлбэр ба өнгийг тусад нь үнэлнэ.</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-semibold">3. Итгэлийн түвшин</p>
                  <p className="text-xs text-muted-foreground">Итгэл багатай бол AI тодорхойгүй хэсгийг тусад нь тэмдэглэж зөв зураг санал болгоно.</p>
                </div>
              </div>
            </DialogHeader>
          </div>

          <div className="space-y-6 px-6 py-6">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={handleFileChange}
            />

            <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
              <div className="space-y-4">
                <div className="rounded-3xl border border-dashed border-primary/30 bg-primary/5 p-5">
                  <div className="flex flex-col gap-4">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="text-lg font-semibold">Зураг</h3>
                        <p className="mt-1 text-sm text-muted-foreground">JPEG, PNG, WEBP дэмжинэ. Бот зураг танихын өмнө автоматаар шахна.</p>
                      </div>
                      <Button variant="outline" onClick={handleChooseFile} disabled={isLoading}>
                        <Upload className="h-4 w-4" />
                        {selectedImage ? 'Зураг солих' : 'Зураг оруулах'}
                      </Button>
                    </div>

                    <div className="overflow-hidden rounded-2xl border border-border/60 bg-black/20">
                      {selectedImage ? (
                        <div className="space-y-3 p-3">
                          <img
                            src={selectedImage.dataUrl}
                            alt={selectedImage.name}
                            className="h-[260px] w-full rounded-xl object-cover"
                          />
                          <div className="flex flex-wrap items-center gap-2">
                            <Badge variant="secondary">{selectedImage.name}</Badge>
                            <Badge variant="outline">
                              {selectedImage.width} x {selectedImage.height}
                            </Badge>
                            <Badge variant="outline">{selectedImage.mimeType}</Badge>
                          </div>
                        </div>
                      ) : (
                        <div className="flex h-[260px] flex-col items-center justify-center gap-3 px-6 text-center">
                          <div className="rounded-full border border-primary/20 bg-primary/10 p-4 text-primary">
                            <Camera className="h-8 w-8" />
                          </div>
                          <div className="space-y-1">
                            <p className="font-medium">Хөөрөгний зургаа оруулна уу</p>
                            <p className="text-sm text-muted-foreground">
                              Таг, чулуу, мөнгөн хүрээ, их биеийн гадаргуу эсвэл тусдаа шүрэн толгой сайн харагдах нэг зураг эхлэхэд хангалттай.
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="space-y-3 rounded-3xl border border-border/60 bg-card/70 p-5">
                  <div>
                    <h3 className="text-lg font-semibold">Нэмэлт тайлбар</h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Хэрэв мэдэж байвал чулуун өнгө, хуучин эд эсэх, эсвэл аль хэсгийг илүү таних хэрэгтэйг бичиж болно.
                    </p>
                  </div>
                  <Textarea
                    value={note}
                    onChange={(event) => setNote(event.target.value)}
                    maxLength={300}
                    rows={4}
                    placeholder="Жишээ нь: Таг нь оюу шиг харагддаг, их бие нь тунгалагдуу бор өнгөтэй."
                  />
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-xs text-muted-foreground">{note.length}/300</p>
                    <div className="flex gap-2">
                      <Button variant="ghost" onClick={handleReset} disabled={isLoading}>
                        <RefreshCcw className="h-4 w-4" />
                        Цэвэрлэх
                      </Button>
                      <Button onClick={handleAnalyze} disabled={!selectedImage || isLoading}>
                        {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                        {isLoading ? 'Шинжилж байна...' : 'Хөөргийг таних'}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="rounded-3xl border border-border/60 bg-card/70 p-5">
                  <div className="mb-4 flex items-center justify-between gap-3">
                    <div>
                      <h3 className="text-lg font-semibold">AI хариу</h3>
                      <p className="mt-1 text-sm text-muted-foreground">Материал, чулуу, эргэлзээтэй хэсгийг тусад нь харуулна.</p>
                    </div>
                    {confidence && (
                      <Badge variant="outline" className={cn('border', confidence.className)}>
                        {confidence.label}
                      </Badge>
                    )}
                  </div>

                  {error && (
                    <Alert variant="destructive" className="mb-4">
                      <CircleAlert className="h-4 w-4" />
                      <AlertTitle>Таних боломжгүй байна</AlertTitle>
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}

                  {isLoading && (
                    <div className="space-y-4 rounded-2xl border border-primary/20 bg-primary/5 p-4">
                      <div className="flex items-center gap-3">
                        <Loader2 className="h-5 w-5 animate-spin text-primary" />
                        <div>
                          <p className="font-medium">Зургийг шинжилж байна</p>
                          <p className="text-sm text-muted-foreground">Их бие, металл тоног, чулуу, тагны шинжүүдийг ялгаж байна.</p>
                        </div>
                      </div>
                      <div className="grid gap-2 text-sm text-muted-foreground">
                        <p>• Эхлээд хөөрөг мөн эсэхийг шалгана</p>
                        <p>• Дараа нь харагдаж буй материал, чулууг ялгана</p>
                        <p>• Итгэлгүй хэсгийг тусад нь тэмдэглэнэ</p>
                      </div>
                    </div>
                  )}

                  {!analysis && !isLoading && !error && (
                    <div className="rounded-2xl border border-border/60 bg-background/50 p-6 text-center">
                      <Bot className="mx-auto h-8 w-8 text-primary" />
                      <p className="mt-3 font-medium">Шинжилгээ хүлээж байна</p>
                      <p className="mt-1 text-sm text-muted-foreground">Зураг оруулаад “Хөөргийг таних” товчийг дармагц энд AI-ийн дүгнэлт гарч ирнэ.</p>
                    </div>
                  )}

                  {analysis && (
                    <div className="space-y-5">
                      <div className="rounded-2xl border border-border/60 bg-background/60 p-4">
                        <div className="flex flex-wrap items-center gap-2">
                          <Badge className={analysis.isLikelySnuffBottle ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground'}>
                            {analysis.isLikelySnuffBottle
                              ? 'Хөөрөг байх магадлалтай'
                              : analysis.isSnuffBottleRelated
                                ? 'Хөөрөгтэй холбоотой эд анги'
                                : 'Хөөрөгтэй холбоогүй'}
                          </Badge>
                          {domainCategory && (
                            <Badge variant="outline" className={cn('border', domainCategory.className)}>
                              {domainCategory.label}
                            </Badge>
                          )}
                          {analysis.isLikelyCoralTop && (
                            <Badge variant="outline" className="border-orange-500/30 bg-orange-500/10 text-orange-700">
                              Шүрэн толгой гэж танигдсан
                            </Badge>
                          )}
                          <Badge variant="outline">{analysis.identifiedObject}</Badge>
                        </div>
                        <p className="mt-3 text-sm leading-6 text-muted-foreground">{analysis.overallAssessment}</p>
                      </div>

                      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                        <div className="rounded-2xl border border-border/60 bg-background/50 p-4">
                          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Эд ангийн нэр</p>
                          <p className="mt-2 text-base font-semibold">{analysis.partName}</p>
                        </div>
                        <div className="rounded-2xl border border-border/60 bg-background/50 p-4">
                          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Их бие</p>
                          <p className="mt-2 text-base font-semibold">{analysis.bodyMaterial}</p>
                        </div>
                        <div className="rounded-2xl border border-border/60 bg-background/50 p-4">
                          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Металл тоног</p>
                          <p className="mt-2 text-base font-semibold">{analysis.mountMaterial}</p>
                        </div>
                        <div className="rounded-2xl border border-border/60 bg-background/50 p-4">
                          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Таг</p>
                          <p className="mt-2 text-base font-semibold">{analysis.capMaterial}</p>
                        </div>
                        <div className="rounded-2xl border border-border/60 bg-background/50 p-4">
                          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Толгойн чулуу</p>
                          <p className="mt-2 text-base font-semibold">{analysis.capStoneType}</p>
                        </div>
                        <div className="rounded-2xl border border-border/60 bg-background/50 p-4">
                          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Толгойн хэлбэр</p>
                          <p className="mt-2 text-base font-semibold">{analysis.capShape}</p>
                        </div>
                        <div className="rounded-2xl border border-border/60 bg-background/50 p-4">
                          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Халбага / савх</p>
                          <p className="mt-2 text-base font-semibold">{analysis.spoonMaterial}</p>
                        </div>
                      </div>

                      <Separator />

                      <div className="space-y-3">
                        <h4 className="font-semibold">Чулуу, шигтгээ</h4>
                        <div className="flex flex-wrap gap-2">
                          {analysis.stoneTypes.length > 0 ? (
                            analysis.stoneTypes.map((stone) => (
                              <Badge key={stone} variant="secondary">
                                {stone}
                              </Badge>
                            ))
                          ) : (
                            <Badge variant="outline">Чулуу тодорхой харагдахгүй</Badge>
                          )}
                        </div>
                      </div>

                      <div className="space-y-3">
                        <h4 className="font-semibold">Гоёлын хийц</h4>
                        <div className="flex flex-wrap gap-2">
                          {analysis.ornamentDetails.length > 0 ? (
                            analysis.ornamentDetails.map((detail) => (
                              <Badge key={detail} variant="outline">
                                {detail}
                              </Badge>
                            ))
                          ) : (
                            <Badge variant="outline">Хийцийн мэдээлэл бага</Badge>
                          )}
                        </div>
                      </div>

                      <div className="space-y-3 rounded-2xl border border-border/60 bg-background/50 p-4">
                        <h4 className="font-semibold">Харагдсан баримтууд</h4>
                        <div className="space-y-2 text-sm text-muted-foreground">
                          {analysis.evidence.length > 0 ? (
                            analysis.evidence.map((item) => <p key={item}>• {item}</p>)
                          ) : (
                            <p>• Баримт хангалтгүй.</p>
                          )}
                        </div>
                      </div>

                      <div className="space-y-3 rounded-2xl border border-amber-500/20 bg-amber-500/5 p-4">
                        <h4 className="font-semibold">Эргэлзээтэй хэсэг</h4>
                        <div className="space-y-2 text-sm text-muted-foreground">
                          {analysis.uncertainties.length > 0 ? (
                            analysis.uncertainties.map((item) => <p key={item}>• {item}</p>)
                          ) : (
                            <p>• Илэрхий эргэлзээ тэмдэглэгдээгүй.</p>
                          )}
                        </div>
                      </div>

                      <Alert>
                        <Sparkles className="h-4 w-4" />
                        <AlertTitle>Дараагийн зөвлөмж</AlertTitle>
                        <AlertDescription>{analysis.followUpAdvice}</AlertDescription>
                      </Alert>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
