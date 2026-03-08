'use client';

import { AlertCircle, Gem, Mail, Package2, ShoppingBag, Sparkles } from 'lucide-react';

import {
  customOrderRequests,
  inquiryMessages,
  inventoryByProductId,
  operationalTasks,
  performanceSummary,
} from '@/lib/admin-data';
import { getCategoryLabel, getProductDisplayName } from '@/lib/product-copy';
import { getProducts } from '@/lib/products';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

function getStatusBadgeClass(status: string) {
  switch (status) {
    case 'Шинэ':
      return 'border-sky-500/25 bg-sky-500/10 text-sky-700';
    case 'Хүлээгдэж байна':
      return 'border-amber-500/25 bg-amber-500/10 text-amber-700';
    case 'Идэвхтэй':
      return 'border-primary/20 bg-primary/10 text-primary';
    case 'Дууссан':
      return 'border-emerald-500/25 bg-emerald-500/10 text-emerald-700';
    default:
      return 'border-zinc-500/25 bg-zinc-500/10 text-zinc-700';
  }
}

function getInventoryBadgeClass(status: string) {
  switch (status) {
    case 'Бэлэн':
      return 'border-emerald-500/25 bg-emerald-500/10 text-emerald-700';
    case 'Цөөн':
      return 'border-amber-500/25 bg-amber-500/10 text-amber-700';
    default:
      return 'border-rose-500/25 bg-rose-500/10 text-rose-700';
  }
}

export default function AdminDashboardPage() {
  const products = getProducts();
  const lowStockCount = Object.values(inventoryByProductId).filter((item) => item.stock <= 3).length;
  const activeRequestsCount = customOrderRequests.filter((item) => item.status !== 'Дууссан').length;
  const newInquiryCount = inquiryMessages.filter((item) => item.status === 'Шинэ').length;
  const featuredCount = Object.values(inventoryByProductId).filter((item) => item.featured).length;

  return (
    <Tabs defaultValue="overview" className="space-y-6">
      <div className="section-shell px-6 py-6 md:px-8">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <p className="text-sm leading-7 text-muted-foreground">
              Бүтээгдэхүүний нөөц, захиалгын хүсэлт, хэрэглэгчийн мессеж, холбоо барих мэдээллийг нэг урсгалаар хянах боломжтой.
            </p>
          </div>
          <TabsList className="h-auto flex-wrap justify-start rounded-[1.4rem] bg-primary/8 p-1.5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="products">Products</TabsTrigger>
            <TabsTrigger value="requests">Requests</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>
        </div>
      </div>

      <TabsContent value="overview" className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <Card>
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <CardDescription>Нийт бүтээгдэхүүн</CardDescription>
                  <CardTitle>{products.length}</CardTitle>
                </div>
                <div className="rounded-2xl border border-primary/15 bg-primary/10 p-3 text-primary">
                  <Package2 className="h-5 w-5" />
                </div>
              </div>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <CardDescription>Идэвхтэй хүсэлт</CardDescription>
                  <CardTitle>{activeRequestsCount}</CardTitle>
                </div>
                <div className="rounded-2xl border border-primary/15 bg-primary/10 p-3 text-primary">
                  <ShoppingBag className="h-5 w-5" />
                </div>
              </div>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <CardDescription>Шинэ inquiry</CardDescription>
                  <CardTitle>{newInquiryCount}</CardTitle>
                </div>
                <div className="rounded-2xl border border-primary/15 bg-primary/10 p-3 text-primary">
                  <Mail className="h-5 w-5" />
                </div>
              </div>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <CardDescription>Нөөц багатай</CardDescription>
                  <CardTitle>{lowStockCount}</CardTitle>
                </div>
                <div className="rounded-2xl border border-primary/15 bg-primary/10 p-3 text-primary">
                  <AlertCircle className="h-5 w-5" />
                </div>
              </div>
            </CardHeader>
          </Card>
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
          <Card>
            <CardHeader>
              <CardDescription>Сүүлийн custom order хүсэлтүүд</CardDescription>
              <CardTitle>Recent requests</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Код</TableHead>
                    <TableHead>Хэрэглэгч</TableHead>
                    <TableHead>Бүтээл</TableHead>
                    <TableHead>Төлөв</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {customOrderRequests.slice(0, 4).map((request) => (
                    <TableRow key={request.id}>
                      <TableCell className="font-medium">{request.id}</TableCell>
                      <TableCell>{request.customer}</TableCell>
                      <TableCell>{request.requestedItem}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={getStatusBadgeClass(request.status)}>
                          {request.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardDescription>Өдөр тутмын ахиц</CardDescription>
              <CardTitle>Operational focus</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              {operationalTasks.map((task) => (
                <div key={task.title} className="space-y-3 rounded-[1.4rem] border border-primary/12 bg-white/60 p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="font-semibold text-foreground">{task.title}</p>
                      <p className="mt-1 text-sm leading-6 text-muted-foreground">{task.description}</p>
                    </div>
                    <Badge variant="outline">{task.progress}%</Badge>
                  </div>
                  <Progress value={task.progress} />
                </div>
              ))}

              <Separator />

              <div className="grid gap-4 md:grid-cols-3">
                {performanceSummary.map((item) => (
                  <div key={item.label} className="rounded-[1.4rem] border border-primary/12 bg-white/60 p-4">
                    <p className="text-sm text-muted-foreground">{item.label}</p>
                    <p className="mt-3 text-2xl font-semibold text-foreground">{item.value}%</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </TabsContent>

      <TabsContent value="products" className="space-y-6">
        <Card>
          <CardHeader>
            <CardDescription>Бүтээгдэхүүний жагсаалт</CardDescription>
            <CardTitle>Catalog inventory</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Бүтээл</TableHead>
                  <TableHead>Ангилал</TableHead>
                  <TableHead>Нөөц</TableHead>
                  <TableHead>Төлөв</TableHead>
                  <TableHead>Онцлох</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.map((product) => {
                  const inventory = inventoryByProductId[product.id];
                  return (
                    <TableRow key={product.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium text-foreground">{getProductDisplayName(product)}</p>
                          <p className="text-sm text-muted-foreground">${product.price.toLocaleString()}</p>
                        </div>
                      </TableCell>
                      <TableCell>{getCategoryLabel(product.category)}</TableCell>
                      <TableCell>{inventory.stock} ш</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={getInventoryBadgeClass(inventory.status)}>
                          {inventory.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {inventory.featured ? (
                          <Badge variant="outline" className="border-primary/20 bg-primary/10 text-primary">
                            Онцлох
                          </Badge>
                        ) : (
                          <Badge variant="outline">Энгийн</Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="requests" className="space-y-6">
        <div className="grid gap-6 xl:grid-cols-2">
          <Card>
            <CardHeader>
              <CardDescription>Захиалгат хүсэлтүүд</CardDescription>
              <CardTitle>Custom orders</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Хэрэглэгч</TableHead>
                    <TableHead>Бүтээл</TableHead>
                    <TableHead>Төсөв</TableHead>
                    <TableHead>Төлөв</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {customOrderRequests.map((request) => (
                    <TableRow key={request.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium text-foreground">{request.customer}</p>
                          <p className="text-sm text-muted-foreground">{request.contact}</p>
                        </div>
                      </TableCell>
                      <TableCell>{request.requestedItem}</TableCell>
                      <TableCell>{request.budget}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={getStatusBadgeClass(request.status)}>
                          {request.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardDescription>Орж ирсэн inquiry-ууд</CardDescription>
              <CardTitle>Customer messages</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Нэр</TableHead>
                    <TableHead>Суваг</TableHead>
                    <TableHead>Сэдэв</TableHead>
                    <TableHead>Төлөв</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {inquiryMessages.map((message) => (
                    <TableRow key={message.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium text-foreground">{message.name}</p>
                          <p className="text-sm text-muted-foreground">{message.contact}</p>
                        </div>
                      </TableCell>
                      <TableCell>{message.channel}</TableCell>
                      <TableCell>{message.topic}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={getStatusBadgeClass(message.status)}>
                          {message.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </TabsContent>

      <TabsContent value="settings" className="space-y-6">
        <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
          <Card>
            <CardHeader>
              <CardDescription>Холбоо ба брэнд</CardDescription>
              <CardTitle>Business settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-[1.4rem] border border-primary/12 bg-white/60 p-4">
                <p className="text-sm text-muted-foreground">Утас</p>
                <p className="mt-1 font-medium text-foreground">8811 1323</p>
              </div>
              <div className="rounded-[1.4rem] border border-primary/12 bg-white/60 p-4">
                <p className="text-sm text-muted-foreground">Имэйл</p>
                <p className="mt-1 font-medium text-foreground">amardelgerekh@gmail.com</p>
              </div>
              <div className="rounded-[1.4rem] border border-primary/12 bg-white/60 p-4">
                <p className="text-sm text-muted-foreground">Хаяг</p>
                <p className="mt-1 font-medium text-foreground">Урт цагааны гудамж Таван тансаг</p>
              </div>
              <div className="rounded-[1.4rem] border border-primary/12 bg-white/60 p-4">
                <p className="text-sm text-muted-foreground">Web</p>
                <p className="mt-1 font-medium text-foreground">tavan-tansag.mn</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardDescription>Сайтын modules</CardDescription>
              <CardTitle>Current setup</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-4 rounded-[1.4rem] border border-primary/12 bg-white/60 p-4">
                <Gem className="mt-0.5 h-5 w-5 text-primary" />
                <div>
                  <p className="font-medium text-foreground">Бүтээгдэхүүний каталог</p>
                  <p className="mt-1 text-sm leading-6 text-muted-foreground">
                    Нүүр хуудас каталог хэлбэрт шилжсэн, хайлт ба шүүлтүүр идэвхтэй байна.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4 rounded-[1.4rem] border border-primary/12 bg-white/60 p-4">
                <Mail className="mt-0.5 h-5 w-5 text-primary" />
                <div>
                  <p className="font-medium text-foreground">Холбоо барих ба custom order</p>
                  <p className="mt-1 text-sm leading-6 text-muted-foreground">
                    Form UI бэлэн, харин persistence холболт хийхэд server/database дараагийн алхам шаардлагатай.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4 rounded-[1.4rem] border border-primary/12 bg-white/60 p-4">
                <Sparkles className="mt-0.5 h-5 w-5 text-primary" />
                <div>
                  <p className="font-medium text-foreground">AI tools</p>
                  <p className="mt-1 text-sm leading-6 text-muted-foreground">
                    Story generator ба хөөрөг танигч интерфейс бэлэн, API key тохиргоотой үед ашиглах боломжтой.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </TabsContent>
    </Tabs>
  );
}
