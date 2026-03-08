import { AuthPanel } from '@/components/auth-panel';
import { sanitizeRedirectPath } from '@/lib/auth-utils';

type AuthPageProps = {
  searchParams: Promise<{
    redirect?: string | string[];
  }>;
};

export default async function AuthPage({ searchParams }: AuthPageProps) {
  const params = await searchParams;
  const rawRedirect = Array.isArray(params.redirect) ? params.redirect[0] : params.redirect;
  const redirectTo = sanitizeRedirectPath(rawRedirect);

  return <AuthPanel redirectTo={redirectTo} />;
}
