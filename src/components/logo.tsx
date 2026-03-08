import Link from 'next/link';
import { cn } from '@/lib/utils';

type LogoProps = {
  className?: string;
};

export function Logo({ className }: LogoProps) {
  return (
    <Link
      href="/"
      aria-label="Eternal Adornments"
      className={cn(
        'inline-flex items-center px-1 py-1 transition-opacity duration-300 hover:opacity-85',
        className
      )}
    >
      <img
        src="/logo.svg"
        alt="Eternal Adornments"
        className="block h-10 w-auto md:h-11"
      />
    </Link>
  );
}
