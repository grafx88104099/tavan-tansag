'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X } from 'lucide-react';
import { useState } from 'react';

import { BRAND_SLOGAN } from '@/lib/brand';
import { AccountControls } from '@/components/account-controls';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Logo } from '@/components/logo';
import { cn } from '@/lib/utils';

const navLinks = [
  { href: '/', label: 'Нүүр' },
  { href: '/heritage', label: 'Өв соёл' },
];

export function Header() {
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  const NavLink = ({ href, label, className }: { href: string; label: string; className?: string }) => {
    const isActive = pathname === href;
    return (
      <Link
        href={href}
        onClick={() => setMobileMenuOpen(false)}
        className={cn(
          'rounded-full px-4 py-2 text-sm font-medium transition-all duration-300 hover:text-primary',
          isActive
            ? 'bg-primary/10 text-primary shadow-[inset_0_0_0_1px_rgba(173,129,78,0.15)]'
            : 'text-foreground/75 hover:bg-white/60',
          className
        )}
      >
        {label}
      </Link>
    );
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/60 bg-white">
      <div className="container flex min-h-[5rem] items-center gap-4">
        <Logo />

        <nav className="hidden xl:flex items-center gap-2">
          {navLinks.map((link) => (
            <NavLink key={link.href} {...link} />
          ))}
        </nav>

        <div className="ml-auto hidden items-center gap-4 xl:flex">
          <p className="max-w-[18rem] text-right text-[11px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
            {BRAND_SLOGAN}
          </p>
          <AccountControls />
        </div>

        <div className="ml-auto flex items-center xl:hidden">
          <Sheet open={isMobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild className="xl:hidden">
              <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Цэс нээх</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-full border-l border-border/60 bg-[rgba(250,244,236,0.96)] p-0 sm:max-w-sm">
              <div className="flex h-full flex-col">
                <div className="space-y-4 border-b border-border/60 p-5">
                  <div className="flex items-center justify-between">
                    <Logo />
                    <Button variant="ghost" size="icon" onClick={() => setMobileMenuOpen(false)}>
                      <X className="h-6 w-6" />
                      <span className="sr-only">Цэс хаах</span>
                    </Button>
                  </div>
                  <div className="rounded-[1.5rem] border border-primary/15 bg-white/65 p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary">{BRAND_SLOGAN}</p>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">
                      Монгол уламжлалт хээ, таван хошуу малын бэлгэдэл, үе дамжих эрхэм хийцийг нэг дороос.
                    </p>
                  </div>
                </div>
                <nav className="flex flex-col gap-2 p-5">
                  {navLinks.map((link) => (
                    <NavLink key={link.href} {...link} className="px-5 py-4 text-base" />
                  ))}
                </nav>
                <div className="mt-auto space-y-3 p-5">
                  <AccountControls mobile onNavigate={() => setMobileMenuOpen(false)} />
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>

      </div>
    </header>
  );
}
