'use client';

import { useState, type MouseEvent } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Heart, Loader2 } from 'lucide-react';

import { useAuth } from '@/components/auth-provider';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { getAuthErrorMessage } from '@/lib/auth-utils';
import { cn } from '@/lib/utils';

type SaveProductButtonProps = {
  productId: string;
  productName: string;
  className?: string;
};

export function SaveProductButton({ productId, productName, className }: SaveProductButtonProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { toast } = useToast();
  const { authStatus, currentUser, savedProductIds, toggleSavedProduct } = useAuth();
  const [isPending, setIsPending] = useState(false);

  const isSaved = savedProductIds.includes(productId);

  async function handleClick(event: MouseEvent<HTMLButtonElement>) {
    event.preventDefault();
    event.stopPropagation();

    if (!currentUser) {
      const redirectTo = pathname || '/';
      toast({
        title: 'Нэвтрэх шаардлагатай',
        description: 'Бүтээл хадгалахын тулд эхлээд системд нэвтэрнэ үү.',
      });
      router.push(`/auth?redirect=${encodeURIComponent(redirectTo)}`);
      return;
    }

    try {
      setIsPending(true);
      const nextSavedState = await toggleSavedProduct(productId);
      toast({
        title: nextSavedState ? 'Хадгаллаа' : 'Хадгалалтаас хаслаа',
        description: nextSavedState
          ? `${productName} таны профайлд нэмэгдлээ.`
          : `${productName} профайлаас хасагдлаа.`,
      });
    } catch (error) {
      toast({
        title: 'Хадгалж чадсангүй',
        description: getAuthErrorMessage(error),
        variant: 'destructive',
      });
    } finally {
      setIsPending(false);
    }
  }

  return (
    <Button
      type="button"
      size="icon"
      variant="outline"
      aria-label={isSaved ? `${productName} хадгалалтаас хасах` : `${productName} хадгалах`}
      aria-pressed={isSaved}
      onClick={handleClick}
      disabled={authStatus === 'loading' || isPending}
      className={cn(
        'rounded-full border-white/25 bg-[rgba(255,255,255,0.88)] text-foreground/80 shadow-[0_16px_28px_rgba(49,31,11,0.16)] backdrop-blur hover:border-primary/30 hover:bg-white hover:text-primary',
        isSaved && 'border-primary/30 bg-primary text-primary-foreground hover:bg-primary/92 hover:text-primary-foreground',
        className
      )}
    >
      {isPending ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Heart className={cn('h-4 w-4', isSaved && 'fill-current')} />
      )}
    </Button>
  );
}
