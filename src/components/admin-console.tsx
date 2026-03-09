'use client';

import { useEffect, useMemo, useState, type ChangeEvent, type FormEvent } from 'react';
import Link from 'next/link';
import {
  collection,
  deleteDoc,
  doc,
  serverTimestamp,
  setDoc,
  Timestamp,
  writeBatch,
} from 'firebase/firestore';
import { deleteObject, getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import {
  Loader2,
  LogOut,
  Pencil,
  Plus,
  ShieldCheck,
  Trash2,
  Upload,
  UserRound,
  Video,
} from 'lucide-react';

import { useAuth } from '@/components/auth-provider';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { useCatalogProducts, useHeritageReel, useUserProfiles } from '@/hooks/use-store-data';
import { useToast } from '@/hooks/use-toast';
import { ADMIN_EMAILS } from '@/lib/admin-access';
import { getAuthErrorMessage, getProviderLabel, getUserInitial } from '@/lib/auth-utils';
import { firestoreDb, firebaseStorage } from '@/lib/firebase';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import {
  getCategoryLabel,
  getMaterialLabel,
  getProductDisplayDescription,
  getProductDisplayName,
  getStoneLabel,
} from '@/lib/product-copy';
import {
  PRODUCT_CATEGORIES,
  PRODUCT_MATERIALS,
  PRODUCT_STONE_TYPES,
  getProducts,
} from '@/lib/products';
import type { Product, UserProfile } from '@/lib/types';

type ProductFormState = {
  id: string | null;
  name: string;
  category: Product['category'];
  stoneType: Product['stoneType'];
  material: Product['material'];
  description: string;
  size: string;
  price: string;
  coverImageUrl: string;
  coverImageHint: string;
  images: string[];
  createdAt: Date | null;
  coverImagePath: string | null;
};

type DeleteDialogState =
  | {
      kind: 'product';
      product: Product;
    }
  | {
      kind: 'heritage';
    };

const DEFAULT_PRODUCT_FORM: ProductFormState = {
  id: null,
  name: '',
  category: 'Snuff Bottle',
  stoneType: 'Turquoise',
  material: 'Silver',
  description: '',
  size: '',
  price: '',
  coverImageUrl: '',
  coverImageHint: '',
  images: [],
  createdAt: null,
  coverImagePath: null,
};

function getFileExtension(file: File) {
  const extension = file.name.split('.').pop()?.toLowerCase();
  if (extension) {
    return extension;
  }

  if (file.type === 'video/webm') {
    return 'webm';
  }

  if (file.type === 'image/png') {
    return 'png';
  }

  if (file.type === 'image/webp') {
    return 'webp';
  }

  return 'jpg';
}

function createProductForm(product?: Product): ProductFormState {
  if (!product) {
    return DEFAULT_PRODUCT_FORM;
  }

  return {
    id: product.id,
    name: product.name,
    category: product.category,
    stoneType: product.stoneType,
    material: product.material,
    description: product.description,
    size: product.size,
    price: product.price.toString(),
    coverImageUrl: product.coverImageUrl ?? '',
    coverImageHint: product.coverImageHint ?? '',
    images: product.images,
    createdAt: product.createdAt ?? null,
    coverImagePath: product.coverImagePath ?? null,
  };
}

function normalizePriceInput(value: string) {
  const sanitizedValue = value.replace(',', '.').replace(/[^\d.]/g, '');
  const parts = sanitizedValue.split('.');

  if (parts.length <= 1) {
    return sanitizedValue;
  }

  return `${parts[0]}.${parts.slice(1).join('')}`;
}

function parsePriceInput(value: string) {
  const normalizedValue = normalizePriceInput(value);

  if (!normalizedValue) {
    return Number.NaN;
  }

  return Number(normalizedValue);
}

function formatAdminDate(value: Date | null) {
  if (!value) {
    return 'Шинэ';
  }

  return new Intl.DateTimeFormat('mn-MN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(value);
}

function isBootstrapAdmin(email: string | null | undefined) {
  if (!email) {
    return false;
  }

  return ADMIN_EMAILS.includes(email.trim().toLowerCase());
}

export function AdminConsole() {
  const { toast } = useToast();
  const {
    authStatus,
    authErrorMessage,
    clearAuthError,
    currentUser,
    profile,
    isAdmin,
    signInWithEmail,
    signInWithGoogle,
    signOutUser,
  } = useAuth();
  const {
    products,
    isUsingFallback,
    hasRemoteProducts,
  } = useCatalogProducts();
  const { heritageReel } = useHeritageReel();
  const { userProfiles, isLoading: isUsersLoading } = useUserProfiles();

  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isGooglePending, setIsGooglePending] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [isSeedingProducts, setIsSeedingProducts] = useState(false);
  const [productForm, setProductForm] = useState<ProductFormState>(DEFAULT_PRODUCT_FORM);
  const [productImageFile, setProductImageFile] = useState<File | null>(null);
  const [isProductDialogOpen, setIsProductDialogOpen] = useState(false);
  const [isSavingProduct, setIsSavingProduct] = useState(false);
  const [isDeletingProductId, setIsDeletingProductId] = useState<string | null>(null);
  const [heritageTitle, setHeritageTitle] = useState(heritageReel.title);
  const [heritagePosterImageUrl, setHeritagePosterImageUrl] = useState(heritageReel.posterImageUrl ?? '');
  const [heritageVideoFile, setHeritageVideoFile] = useState<File | null>(null);
  const [isSavingHeritage, setIsSavingHeritage] = useState(false);
  const [isRemovingHeritage, setIsRemovingHeritage] = useState(false);
  const [isUpdatingUserRoleId, setIsUpdatingUserRoleId] = useState<string | null>(null);
  const [deleteDialog, setDeleteDialog] = useState<DeleteDialogState | null>(null);

  const allowedAdminEmailsLabel = ADMIN_EMAILS.join(', ');
  const placeholderPoster = PlaceHolderImages.find((item) => item.id === 'hero-heritage')?.imageUrl ?? null;
  const effectivePosterImage = heritagePosterImageUrl || heritageReel.posterImageUrl || placeholderPoster;
  const orderedProducts = useMemo(
    () => [...products].sort((a, b) => a.name.localeCompare(b.name)),
    [products]
  );
  const liveProducts = hasRemoteProducts ? orderedProducts : [];
  const productImagePreview = useMemo(() => {
    if (!productImageFile) {
      return null;
    }

    return URL.createObjectURL(productImageFile);
  }, [productImageFile]);
  const effectiveProductPreview = productImagePreview || productForm.coverImageUrl.trim() || null;
  const deleteDialogTitle =
    deleteDialog?.kind === 'product' ? 'Бүтээгдэхүүнийг устгах уу?' : 'Өв соёлын видеог устгах уу?';
  const deleteDialogDescription =
    deleteDialog?.kind === 'product'
      ? `"${deleteDialog.product.name}" бүтээгдэхүүн нүүр хуудасны каталогоос бүрэн устах бөгөөд энэ үйлдлийг буцаах боломжгүй.`
      : 'Одоогийн heritage reel video болон холбогдсон зам устах бөгөөд /heritage хуудсанд placeholder төлөв үлдэнэ.';
  const deleteDialogActionLabel =
    deleteDialog?.kind === 'product' ? 'Бүтээгдэхүүн устгах' : 'Видео устгах';
  const isDeleteActionPending =
    deleteDialog?.kind === 'product'
      ? isDeletingProductId === deleteDialog.product.id
      : isRemovingHeritage;

  useEffect(() => {
    setHeritageTitle(heritageReel.title);
    setHeritagePosterImageUrl(heritageReel.posterImageUrl ?? '');
  }, [heritageReel.posterImageUrl, heritageReel.title]);

  useEffect(() => {
    return () => {
      if (productImagePreview) {
        URL.revokeObjectURL(productImagePreview);
      }
    };
  }, [productImagePreview]);

  useEffect(() => {
    if (!authErrorMessage) {
      return;
    }

    toast({
      title: 'Google admin login амжилтгүй',
      description: authErrorMessage,
      variant: 'destructive',
    });
    clearAuthError();
  }, [authErrorMessage, clearAuthError, toast]);

  async function handleAdminLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    try {
      setIsLoggingIn(true);
      await signInWithEmail({ email: adminEmail, password: adminPassword });
      toast({
        title: 'Админ нэвтрэлт амжилттай',
        description: 'Удирдлагын хэсэг нээгдлээ.',
      });
    } catch (error) {
      toast({
        title: 'Админ нэвтрэлт амжилтгүй',
        description: getAuthErrorMessage(error),
        variant: 'destructive',
      });
    } finally {
      setIsLoggingIn(false);
    }
  }

  async function handleGoogleAdminLogin() {
    try {
      setIsGooglePending(true);
      await signInWithGoogle();
      toast({
        title: 'Google-ээр амжилттай нэвтэрлээ',
        description: 'Админ access шалгагдаж байна.',
      });
    } catch (error) {
      toast({
        title: 'Google admin login амжилтгүй',
        description: getAuthErrorMessage(error),
        variant: 'destructive',
      });
    } finally {
      setIsGooglePending(false);
    }
  }

  async function handleSignOut() {
    try {
      setIsSigningOut(true);
      await signOutUser();
    } catch (error) {
      toast({
        title: 'Системээс гарч чадсангүй',
        description: getAuthErrorMessage(error),
        variant: 'destructive',
      });
    } finally {
      setIsSigningOut(false);
    }
  }

  async function handleUserRoleChange(userProfile: UserProfile, nextRole: UserProfile['role']) {
    if (!firestoreDb) {
      toast({
        title: 'Firestore холбогдоогүй байна',
        description: 'Firebase тохиргоог шалгана уу.',
        variant: 'destructive',
      });
      return;
    }

    if (userProfile.role === nextRole) {
      return;
    }

    if (nextRole === 'customer' && isBootstrapAdmin(userProfile.email)) {
      toast({
        title: 'Allowlist админыг customer болгож болохгүй',
        description: 'Энэ и-мэйл bootstrap admin тул admin хэвээр үлдэнэ.',
        variant: 'destructive',
      });
      return;
    }

    try {
      setIsUpdatingUserRoleId(userProfile.uid);
      await setDoc(
        doc(firestoreDb, 'users', userProfile.uid),
        {
          uid: userProfile.uid,
          email: userProfile.email,
          displayName: userProfile.displayName,
          photoURL: userProfile.photoURL,
          providerIds: userProfile.providerIds,
          role: nextRole,
          createdAt: userProfile.createdAt ? Timestamp.fromDate(userProfile.createdAt) : serverTimestamp(),
          updatedAt: serverTimestamp(),
          lastLoginAt: userProfile.lastLoginAt ? Timestamp.fromDate(userProfile.lastLoginAt) : serverTimestamp(),
        },
        { merge: true }
      );

      toast({
        title: nextRole === 'admin' ? 'Хэрэглэгч админ боллоо' : 'Хэрэглэгч customer боллоо',
        description: userProfile.email ?? userProfile.displayName ?? 'Хэрэглэгчийн эрх шинэчлэгдлээ.',
      });
    } catch (error) {
      toast({
        title: 'Role шинэчилж чадсангүй',
        description: getAuthErrorMessage(error),
        variant: 'destructive',
      });
    } finally {
      setIsUpdatingUserRoleId(null);
    }
  }

  async function handleSeedProducts() {
    if (!firestoreDb) {
      toast({
        title: 'Firestore холбогдоогүй байна',
        description: 'Firebase тохиргоог шалгана уу.',
        variant: 'destructive',
      });
      return;
    }

    try {
      setIsSeedingProducts(true);
      const batch = writeBatch(firestoreDb);

      for (const product of getProducts()) {
        const productRef = doc(firestoreDb, 'products', product.id);
        batch.set(productRef, {
          name: getProductDisplayName(product),
          category: product.category,
          stoneType: product.stoneType,
          material: product.material,
          description: getProductDisplayDescription(product),
          size: product.size,
          price: product.price,
          images: product.images,
          coverImageUrl: product.coverImageUrl ?? null,
          coverImagePath: product.coverImagePath ?? null,
          coverImageHint: product.coverImageHint ?? null,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      }

      await batch.commit();
      toast({
        title: 'Бүтээгдэхүүнүүд Firebase руу орлоо',
        description: 'Одоо add/edit/delete үйлдлүүд live ажиллана.',
      });
    } catch (error) {
      toast({
        title: 'Импорт хийж чадсангүй',
        description: getAuthErrorMessage(error),
        variant: 'destructive',
      });
    } finally {
      setIsSeedingProducts(false);
    }
  }

  function handleCreateProduct() {
    resetProductForm();
    setIsProductDialogOpen(true);
  }

  function handleEditProduct(product: Product) {
    setProductForm(createProductForm(product));
    setProductImageFile(null);
    setIsProductDialogOpen(true);
  }

  function resetProductForm() {
    setProductForm(DEFAULT_PRODUCT_FORM);
    setProductImageFile(null);
  }

  async function handleSaveProduct(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!firestoreDb) {
      toast({
        title: 'Firestore холбогдоогүй байна',
        description: 'Firebase тохиргоог шалгана уу.',
        variant: 'destructive',
      });
      return;
    }

    const trimmedName = productForm.name.trim();
    const trimmedDescription = productForm.description.trim();
    const trimmedSize = productForm.size.trim();
    const priceValue = parsePriceInput(productForm.price);

    if (trimmedName.length < 2 || trimmedDescription.length < 10 || trimmedSize.length < 1 || !Number.isFinite(priceValue) || priceValue < 0) {
      toast({
        title: 'Бүтээгдэхүүний мэдээллээ шалгана уу',
        description: 'Нэр, тайлбар, хэмжээ, үнийг зөв бөглөөд дахин хадгална уу.',
        variant: 'destructive',
      });
      return;
    }

    try {
      setIsSavingProduct(true);
      const productId = productForm.id ?? doc(collection(firestoreDb, 'products')).id;
      let coverImageUrl = productForm.coverImageUrl.trim() || null;
      let coverImagePath = productForm.coverImagePath;

      if (productImageFile && firebaseStorage) {
        if (coverImagePath) {
          await deleteObject(ref(firebaseStorage, coverImagePath)).catch(() => null);
        }

        const extension = getFileExtension(productImageFile);
        const storagePath = `products/${productId}/cover-${Date.now()}.${extension}`;
        const storageRef = ref(firebaseStorage, storagePath);
        await uploadBytes(storageRef, productImageFile, {
          contentType: productImageFile.type,
        });
        coverImageUrl = await getDownloadURL(storageRef);
        coverImagePath = storagePath;
      }

      await setDoc(doc(firestoreDb, 'products', productId), {
        name: trimmedName,
        category: productForm.category,
        stoneType: productForm.stoneType,
        material: productForm.material,
        description: trimmedDescription,
        size: trimmedSize,
        price: priceValue,
        images: productForm.images,
        coverImageUrl,
        coverImagePath,
        coverImageHint: productForm.coverImageHint.trim() || null,
        createdAt: productForm.createdAt ? Timestamp.fromDate(productForm.createdAt) : serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      toast({
        title: productForm.id ? 'Бүтээгдэхүүн шинэчлэгдлээ' : 'Бүтээгдэхүүн нэмэгдлээ',
        description: 'Нүүр хуудасны каталог автоматаар шинэчлэгдэнэ.',
      });
      resetProductForm();
      setIsProductDialogOpen(false);
    } catch (error) {
      toast({
        title: 'Бүтээгдэхүүн хадгалж чадсангүй',
        description: getAuthErrorMessage(error),
        variant: 'destructive',
      });
    } finally {
      setIsSavingProduct(false);
    }
  }

  async function handleDeleteProduct(product: Product) {
    if (!firestoreDb) {
      return false;
    }

    try {
      setIsDeletingProductId(product.id);

      if (product.coverImagePath && firebaseStorage) {
        await deleteObject(ref(firebaseStorage, product.coverImagePath)).catch(() => null);
      }

      await deleteDoc(doc(firestoreDb, 'products', product.id));
      toast({
        title: 'Бүтээгдэхүүн устлаа',
        description: 'Нүүр хуудасны каталог шинэчлэгдлээ.',
      });

      if (productForm.id === product.id) {
        resetProductForm();
      }

      return true;
    } catch (error) {
      toast({
        title: 'Устгаж чадсангүй',
        description: getAuthErrorMessage(error),
        variant: 'destructive',
      });
      return false;
    } finally {
      setIsDeletingProductId(null);
    }
  }

  async function handleSaveHeritage(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!firestoreDb || !firebaseStorage) {
      toast({
        title: 'Firebase бүрэн холбогдоогүй байна',
        description: 'Firestore болон Storage тохиргоог шалгана уу.',
        variant: 'destructive',
      });
      return;
    }

    if (!heritageTitle.trim()) {
      toast({
        title: 'Гарчиг хоосон байна',
        description: 'Heritage видео хэсгийн гарчгийг оруулна уу.',
        variant: 'destructive',
      });
      return;
    }

    try {
      setIsSavingHeritage(true);
      let videoUrl = heritageReel.videoUrl;
      let videoPath = heritageReel.videoPath;

      if (heritageVideoFile) {
        if (videoPath) {
          await deleteObject(ref(firebaseStorage, videoPath)).catch(() => null);
        }

        const extension = getFileExtension(heritageVideoFile);
        const storagePath = `admin/heritage/heritage-reel-${Date.now()}.${extension}`;
        const storageRef = ref(firebaseStorage, storagePath);
        await uploadBytes(storageRef, heritageVideoFile, {
          contentType: heritageVideoFile.type,
        });
        videoUrl = await getDownloadURL(storageRef);
        videoPath = storagePath;
      }

      await setDoc(doc(firestoreDb, 'siteSettings', 'heritage'), {
        title: heritageTitle.trim() || 'Өв соёл',
        videoUrl,
        videoPath,
        posterImageUrl: heritagePosterImageUrl.trim() || null,
        updatedAt: serverTimestamp(),
      });

      toast({
        title: 'Heritage video шинэчлэгдлээ',
        description: '/heritage хуудас live шинэчлэгдэнэ.',
      });
      setHeritageVideoFile(null);
    } catch (error) {
      toast({
        title: 'Видео хадгалж чадсангүй',
        description: getAuthErrorMessage(error),
        variant: 'destructive',
      });
    } finally {
      setIsSavingHeritage(false);
    }
  }

  async function handleRemoveHeritageVideo() {
    if (!firestoreDb) {
      return false;
    }

    try {
      setIsRemovingHeritage(true);

      if (heritageReel.videoPath && firebaseStorage) {
        await deleteObject(ref(firebaseStorage, heritageReel.videoPath)).catch(() => null);
      }

      await setDoc(doc(firestoreDb, 'siteSettings', 'heritage'), {
        title: heritageTitle.trim() || 'Өв соёл',
        videoUrl: null,
        videoPath: null,
        posterImageUrl: heritagePosterImageUrl.trim() || null,
        updatedAt: serverTimestamp(),
      });

      toast({
        title: 'Heritage video устлаа',
        description: '/heritage хуудсанд placeholder frame үлдэнэ.',
      });
      setHeritageVideoFile(null);
      return true;
    } catch (error) {
      toast({
        title: 'Видео устгаж чадсангүй',
        description: getAuthErrorMessage(error),
        variant: 'destructive',
      });
      return false;
    } finally {
      setIsRemovingHeritage(false);
    }
  }

  async function handleConfirmDelete() {
    if (!deleteDialog) {
      return;
    }

    const didDelete =
      deleteDialog.kind === 'product'
        ? await handleDeleteProduct(deleteDialog.product)
        : await handleRemoveHeritageVideo();

    if (didDelete) {
      setDeleteDialog(null);
    }
  }

  if (authStatus === 'loading') {
    return (
      <div className="section-shell px-6 py-16 text-center md:px-10">
        <Loader2 className="mx-auto h-6 w-6 animate-spin text-primary" />
        <p className="mt-4 text-sm text-muted-foreground">Админ хэсгийг ачаалж байна...</p>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="mx-auto grid max-w-5xl gap-8 xl:grid-cols-[0.92fr_1.08fr]">
        <Card className="border-primary/12 bg-white/84">
          <CardContent className="space-y-6 p-7 md:p-10">
            <Badge variant="outline" className="border-primary/20 bg-primary/10 text-primary">
              Admin access
            </Badge>
            <div>
              <h1 className="text-4xl font-semibold md:text-5xl">Админ нэвтрэх</h1>
              <p className="mt-4 text-base leading-8 text-muted-foreground">
                Нүүр хуудасны бүтээгдэхүүн, heritage reel video, admin profile-ийг зөвхөн allowlisted имэйлээр удирдана.
              </p>
            </div>

            <div className="rounded-[1.5rem] border border-primary/12 bg-white/70 p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Allowed admin</p>
              <p className="mt-3 font-semibold text-foreground">{allowedAdminEmailsLabel}</p>
            </div>

            <Button type="button" variant="outline" className="w-full" onClick={handleGoogleAdminLogin} disabled={isGooglePending || isLoggingIn}>
              {isGooglePending ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4" />}
              Google-ээр админ нэвтрэх
            </Button>
          </CardContent>
        </Card>

        <Card className="border-primary/12 bg-white/88">
          <CardHeader className="p-7 pb-0 md:p-10 md:pb-0">
            <CardTitle className="text-3xl font-semibold">И-мэйлээр нэвтрэх</CardTitle>
            <CardDescription>Admin allowlist-д байгаа и-мэйлээр нэвтэрнэ.</CardDescription>
          </CardHeader>
          <CardContent className="p-7 md:p-10">
            <form className="space-y-5" onSubmit={handleAdminLogin}>
              <div className="space-y-2">
                <Label htmlFor="admin-email">И-мэйл</Label>
                <Input
                  id="admin-email"
                  type="email"
                  autoComplete="email"
                  value={adminEmail}
                  onChange={(event) => setAdminEmail(event.target.value)}
                  placeholder="amardelgerekh@gmail.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="admin-password">Нууц үг</Label>
                <Input
                  id="admin-password"
                  type="password"
                  autoComplete="current-password"
                  value={adminPassword}
                  onChange={(event) => setAdminPassword(event.target.value)}
                  placeholder="Нууц үгээ оруулна уу"
                />
              </div>
              <Button type="submit" className="w-full" disabled={isLoggingIn || isGooglePending}>
                {isLoggingIn ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4" />}
                Админ нэвтрэх
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="mx-auto max-w-3xl">
        <Card className="border-primary/12 bg-white/88">
          <CardContent className="space-y-6 p-7 text-center md:p-10">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl border border-primary/15 bg-primary/10 text-primary">
              <ShieldCheck className="h-7 w-7" />
            </div>
            <div>
              <h1 className="text-4xl font-semibold">Админ эрх хүрэлцэхгүй байна</h1>
              <p className="mt-4 text-base leading-8 text-muted-foreground">
                {currentUser.email ?? 'Энэ хэрэглэгч'} нь admin allowlist-д байхгүй байна. Зөв и-мэйлээр дахин нэвтэрнэ үү.
              </p>
            </div>
            <div className="flex flex-col justify-center gap-3 sm:flex-row">
              <Button type="button" variant="outline" onClick={handleSignOut} disabled={isSigningOut}>
                {isSigningOut ? <Loader2 className="h-4 w-4 animate-spin" /> : <LogOut className="h-4 w-4" />}
                Гарах
              </Button>
              <Button asChild>
                <Link href="/">Сайт руу буцах</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <>
      <Tabs defaultValue="products" className="space-y-6">
      <div className="section-shell flex flex-col gap-4 px-6 py-6 md:flex-row md:items-center md:justify-between md:px-8">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary">Admin area</p>
          <h1 className="mt-2 text-3xl font-semibold md:text-4xl">Энгийн удирдлагын хэсэг</h1>
          <p className="mt-3 text-sm leading-7 text-muted-foreground">
            Зөвхөн нүүр хуудасны бүтээгдэхүүн, heritage video, admin profile-г эндээс удирдана.
          </p>
        </div>
        <TabsList className="h-auto flex-wrap justify-start rounded-[1.4rem] bg-primary/8 p-1.5">
          <TabsTrigger value="products">Products</TabsTrigger>
          <TabsTrigger value="heritage">Heritage Video</TabsTrigger>
          <TabsTrigger value="profile">Admin Profile</TabsTrigger>
        </TabsList>
      </div>

      <TabsContent value="products" className="space-y-6">
        {isUsingFallback && !hasRemoteProducts && (
          <Card className="border-primary/12 bg-white/88">
            <CardHeader>
              <CardTitle>Sample бүтээгдэхүүнүүд Firebase руу ороогүй байна</CardTitle>
              <CardDescription>
                Нүүр хуудас одоогоор fallback sample data ашиглаж байна. Та sample import хийж болно, эсвэл шууд шинэ live бүтээгдэхүүн нэмж эхэлж болно.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm leading-7 text-muted-foreground">Нийт {products.length} sample бүтээгдэхүүн импортлоход бэлэн байна.</p>
              <div className="flex flex-col gap-3 sm:flex-row">
                <Button type="button" variant="outline" onClick={handleCreateProduct}>
                  <Plus className="h-4 w-4" />
                  Шинэ бүтээгдэхүүн нэмэх
                </Button>
                <Button type="button" onClick={handleSeedProducts} disabled={isSeedingProducts}>
                  {isSeedingProducts ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                  Firebase руу импортлох
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <Card className="border-primary/12 bg-white/88">
          <CardHeader className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <CardTitle>Нүүр хуудас дээр харагдах бүтээгдэхүүнүүд</CardTitle>
              <CardDescription>
                {hasRemoteProducts
                  ? `Одоогоор ${liveProducts.length} бүтээгдэхүүн live каталогт байна.`
                  : 'Одоогоор live бүтээгдэхүүн алга байна. Шинээр нэмэх эсвэл sample import хийж эхэлнэ үү.'}
              </CardDescription>
            </div>
            <Button type="button" onClick={handleCreateProduct}>
              <Plus className="h-4 w-4" />
              Шинэ бүтээгдэхүүн нэмэх
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {hasRemoteProducts ? (
              liveProducts.map((product) => (
                <div key={product.id} className="rounded-[1.5rem] border border-primary/12 bg-white/70 p-4">
                  <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
                      <div className="h-20 w-20 overflow-hidden rounded-[1.3rem] border border-primary/12 bg-primary/8">
                        {product.coverImageUrl ? (
                          <img
                            src={product.coverImageUrl}
                            alt={product.name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-xs font-semibold uppercase tracking-[0.18em] text-primary/60">
                            No image
                          </div>
                        )}
                      </div>
                      <div>
                        <p className="font-semibold text-foreground">{product.name}</p>
                        <p className="mt-1 text-sm text-muted-foreground">
                          {getCategoryLabel(product.category)} · ${product.price.toLocaleString()}
                        </p>
                        <p className="mt-2 text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
                          {getStoneLabel(product.stoneType)} · {getMaterialLabel(product.material)}
                        </p>
                        <p className="mt-3 line-clamp-2 text-sm leading-6 text-muted-foreground">
                          {product.description}
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button type="button" variant="outline" size="sm" onClick={() => handleEditProduct(product)}>
                        <Pencil className="h-4 w-4" />
                        Засах
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setDeleteDialog({ kind: 'product', product })}
                        disabled={isDeletingProductId === product.id}
                      >
                        {isDeletingProductId === product.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                        Устгах
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="rounded-[1.5rem] border border-dashed border-primary/20 bg-white/70 p-8 text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-[1.4rem] border border-primary/15 bg-primary/10 text-primary">
                  <Plus className="h-6 w-6" />
                </div>
                <h3 className="mt-5 text-2xl font-semibold">Анхны бүтээгдэхүүнээ нэмнэ үү</h3>
                <p className="mt-3 text-sm leading-7 text-muted-foreground">
                  `Шинэ бүтээгдэхүүн нэмэх` товчоор цонх нээгээд нэр, тайлбар, зураг, үнийг оруулснаар нүүр хуудасны каталог шууд live болно.
                </p>
                <Button type="button" className="mt-6" onClick={handleCreateProduct}>
                  <Plus className="h-4 w-4" />
                  Шинэ бүтээгдэхүүн нэмэх
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </TabsContent>

      <Dialog
        open={isProductDialogOpen}
        onOpenChange={(open) => {
          if (!open && !isSavingProduct) {
            setIsProductDialogOpen(false);
            resetProductForm();
            return;
          }

          if (open) {
            setIsProductDialogOpen(true);
          }
        }}
      >
        <DialogContent className="max-h-[90vh] max-w-4xl overflow-y-auto rounded-[2rem] border border-primary/15 bg-[linear-gradient(180deg,rgba(255,251,245,0.98),rgba(252,245,235,0.96))] p-0 shadow-[0_34px_80px_rgba(44,28,12,0.22)]">
          <div className="space-y-6 p-7 md:p-8">
            <DialogHeader className="space-y-3 text-left">
              <DialogTitle className="font-headline text-4xl font-semibold tracking-tight text-foreground">
                {productForm.id ? 'Бүтээгдэхүүн засах' : 'Шинэ бүтээгдэхүүн нэмэх'}
              </DialogTitle>
              <DialogDescription className="text-sm leading-7 text-muted-foreground">
                Зураг upload эсвэл image URL ашиглаж, хадгалмагц нүүр хуудасны каталог дээр шууд гаргана.
              </DialogDescription>
            </DialogHeader>

            <form className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]" onSubmit={handleSaveProduct}>
              <div className="space-y-5">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="product-name">Нэр</Label>
                    <Input
                      id="product-name"
                      value={productForm.name}
                      onChange={(event) => setProductForm((current) => ({ ...current, name: event.target.value }))}
                      placeholder="Бүтээлийн нэр"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="product-price">Үнэ (USD)</Label>
                    <Input
                      id="product-price"
                      type="text"
                      inputMode="decimal"
                      autoComplete="off"
                      value={productForm.price}
                      onChange={(event) =>
                        setProductForm((current) => ({
                          ...current,
                          price: normalizePriceInput(event.target.value),
                        }))
                      }
                      placeholder="Жишээ нь: 1200"
                    />
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                  <div className="space-y-2">
                    <Label htmlFor="product-category">Ангилал</Label>
                    <select
                      id="product-category"
                      className="flex h-11 w-full rounded-2xl border border-input bg-background px-4 text-sm"
                      value={productForm.category}
                      onChange={(event) =>
                        setProductForm((current) => ({
                          ...current,
                          category: event.target.value as Product['category'],
                        }))
                      }
                    >
                      {PRODUCT_CATEGORIES.map((item) => (
                        <option key={item} value={item}>
                          {getCategoryLabel(item)}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="product-stone">Чулуу</Label>
                    <select
                      id="product-stone"
                      className="flex h-11 w-full rounded-2xl border border-input bg-background px-4 text-sm"
                      value={productForm.stoneType}
                      onChange={(event) =>
                        setProductForm((current) => ({
                          ...current,
                          stoneType: event.target.value as Product['stoneType'],
                        }))
                      }
                    >
                      {PRODUCT_STONE_TYPES.map((item) => (
                        <option key={item} value={item}>
                          {getStoneLabel(item)}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="product-material">Материал</Label>
                    <select
                      id="product-material"
                      className="flex h-11 w-full rounded-2xl border border-input bg-background px-4 text-sm"
                      value={productForm.material}
                      onChange={(event) =>
                        setProductForm((current) => ({
                          ...current,
                          material: event.target.value as Product['material'],
                        }))
                      }
                    >
                      {PRODUCT_MATERIALS.map((item) => (
                        <option key={item} value={item}>
                          {getMaterialLabel(item)}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="product-size">Хэмжээ</Label>
                    <Input
                      id="product-size"
                      value={productForm.size}
                      onChange={(event) => setProductForm((current) => ({ ...current, size: event.target.value }))}
                      placeholder="Жишээ нь: 45см"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="product-image-hint">Image hint</Label>
                    <Input
                      id="product-image-hint"
                      value={productForm.coverImageHint}
                      onChange={(event) =>
                        setProductForm((current) => ({ ...current, coverImageHint: event.target.value }))
                      }
                      placeholder="Жишээ нь: silver ring"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="product-image-file">Зураг upload</Label>
                  <Input
                    id="product-image-file"
                    type="file"
                    accept="image/*"
                    onChange={(event: ChangeEvent<HTMLInputElement>) =>
                      setProductImageFile(event.target.files?.[0] ?? null)
                    }
                  />
                  <p className="text-xs leading-6 text-muted-foreground">
                    Файл сонговол image URL-ээс давуу ашиглагдана.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="product-image-url">Эсвэл cover image URL</Label>
                  <Input
                    id="product-image-url"
                    value={productForm.coverImageUrl}
                    onChange={(event) =>
                      setProductForm((current) => ({ ...current, coverImageUrl: event.target.value }))
                    }
                    placeholder="https://..."
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="product-description">Тайлбар</Label>
                  <Textarea
                    id="product-description"
                    rows={7}
                    value={productForm.description}
                    onChange={(event) =>
                      setProductForm((current) => ({ ...current, description: event.target.value }))
                    }
                    placeholder="Бүтээгдэхүүний тайлбар"
                  />
                </div>

                <DialogFooter className="gap-3 sm:justify-end sm:space-x-0">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setIsProductDialogOpen(false);
                      resetProductForm();
                    }}
                    disabled={isSavingProduct}
                  >
                    Болих
                  </Button>
                  <Button type="submit" disabled={isSavingProduct}>
                    {isSavingProduct ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                    {productForm.id ? 'Өөрчлөлт хадгалах' : 'Бүтээгдэхүүн нэмэх'}
                  </Button>
                </DialogFooter>
              </div>

              <div className="space-y-4">
                <div className="overflow-hidden rounded-[1.8rem] border border-primary/12 bg-white/72">
                  <div className="aspect-[4/5] bg-[linear-gradient(180deg,rgba(173,129,78,0.1),rgba(173,129,78,0.18))]">
                    {effectiveProductPreview ? (
                      <img
                        src={effectiveProductPreview}
                        alt={productForm.name || 'Product preview'}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center px-6 text-center text-sm leading-7 text-muted-foreground">
                        Зураг upload хийх эсвэл image URL оруулахад preview энд харагдана.
                      </div>
                    )}
                  </div>
                </div>

                <div className="rounded-[1.6rem] border border-primary/12 bg-white/72 p-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Оруулах мэдээлэл</p>
                  <div className="mt-4 space-y-3 text-sm leading-7 text-muted-foreground">
                    <p>Нэр, тайлбар, хэмжээ, үнэ дөрөвийг бөглөх шаардлагатай.</p>
                    <p>Зураг upload хийхэд Storage дээр хадгалагдаж, нүүр хуудсанд автоматаар ашиглагдана.</p>
                    <p>Хадгалсны дараа каталог шинэчлэгдэж шууд live болно.</p>
                  </div>
                </div>
              </div>
            </form>
          </div>
        </DialogContent>
      </Dialog>

      <TabsContent value="heritage" className="space-y-6">
        <div className="grid gap-6 xl:grid-cols-[0.92fr_1.08fr]">
          <Card className="border-primary/12 bg-white/88">
            <CardHeader>
              <CardTitle>Өв соёл хуудасны видео</CardTitle>
              <CardDescription>
                `/heritage` дээр тоглох ганц reel video-г эндээс upload хийж солино.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form className="space-y-5" onSubmit={handleSaveHeritage}>
                <div className="space-y-2">
                  <Label htmlFor="heritage-title">Гарчиг</Label>
                  <Input
                    id="heritage-title"
                    value={heritageTitle}
                    onChange={(event) => setHeritageTitle(event.target.value)}
                    placeholder="Өв соёл"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="heritage-poster">Poster image URL</Label>
                  <Input
                    id="heritage-poster"
                    value={heritagePosterImageUrl}
                    onChange={(event) => setHeritagePosterImageUrl(event.target.value)}
                    placeholder="https://..."
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="heritage-video">Видео upload</Label>
                  <Input
                    id="heritage-video"
                    type="file"
                    accept="video/mp4,video/webm,video/quicktime"
                    onChange={(event: ChangeEvent<HTMLInputElement>) =>
                      setHeritageVideoFile(event.target.files?.[0] ?? null)
                    }
                  />
                </div>
                <div className="flex flex-col gap-3 sm:flex-row">
                  <Button type="submit" disabled={isSavingHeritage}>
                    {isSavingHeritage ? <Loader2 className="h-4 w-4 animate-spin" /> : <Video className="h-4 w-4" />}
                    Видео хадгалах
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setDeleteDialog({ kind: 'heritage' })}
                    disabled={isRemovingHeritage || !heritageReel.videoUrl}
                  >
                    {isRemovingHeritage ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                    Видео устгах
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          <Card className="border-primary/12 bg-white/88">
            <CardHeader>
              <CardTitle>Одоогийн preview</CardTitle>
              <CardDescription>Хадгалсан даруйд `/heritage` хуудас дээр ижил хэлбэрээр харагдана.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mx-auto max-w-[320px] overflow-hidden rounded-[2rem] border border-primary/12 bg-[rgba(44,28,12,0.12)] p-3">
                <div className="overflow-hidden rounded-[1.5rem]">
                  {heritageReel.videoUrl ? (
                    <video
                      key={heritageReel.videoUrl}
                      className="aspect-[9/16] w-full object-cover"
                      controls
                      playsInline
                      preload="metadata"
                      poster={effectivePosterImage ?? undefined}
                    >
                      <source src={heritageReel.videoUrl} type="video/mp4" />
                    </video>
                  ) : (
                    <div
                      className="flex aspect-[9/16] items-center justify-center bg-cover bg-center"
                      style={effectivePosterImage ? { backgroundImage: `url(${effectivePosterImage})` } : undefined}
                    >
                      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(44,28,12,0.18),rgba(44,28,12,0.62))]" />
                      <p className="relative z-10 px-6 text-center text-white">Одоогоор reel video ороогүй байна</p>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </TabsContent>

      <TabsContent value="profile" className="space-y-6">
        <Card className="border-primary/12 bg-white/88">
          <CardHeader>
            <CardTitle>Админ профайл</CardTitle>
            <CardDescription>Энэ хэсгээс админ бүртгэлээ шалгаж, хэрэглэгчдийн role удирдаж, системээс гарна.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
            <div className="rounded-[1.6rem] border border-primary/12 bg-white/70 p-5">
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16 border border-primary/15">
                  <AvatarImage src={profile?.photoURL ?? currentUser.photoURL ?? undefined} alt={profile?.displayName ?? currentUser.email ?? 'Admin'} />
                  <AvatarFallback className="bg-primary/12 text-lg font-semibold text-primary">
                    {getUserInitial(profile?.displayName, currentUser.email)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary">Admin user</p>
                  <h2 className="mt-2 text-3xl font-semibold">{profile?.displayName ?? 'Админ хэрэглэгч'}</h2>
                  <p className="mt-2 text-sm text-muted-foreground">{currentUser.email}</p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="rounded-[1.6rem] border border-primary/12 bg-white/70 p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Одоогийн role</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Badge className="bg-primary text-primary-foreground">
                    {profile?.role === 'admin' || isBootstrapAdmin(currentUser.email) ? 'admin' : 'customer'}
                  </Badge>
                  {isBootstrapAdmin(currentUser.email) && (
                    <Badge variant="outline" className="border-primary/20 bg-primary/10 text-primary">
                      bootstrap access
                    </Badge>
                  )}
                </div>
              </div>

              <div className="rounded-[1.6rem] border border-primary/12 bg-white/70 p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Нэвтрэх суваг</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {currentUser.providerData.map((item) => (
                    <Badge key={item.providerId} variant="outline" className="border-primary/20 bg-primary/10 text-primary">
                      {getProviderLabel(item.providerId)}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="rounded-[1.6rem] border border-primary/12 bg-white/70 p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Admin allowlist</p>
                <p className="mt-3 font-semibold text-foreground">{allowedAdminEmailsLabel}</p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <Button type="button" variant="outline" onClick={handleSignOut} disabled={isSigningOut}>
                  {isSigningOut ? <Loader2 className="h-4 w-4 animate-spin" /> : <LogOut className="h-4 w-4" />}
                  Системээс гарах
                </Button>
                <Button asChild>
                  <Link href="/">Сайт руу буцах</Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-primary/12 bg-white/88">
          <CardHeader>
            <CardTitle>Хэрэглэгчийн эрх удирдах</CardTitle>
            <CardDescription>
              Шинээр бүртгүүлсэн хэрэглэгчид автоматаар `customer` role-той үүснэ. Эндээс `admin` болгож сольж болно.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {isUsersLoading ? (
              <div className="flex items-center gap-3 rounded-[1.5rem] border border-primary/12 bg-white/70 p-5">
                <Loader2 className="h-4 w-4 animate-spin text-primary" />
                <p className="text-sm text-muted-foreground">Хэрэглэгчдийн жагсаалтыг ачаалж байна...</p>
              </div>
            ) : userProfiles.length > 0 ? (
              userProfiles.map((userProfile) => {
                const isPromoting = isUpdatingUserRoleId === userProfile.uid;
                const lockedAdmin = isBootstrapAdmin(userProfile.email);
                const displayName = userProfile.displayName || 'Нэргүй хэрэглэгч';
                const email = userProfile.email || 'И-мэйл алга';

                return (
                  <div key={userProfile.uid} className="rounded-[1.5rem] border border-primary/12 bg-white/70 p-5">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                      <div className="flex items-start gap-4">
                        <Avatar className="h-12 w-12 border border-primary/15">
                          <AvatarImage src={userProfile.photoURL ?? undefined} alt={displayName} />
                          <AvatarFallback className="bg-primary/12 font-semibold text-primary">
                            {getUserInitial(displayName, email)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="font-semibold text-foreground">{displayName}</p>
                            <Badge className={userProfile.role === 'admin' ? 'bg-primary text-primary-foreground' : ''} variant={userProfile.role === 'admin' ? 'default' : 'outline'}>
                              {userProfile.role}
                            </Badge>
                            {lockedAdmin && (
                              <Badge variant="outline" className="border-primary/20 bg-primary/10 text-primary">
                                allowlist
                              </Badge>
                            )}
                          </div>
                          <p className="mt-1 text-sm text-muted-foreground">{email}</p>
                          <p className="mt-2 text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
                            Бүртгүүлсэн: {formatAdminDate(userProfile.createdAt)}
                          </p>
                          {userProfile.providerIds.length > 0 && (
                            <div className="mt-3 flex flex-wrap gap-2">
                              {userProfile.providerIds.map((providerId) => (
                                <Badge
                                  key={`${userProfile.uid}-${providerId}`}
                                  variant="outline"
                                  className="border-primary/20 bg-white/80 text-primary"
                                >
                                  {getProviderLabel(providerId)}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-col gap-2 sm:flex-row">
                        <Button
                          type="button"
                          variant={userProfile.role === 'admin' ? 'secondary' : 'default'}
                          onClick={() => void handleUserRoleChange(userProfile, 'admin')}
                          disabled={isPromoting || userProfile.role === 'admin'}
                        >
                          {isPromoting ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4" />}
                          Админ болгох
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => void handleUserRoleChange(userProfile, 'customer')}
                          disabled={isPromoting || userProfile.role === 'customer' || lockedAdmin}
                        >
                          {isPromoting ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserRound className="h-4 w-4" />}
                          Customer болгох
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="rounded-[1.5rem] border border-dashed border-primary/20 bg-white/70 p-6 text-sm leading-7 text-muted-foreground">
                Одоогоор бүртгүүлсэн хэрэглэгч алга байна. Хэрэглэгч Google эсвэл и-мэйлээр анх нэвтрэхэд profile нь энд автоматаар үүснэ.
              </div>
            )}
          </CardContent>
        </Card>
      </TabsContent>
      </Tabs>

      <AlertDialog
        open={Boolean(deleteDialog)}
        onOpenChange={(open) => {
          if (!open && !isDeleteActionPending) {
            setDeleteDialog(null);
          }
        }}
      >
        <AlertDialogContent className="max-w-xl rounded-[2rem] border border-primary/15 bg-[linear-gradient(180deg,rgba(255,251,245,0.98),rgba(252,245,235,0.96))] p-0 shadow-[0_34px_80px_rgba(44,28,12,0.22)]">
          <div className="space-y-6 p-7 md:p-8">
            <div className="flex items-start gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-[1.4rem] border border-primary/15 bg-primary/10 text-primary">
                <Trash2 className="h-6 w-6" />
              </div>
              <AlertDialogHeader className="space-y-3 text-left">
                <AlertDialogTitle className="font-headline text-3xl font-semibold tracking-tight text-foreground">
                  {deleteDialogTitle}
                </AlertDialogTitle>
                <AlertDialogDescription className="text-sm leading-7 text-muted-foreground">
                  {deleteDialogDescription}
                </AlertDialogDescription>
              </AlertDialogHeader>
            </div>

            <div className="rounded-[1.4rem] border border-primary/12 bg-white/70 px-5 py-4 text-sm leading-7 text-muted-foreground">
              Устгасны дараа энэ мэдээллийг админ хэсгээс шууд сэргээх боломжгүй. Үйлдлээ баталгаажуулж байвал үргэлжлүүлнэ үү.
            </div>

            <AlertDialogFooter className="gap-3 sm:justify-end sm:space-x-0">
              <AlertDialogCancel
                className="mt-0 border-primary/15 bg-white/80 px-6"
                disabled={isDeleteActionPending}
              >
                Болих
              </AlertDialogCancel>
              <Button
                type="button"
                className="min-w-[170px] bg-destructive text-destructive-foreground shadow-[0_16px_34px_rgba(132,32,32,0.2)] hover:bg-destructive/90"
                onClick={() => void handleConfirmDelete()}
                disabled={isDeleteActionPending}
              >
                {isDeleteActionPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                {deleteDialogActionLabel}
              </Button>
            </AlertDialogFooter>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
