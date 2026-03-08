import type { Metadata } from 'next';
import { Cormorant_Garamond, Manrope } from 'next/font/google';

import './globals.css';
import { AppShell } from '@/components/app-shell';
import { AuthProvider } from '@/components/auth-provider';
import { FirebaseAnalytics } from '@/components/firebase-analytics';
import { Toaster } from '@/components/ui/toaster';

const headlineFont = Cormorant_Garamond({
  subsets: ['latin', 'cyrillic'],
  variable: '--font-headline',
  weight: ['400', '500', '600', '700'],
});

const bodyFont = Manrope({
  subsets: ['latin', 'cyrillic'],
  variable: '--font-body',
  weight: ['400', '500', '600', '700', '800'],
});

export const metadata: Metadata = {
  title: 'Мөнх Үргэлжлэх Монгол Өв',
  description: 'Монгол уламжлалт хээ, таван хошуу малын бэлгэдэл, эрхэм хийцийг нэгтгэсэн өвийн орон зай.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="mn">
      <body className={`${headlineFont.variable} ${bodyFont.variable} font-body antialiased`}>
        <div className="pointer-events-none fixed inset-0 -z-20 bg-[radial-gradient(circle_at_top_left,rgba(255,239,218,0.2),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(80,49,20,0.16),transparent_30%)]" />
        <div className="brand-pattern pointer-events-none fixed inset-0 -z-10 opacity-60" />
        <AuthProvider>
          <FirebaseAnalytics />
          <AppShell>{children}</AppShell>
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  );
}
