import Link from 'next/link';
import { ArrowUpRight, LayoutDashboard, MessageSquareText, Package2, Settings2, ShieldCheck } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Logo } from '@/components/logo';

const adminModules = [
  {
    title: 'Overview',
    description: 'Өнөөдрийн гол үзүүлэлт, үйл ажиллагааны хураангуй.',
    icon: LayoutDashboard,
  },
  {
    title: 'Products',
    description: 'Бүтээгдэхүүний нөөц, онцлох эсэх, үнэ.',
    icon: Package2,
  },
  {
    title: 'Requests',
    description: 'Захиалгат хүсэлт, орж ирсэн inquiry-ууд.',
    icon: MessageSquareText,
  },
  {
    title: 'Settings',
    description: 'Холбоо барих мэдээлэл, админ access, site modules.',
    icon: Settings2,
  },
];

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="min-h-screen py-8 md:py-10">
      <div className="container grid gap-6 xl:grid-cols-[280px_1fr]">
        <aside className="section-shell px-6 py-8 md:px-8">
          <div className="space-y-6">
            <div className="space-y-4">
              <Logo />
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary">Admin workspace</p>
                <h1 className="mt-2 text-4xl font-semibold">Төслийн удирдлага</h1>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  Таван тансаг төслийн бүтээгдэхүүн, захиалга, хэрэглэгчийн сувгийг нэг дороос удирдах internal хэсэг.
                </p>
              </div>
            </div>

            <div className="space-y-3">
              {adminModules.map((module) => (
                <div key={module.title} className="rounded-[1.4rem] border border-primary/12 bg-white/60 p-4">
                  <div className="flex items-center gap-3">
                    <div className="rounded-2xl border border-primary/15 bg-primary/10 p-2 text-primary">
                      <module.icon className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">{module.title}</p>
                      <p className="text-sm leading-6 text-muted-foreground">{module.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="rounded-[1.4rem] border border-primary/12 bg-[rgba(255,255,255,0.72)] p-4">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-primary" />
                <p className="font-semibold text-foreground">Access</p>
              </div>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Энэ админ хэсэг нь UI/операцын суурь бүтэцтэй. Нэвтрэлт, өгөгдөл хадгалалт, role management-ийг дараагийн шатанд өргөтгөж болно.
              </p>
            </div>
          </div>
        </aside>

        <div className="space-y-6">
          <div className="section-shell flex flex-col gap-4 px-6 py-6 md:flex-row md:items-center md:justify-between md:px-8">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary">Admin area</p>
              <h2 className="mt-2 text-3xl font-semibold md:text-4xl">Өдөр тутмын удирдлагын самбар</h2>
            </div>
            <Button asChild variant="outline">
              <Link href="/">
                Сайт руу буцах
                <ArrowUpRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>

          {children}
        </div>
      </div>
    </div>
  );
}
