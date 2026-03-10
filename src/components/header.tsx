'use client';

import { BRAND_SLOGAN } from '@/lib/brand';
import { AccountControls } from '@/components/account-controls';
import { Logo } from '@/components/logo';

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/60 bg-white">
      <div className="container flex min-h-[5rem] items-center gap-4">
        <Logo />
        <p className="ml-auto hidden max-w-[18rem] text-right text-[11px] font-semibold uppercase tracking-[0.22em] text-muted-foreground md:block">
          {BRAND_SLOGAN}
        </p>
        <div className="flex items-center">
          <AccountControls />
        </div>
      </div>
    </header>
  );
}
