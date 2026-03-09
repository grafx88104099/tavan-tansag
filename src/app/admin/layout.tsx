import type { ReactNode } from 'react';

export default function AdminLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return <div className="min-h-screen pb-16">{children}</div>;
}
