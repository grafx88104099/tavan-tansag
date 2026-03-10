import type { ReactNode } from 'react';

export default function AdminLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,rgba(255,251,245,0.58),rgba(239,226,209,0.72))] pb-10">
      {children}
    </div>
  );
}
