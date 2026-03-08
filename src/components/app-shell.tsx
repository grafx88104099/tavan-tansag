'use client';

import type { ReactNode } from 'react';
import { usePathname } from 'next/navigation';

import { Footer } from '@/components/footer';
import { Header } from '@/components/header';
import { SnuffBottleBot } from '@/components/snuff-bottle-bot';

type AppShellProps = {
  children: ReactNode;
};

export function AppShell({ children }: AppShellProps) {
  const pathname = usePathname();
  const isAdminRoute = pathname.startsWith('/admin');

  return (
    <div className="flex min-h-screen flex-col">
      {!isAdminRoute && <Header />}
      <main className="flex-grow">{children}</main>
      {!isAdminRoute && <Footer />}
      {!isAdminRoute && <SnuffBottleBot />}
    </div>
  );
}
