'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { Heart, Loader2, LogOut, Sparkles, UserRound } from 'lucide-react';

import { useAuth } from '@/components/auth-provider';
import { ProductCard } from '@/components/product-card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { getAuthErrorMessage, getProviderLabel, getUserInitial } from '@/lib/auth-utils';
import { getProductById } from '@/lib/products';

function formatProfileDate(value: Date | null) {
  if (!value) {
    return 'Шинэ хэрэглэгч';
  }

  return new Intl.DateTimeFormat('mn-MN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(value);
}

export function ProfileDashboard() {
  const { toast } = useToast();
  const { authStatus, currentUser, profile, savedProducts, signOutUser } = useAuth();
  const [isSigningOut, setIsSigningOut] = useState(false);

  const savedCatalog = useMemo(
    () =>
      savedProducts
        .map((item) => getProductById(item.productId))
        .filter((product): product is NonNullable<ReturnType<typeof getProductById>> => Boolean(product)),
    [savedProducts]
  );

  async function handleSignOut() {
    try {
      setIsSigningOut(true);
      await signOutUser();
      toast({
        title: 'Системээс гарлаа',
        description: 'Та хүссэн үедээ дахин нэвтэрч болно.',
      });
    } catch (error) {
      toast({
        title: 'Гарах үед алдаа гарлаа',
        description: getAuthErrorMessage(error),
        variant: 'destructive',
      });
    } finally {
      setIsSigningOut(false);
    }
  }

  if (authStatus === 'loading') {
    return (
      <section className="container py-10 md:py-14">
        <div className="section-shell flex items-center justify-center gap-3 px-6 py-16 md:px-10">
          <Loader2 className="h-5 w-5 animate-spin text-primary" />
          <p className="text-sm font-medium text-muted-foreground">Профайл мэдээллийг ачаалж байна...</p>
        </div>
      </section>
    );
  }

  if (!currentUser) {
    return (
      <section className="container py-10 md:py-14">
        <div className="section-shell px-6 py-14 text-center md:px-10">
          <div className="mx-auto flex max-w-2xl flex-col items-center">
            <div className="rounded-3xl border border-primary/12 bg-primary/10 p-4 text-primary">
              <UserRound className="h-8 w-8" />
            </div>
            <h1 className="mt-6 text-4xl font-semibold md:text-5xl">Профайл руу орохын тулд нэвтэрнэ үү</h1>
            <p className="mt-4 text-base leading-8 text-muted-foreground">
              Нэвтэрсний дараа таны хадгалсан бүтээлүүд, профайлын мэдээлэл, гарах удирдлага энд төвлөрнө.
            </p>
            <Button asChild className="mt-8">
              <Link href="/auth?redirect=/profile">Нэвтрэх / Бүртгүүлэх</Link>
            </Button>
          </div>
        </div>
      </section>
    );
  }

  const displayName = profile?.displayName || currentUser.displayName || 'Таван тансаг хэрэглэгч';
  const email = profile?.email || currentUser.email || 'Мэдээлэл алга';
  const providerIds = profile?.providerIds?.length
    ? profile.providerIds
    : currentUser.providerData
        .map((item) => item.providerId)
        .filter((providerId): providerId is string => Boolean(providerId));

  return (
    <section className="container py-10 md:py-14">
      <div className="grid gap-8 xl:grid-cols-[0.94fr_1.06fr]">
        <Card className="border-primary/12 bg-white/84">
          <CardContent className="space-y-8 p-7 md:p-10">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16 border border-primary/15">
                  <AvatarImage src={profile?.photoURL ?? currentUser.photoURL ?? undefined} alt={displayName} />
                  <AvatarFallback className="bg-primary/12 text-xl font-semibold text-primary">
                    {getUserInitial(displayName, email)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary">Хувийн профайл</p>
                  <h1 className="mt-2 text-4xl font-semibold">{displayName}</h1>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">{email}</p>
                </div>
              </div>

              <Button type="button" variant="outline" onClick={handleSignOut} disabled={isSigningOut}>
                {isSigningOut ? <Loader2 className="h-4 w-4 animate-spin" /> : <LogOut className="h-4 w-4" />}
                Системээс гарах
              </Button>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-[1.5rem] border border-primary/12 bg-white/70 p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Хадгалсан бүтээл</p>
                <p className="mt-3 text-3xl font-semibold text-foreground">{savedCatalog.length}</p>
              </div>

              <div className="rounded-[1.5rem] border border-primary/12 bg-white/70 p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Бүртгэлийн огноо</p>
                <p className="mt-3 text-lg font-semibold text-foreground">{formatProfileDate(profile?.createdAt ?? null)}</p>
              </div>
            </div>

            <div className="rounded-[1.5rem] border border-primary/12 bg-white/70 p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Нэвтрэх суваг</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {providerIds.map((providerId) => (
                  <Badge key={providerId} variant="outline" className="border-primary/20 bg-primary/10 text-primary">
                    {getProviderLabel(providerId)}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="rounded-[1.5rem] border border-primary/12 bg-white/70 p-5">
              <div className="flex items-center gap-3">
                <div className="rounded-2xl border border-primary/15 bg-primary/10 p-3 text-primary">
                  <Sparkles className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-semibold">Хадгалсан цуглуулга live синк хийгдэнэ</p>
                  <p className="text-sm leading-6 text-muted-foreground">
                    Каталог дээрх зүрх товчоор бүтээл хадгалж эсвэл устгахад энэ профайл шууд шинэчлэгдэнэ.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <div className="section-shell px-6 py-6 md:px-8">
            <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary">Хадгалсан цуглуулга</p>
                <h2 className="mt-2 text-3xl font-semibold md:text-4xl">Таны сонгосон бүтээлүүд</h2>
                <p className="mt-3 text-sm leading-7 text-muted-foreground">
                  Card дээрх зүрх товчийг дахин дарж хадгалалтаас хасах боломжтой.
                </p>
              </div>
              <Button asChild variant="outline">
                <Link href="/">Каталог руу очих</Link>
              </Button>
            </div>
          </div>

          {savedCatalog.length > 0 ? (
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
              {savedCatalog.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="section-shell px-6 py-14 text-center md:px-10">
              <div className="mx-auto max-w-xl">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl border border-primary/12 bg-primary/10 text-primary">
                  <Heart className="h-7 w-7" />
                </div>
                <h2 className="mt-6 text-3xl font-semibold">Одоогоор хадгалсан бүтээл алга</h2>
                <p className="mt-4 text-base leading-8 text-muted-foreground">
                  Нүүр хуудасны каталогоос сонирхсон бүтээл дээрх зүрх товчийг дарж хадгалаарай.
                </p>
                <Button asChild className="mt-8">
                  <Link href="/">Бүтээлүүд үзэх</Link>
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
