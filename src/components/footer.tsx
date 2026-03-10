'use client';

import { useFooterMark } from '@/hooks/use-store-data';

export function Footer() {
  const { footerMark } = useFooterMark();
  const footerImageSrc = footerMark.imageUrl || '/footer-mark.svg';

  return (
    <footer className="mt-20 border-t border-border/60 bg-white">
      <div className="container py-7">
        <div className="flex items-stretch gap-4 md:gap-6">
          <div className="hidden shrink-0 self-stretch sm:flex sm:items-stretch">
            <img
              src={footerImageSrc}
              alt=""
              aria-hidden="true"
              className="h-full w-auto max-w-[4.5rem] object-contain md:max-w-[5.25rem]"
            />
          </div>

          <div className="min-w-0 flex-1">
            <div className="space-y-1 text-sm leading-5 text-foreground/80">
              <p>Утас: 8811 1323</p>
              <p>Мэйл хаяг: amardelgerekh@gmail.com</p>
              <p>Хаяг: Урт цагааны гудамж Таван тансаг</p>
              <p>Web: tavan-tansag.mn</p>
            </div>
            <div className="mt-3 border-t border-border/60 pt-3 text-sm text-muted-foreground">
              <p>&copy; 2026 Таван тансаг. Бүх эрх хуулиар хамгаалагдсан.</p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
