'use client';

import { useEffect, useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, LockKeyhole, Mail, ShieldCheck, Sparkles, UserRound } from 'lucide-react';

import { useAuth } from '@/components/auth-provider';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { getAuthErrorMessage } from '@/lib/auth-utils';

type AuthPanelProps = {
  redirectTo: string;
};

export function AuthPanel({ redirectTo }: AuthPanelProps) {
  const router = useRouter();
  const { toast } = useToast();
  const {
    authStatus,
    authErrorMessage,
    clearAuthError,
    isConfigured,
    signInWithEmail,
    signInWithGoogle,
    signUpWithEmail,
  } = useAuth();

  const [signInEmail, setSignInEmail] = useState('');
  const [signInPassword, setSignInPassword] = useState('');
  const [signUpName, setSignUpName] = useState('');
  const [signUpEmail, setSignUpEmail] = useState('');
  const [signUpPassword, setSignUpPassword] = useState('');
  const [signUpPasswordConfirm, setSignUpPasswordConfirm] = useState('');
  const [isEmailPending, setIsEmailPending] = useState(false);
  const [isGooglePending, setIsGooglePending] = useState(false);

  useEffect(() => {
    if (authStatus === 'authenticated') {
      router.replace(redirectTo);
    }
  }, [authStatus, redirectTo, router]);

  useEffect(() => {
    if (!authErrorMessage) {
      return;
    }

    toast({
      title: 'Google нэвтрэлт амжилтгүй боллоо',
      description: authErrorMessage,
      variant: 'destructive',
    });
    clearAuthError();
  }, [authErrorMessage, clearAuthError, toast]);

  async function handleEmailSignIn(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!signInEmail.trim() || !signInPassword) {
      toast({
        title: 'Мэдээллээ бүрэн оруулна уу',
        description: 'И-мэйл болон нууц үгээ бөглөөд дахин оролдоно уу.',
        variant: 'destructive',
      });
      return;
    }

    try {
      setIsEmailPending(true);
      await signInWithEmail({ email: signInEmail, password: signInPassword });
      toast({
        title: 'Амжилттай нэвтэрлээ',
        description: 'Таны профайл болон хадгалсан цуглуулга бэлэн боллоо.',
      });
      router.replace(redirectTo);
    } catch (error) {
      toast({
        title: 'Нэвтрэх боломжгүй байна',
        description: getAuthErrorMessage(error),
        variant: 'destructive',
      });
    } finally {
      setIsEmailPending(false);
    }
  }

  async function handleEmailSignUp(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmedName = signUpName.trim();

    if (trimmedName.length < 2) {
      toast({
        title: 'Нэрээ шалгана уу',
        description: 'Дор хаяж 2 тэмдэгттэй нэр оруулна уу.',
        variant: 'destructive',
      });
      return;
    }

    if (signUpPassword.length < 8) {
      toast({
        title: 'Нууц үг богино байна',
        description: 'Нууц үг дор хаяж 8 тэмдэгт байх шаардлагатай.',
        variant: 'destructive',
      });
      return;
    }

    if (signUpPassword !== signUpPasswordConfirm) {
      toast({
        title: 'Нууц үг таарахгүй байна',
        description: 'Нууц үгээ дахин шалгаад ижил утгаар оруулна уу.',
        variant: 'destructive',
      });
      return;
    }

    try {
      setIsEmailPending(true);
      await signUpWithEmail({
        displayName: trimmedName,
        email: signUpEmail,
        password: signUpPassword,
      });
      toast({
        title: 'Бүртгэл амжилттай үүслээ',
        description: 'Одоо таны профайл автоматаар үүсэж, хадгалсан бүтээлүүд энд төвлөрнө.',
      });
      router.replace(redirectTo);
    } catch (error) {
      toast({
        title: 'Бүртгэл үүсгэж чадсангүй',
        description: getAuthErrorMessage(error),
        variant: 'destructive',
      });
    } finally {
      setIsEmailPending(false);
    }
  }

  async function handleGoogleSignIn() {
    try {
      setIsGooglePending(true);
      await signInWithGoogle();
      toast({
        title: 'Google-ээр амжилттай нэвтэрлээ',
        description: 'Таны профайл автоматаар шинэчлэгдлээ.',
      });
      router.replace(redirectTo);
    } catch (error) {
      toast({
        title: 'Google нэвтрэлт амжилтгүй боллоо',
        description: getAuthErrorMessage(error),
        variant: 'destructive',
      });
    } finally {
      setIsGooglePending(false);
    }
  }

  if (!isConfigured) {
    return (
      <section className="container py-12 md:py-16">
        <div className="section-shell px-6 py-10 text-center md:px-10">
          <h1 className="text-3xl font-semibold md:text-4xl">Firebase тохиргоо дутуу байна</h1>
          <p className="mt-3 text-base leading-7 text-muted-foreground">
            Нэвтрэх системийг ашиглахын тулд Firebase Auth ба Firestore config бүрэн тохирсон байх шаардлагатай.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="container py-10 md:py-14">
      <div className="grid gap-8 xl:grid-cols-[0.92fr_1.08fr]">
        <Card className="border-primary/12 bg-white/82">
          <CardContent className="space-y-6 p-7 md:p-10">
            <Badge variant="outline" className="border-primary/20 bg-primary/10 px-4 py-2 text-primary">
              Хэрэглэгчийн бүртгэл
            </Badge>

            <div className="space-y-4">
              <h1 className="text-4xl font-semibold leading-tight md:text-5xl">
                Нэвтэрч өөрийн хадгалсан цуглуулгаа удирдана уу
              </h1>
              <p className="text-base leading-8 text-muted-foreground">
                И-мэйл эсвэл Google бүртгэлээр нэвтэрч, өөрийн профайлыг автоматаар үүсгэнэ. Хадгалсан бүтээлүүд,
                сонирхсон цуглуулга, хувийн мэдээлэл тань нэг дор төвлөрнө.
              </p>
            </div>

            <div className="grid gap-4">
              <div className="rounded-[1.5rem] border border-primary/12 bg-white/70 p-5">
                <div className="flex items-center gap-3">
                  <div className="rounded-2xl border border-primary/15 bg-primary/10 p-3 text-primary">
                    <ShieldCheck className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-semibold">Найдвартай нэвтрэлт</p>
                    <p className="text-sm leading-6 text-muted-foreground">
                      Firebase Auth ашиглаж, session-ийг browser дээр тогтвортой хадгална.
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-[1.5rem] border border-primary/12 bg-white/70 p-5">
                <div className="flex items-center gap-3">
                  <div className="rounded-2xl border border-primary/15 bg-primary/10 p-3 text-primary">
                    <Sparkles className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-semibold">Профайл автоматаар үүснэ</p>
                    <p className="text-sm leading-6 text-muted-foreground">
                      Нэвтэрсэн даруйд таны профайл, provider мэдээлэл, хадгалсан бүтээлүүд синк хийгдэнэ.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-primary/12 bg-white/86">
          <CardHeader className="space-y-4 p-7 pb-0 md:p-10 md:pb-0">
            <CardTitle className="text-3xl font-semibold">Нэвтрэх ба бүртгүүлэх</CardTitle>
            <p className="text-sm leading-7 text-muted-foreground">
              Доорх хоёр аргын аль нэгээр нэвтэрч, өөрийн хадгалсан цуглуулга руу шууд орно.
            </p>
          </CardHeader>

          <CardContent className="p-7 md:p-10">
            <Tabs defaultValue="sign-in" className="space-y-6">
              <TabsList className="h-auto w-full rounded-[1.4rem] bg-primary/8 p-1.5">
                <TabsTrigger value="sign-in" className="flex-1 rounded-[1rem] py-3">
                  Нэвтрэх
                </TabsTrigger>
                <TabsTrigger value="sign-up" className="flex-1 rounded-[1rem] py-3">
                  Бүртгүүлэх
                </TabsTrigger>
              </TabsList>

              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={handleGoogleSignIn}
                disabled={isGooglePending || isEmailPending}
              >
                {isGooglePending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                Google-ээр үргэлжлүүлэх
              </Button>

              <TabsContent value="sign-in" className="mt-0">
                <form className="space-y-5" onSubmit={handleEmailSignIn}>
                  <div className="space-y-2">
                    <Label htmlFor="sign-in-email">И-мэйл</Label>
                    <div className="relative">
                      <Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="sign-in-email"
                        type="email"
                        autoComplete="email"
                        value={signInEmail}
                        onChange={(event) => setSignInEmail(event.target.value)}
                        className="pl-11"
                        placeholder="name@example.com"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="sign-in-password">Нууц үг</Label>
                    <div className="relative">
                      <LockKeyhole className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="sign-in-password"
                        type="password"
                        autoComplete="current-password"
                        value={signInPassword}
                        onChange={(event) => setSignInPassword(event.target.value)}
                        className="pl-11"
                        placeholder="Нууц үгээ оруулна уу"
                      />
                    </div>
                  </div>

                  <Button type="submit" className="w-full" disabled={isEmailPending || isGooglePending}>
                    {isEmailPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Mail className="h-4 w-4" />}
                    И-мэйлээр нэвтрэх
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="sign-up" className="mt-0">
                <form className="space-y-5" onSubmit={handleEmailSignUp}>
                  <div className="space-y-2">
                    <Label htmlFor="sign-up-name">Нэр</Label>
                    <div className="relative">
                      <UserRound className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="sign-up-name"
                        autoComplete="name"
                        value={signUpName}
                        onChange={(event) => setSignUpName(event.target.value)}
                        className="pl-11"
                        placeholder="Таны нэр"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="sign-up-email">И-мэйл</Label>
                    <div className="relative">
                      <Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="sign-up-email"
                        type="email"
                        autoComplete="email"
                        value={signUpEmail}
                        onChange={(event) => setSignUpEmail(event.target.value)}
                        className="pl-11"
                        placeholder="name@example.com"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="sign-up-password">Нууц үг</Label>
                    <div className="relative">
                      <LockKeyhole className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="sign-up-password"
                        type="password"
                        autoComplete="new-password"
                        value={signUpPassword}
                        onChange={(event) => setSignUpPassword(event.target.value)}
                        className="pl-11"
                        placeholder="Дор хаяж 8 тэмдэгт"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="sign-up-password-confirm">Нууц үг давтах</Label>
                    <div className="relative">
                      <LockKeyhole className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="sign-up-password-confirm"
                        type="password"
                        autoComplete="new-password"
                        value={signUpPasswordConfirm}
                        onChange={(event) => setSignUpPasswordConfirm(event.target.value)}
                        className="pl-11"
                        placeholder="Нууц үгээ дахин оруулна уу"
                      />
                    </div>
                  </div>

                  <Button type="submit" className="w-full" disabled={isEmailPending || isGooglePending}>
                    {isEmailPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserRound className="h-4 w-4" />}
                    Бүртгэл үүсгэх
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
