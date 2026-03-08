export type AdminStatus = 'Шинэ' | 'Хүлээгдэж байна' | 'Идэвхтэй' | 'Дууссан' | 'Хаасан';

export const inventoryByProductId: Record<
  string,
  { stock: number; status: 'Бэлэн' | 'Цөөн' | 'Захиалгаар'; featured: boolean }
> = {
  '1': { stock: 2, status: 'Цөөн', featured: true },
  '2': { stock: 1, status: 'Захиалгаар', featured: true },
  '3': { stock: 4, status: 'Бэлэн', featured: false },
  '4': { stock: 3, status: 'Цөөн', featured: false },
  '5': { stock: 6, status: 'Бэлэн', featured: false },
  '6': { stock: 7, status: 'Бэлэн', featured: false },
  '7': { stock: 2, status: 'Цөөн', featured: true },
  '8': { stock: 5, status: 'Бэлэн', featured: false },
};

export const customOrderRequests = [
  {
    id: 'CO-260308-01',
    customer: 'Энхжин',
    contact: 'enkhjin@gmail.com',
    requestedItem: 'Захиалгат хөөрөг',
    materials: 'Мөнгө, оюу, шүр',
    budget: '$2,400',
    status: 'Хүлээгдэж байна' as AdminStatus,
    date: '2026-03-08',
  },
  {
    id: 'CO-260307-02',
    customer: 'Бат-Оргил',
    contact: 'borgil@yahoo.com',
    requestedItem: 'Гэр бүлийн бөгж',
    materials: 'Алт, номин',
    budget: '$1,350',
    status: 'Идэвхтэй' as AdminStatus,
    date: '2026-03-07',
  },
  {
    id: 'CO-260305-03',
    customer: 'Оюунгэрэл',
    contact: 'oyuna@mail.mn',
    requestedItem: 'Өлзий хээтэй бугуйвч',
    materials: 'Хүрэл, мөнгө',
    budget: '$890',
    status: 'Шинэ' as AdminStatus,
    date: '2026-03-05',
  },
  {
    id: 'CO-260301-04',
    customer: 'Наранцэцэг',
    contact: 'naranaa@gmail.com',
    requestedItem: 'Шүрэн зүүлт',
    materials: 'Мөнгө, шүр',
    budget: '$1,950',
    status: 'Дууссан' as AdminStatus,
    date: '2026-03-01',
  },
];

export const inquiryMessages = [
  {
    id: 'IN-260308-01',
    name: 'Мөнхбаяр',
    channel: 'Website',
    topic: 'Хөөрөгний материал лавлах',
    contact: 'munkhbayar@gmail.com',
    status: 'Шинэ' as AdminStatus,
    date: '2026-03-08',
  },
  {
    id: 'IN-260307-02',
    name: 'Саруул',
    channel: 'Email',
    topic: 'Том хэмжээтэй бөгж захиалах',
    contact: 'saruul@gmail.com',
    status: 'Хүлээгдэж байна' as AdminStatus,
    date: '2026-03-07',
  },
  {
    id: 'IN-260306-03',
    name: 'Temuulen',
    channel: 'Instagram',
    topic: 'Хаяг, ажиллах цаг',
    contact: '@temuulen',
    status: 'Хаасан' as AdminStatus,
    date: '2026-03-06',
  },
];

export const operationalTasks = [
  {
    title: 'Шинэ захиалгын хүсэлтүүд',
    description: 'Өнөөдрийн 3 хүсэлтийг үнэлж, дархны баг руу оноох.',
    progress: 42,
  },
  {
    title: 'Нөөц багатай бүтээгдэхүүн',
    description: 'Хөөрөг ба шүрэн зүүлтийн нөөцөд анхаарах.',
    progress: 65,
  },
  {
    title: 'Контент шинэчлэлт',
    description: 'Нүүр хуудасны каталогийн зураг, тайлбарыг шинэчлэх.',
    progress: 78,
  },
];

export const performanceSummary = [
  { label: 'Сарын борлуулалтын зорилт', value: 74 },
  { label: 'Захиалгын боловсруулалт', value: 58 },
  { label: 'Хэрэглэгчийн хариу өгөх хугацаа', value: 86 },
];
