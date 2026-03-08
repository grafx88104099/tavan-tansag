'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Heart, Loader2, LogOut, UserRound } from 'lucide-react';

import { useAuth } from '@/components/auth-provider';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';
import { getAuthErrorMessage, getUserInitial } from '@/lib/auth-utils';

type AccountControlsProps = {
  mobile?: boolean;
  onNavigate?: () => void;
};

function getRedirectHref(pathname: string) {
  const redirectTo = pathname === '/auth' ? '/profile' : pathname || '/profile';
  return `/auth?redirect=${encodeURIComponent(redirectTo)}`;
}

export function AccountControls({ mobile = false, onNavigate }: AccountControlsProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { toast } = useToast();
  const { authStatus, currentUser, profile, savedProductIds, signOutUser } = useAuth();
  const [isSigningOut, setIsSigningOut] = useState(false);

  async function handleSignOut() {
    try {
      setIsSigningOut(true);
      await signOutUser();
      onNavigate?.();
      toast({
        title: 'Системээс гарлаа',
        description: 'Та хүссэн үедээ дахин нэвтэрч болно.',
      });

      if (pathname === '/profile') {
        router.replace('/');
      }
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
      <Button variant="outline" disabled className={mobile ? 'w-full' : undefined}>
        <Loader2 className="h-4 w-4 animate-spin" />
        Түр хүлээнэ үү
      </Button>
    );
  }

  if (!currentUser) {
    return (
      <Button asChild className={mobile ? 'w-full' : undefined}>
        <Link href={getRedirectHref(pathname)} onClick={() => onNavigate?.()}>
          Нэвтрэх / Бүртгүүлэх
        </Link>
      </Button>
    );
  }

  const displayName = profile?.displayName || currentUser.displayName || 'Хэрэглэгч';
  const email = profile?.email || currentUser.email || '';
  const savedCountLabel = `${savedProductIds.length} хадгалсан`;

  if (mobile) {
    return (
      <div className="space-y-4 rounded-[1.5rem] border border-primary/12 bg-white/70 p-4">
        <div className="flex items-center gap-3">
          <Avatar className="h-11 w-11 border border-primary/15">
            <AvatarImage src={profile?.photoURL ?? currentUser.photoURL ?? undefined} alt={displayName} />
            <AvatarFallback className="bg-primary/12 font-semibold text-primary">
              {getUserInitial(displayName, email)}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-semibold text-foreground">{displayName}</p>
            <p className="text-sm text-muted-foreground">{savedCountLabel}</p>
          </div>
        </div>

        <div className="grid gap-3">
          <Button asChild className="w-full">
            <Link href="/profile" onClick={() => onNavigate?.()}>
              <UserRound className="h-4 w-4" />
              Миний профайл
            </Link>
          </Button>
          <Button type="button" variant="outline" className="w-full" onClick={handleSignOut} disabled={isSigningOut}>
            {isSigningOut ? <Loader2 className="h-4 w-4 animate-spin" /> : <LogOut className="h-4 w-4" />}
            Системээс гарах
          </Button>
        </div>
      </div>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="h-12 rounded-full px-3">
          <Avatar className="h-8 w-8 border border-primary/15">
            <AvatarImage src={profile?.photoURL ?? currentUser.photoURL ?? undefined} alt={displayName} />
            <AvatarFallback className="bg-primary/12 text-xs font-semibold text-primary">
              {getUserInitial(displayName, email)}
            </AvatarFallback>
          </Avatar>
          <span className="max-w-[10rem] truncate">{displayName}</span>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-72 rounded-2xl border-primary/12 bg-white/95 p-2">
        <DropdownMenuLabel className="rounded-xl px-3 py-3">
          <p className="font-semibold text-foreground">{displayName}</p>
          <p className="mt-1 text-xs font-normal text-muted-foreground">{email}</p>
          <p className="mt-2 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-primary">
            <Heart className="h-3.5 w-3.5" />
            {savedCountLabel}
          </p>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/profile" onClick={() => onNavigate?.()}>
            <UserRound className="h-4 w-4" />
            Миний профайл
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onSelect={(event) => {
            event.preventDefault();
            void handleSignOut();
          }}
        >
          {isSigningOut ? <Loader2 className="h-4 w-4 animate-spin" /> : <LogOut className="h-4 w-4" />}
          Системээс гарах
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
