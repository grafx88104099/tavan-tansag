const FALLBACK_ADMIN_EMAILS = ['amardelgerekh@gmail.com'];

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function parseAdminEmails(value: string | undefined) {
  if (!value) {
    return FALLBACK_ADMIN_EMAILS;
  }

  const emails = value
    .split(',')
    .map((item) => normalizeEmail(item))
    .filter(Boolean);

  return emails.length > 0 ? emails : FALLBACK_ADMIN_EMAILS;
}

export const ADMIN_EMAILS = parseAdminEmails(process.env.NEXT_PUBLIC_ADMIN_EMAILS);

export function isAllowedAdminEmail(email: string | null | undefined) {
  if (!email) {
    return false;
  }

  return ADMIN_EMAILS.includes(normalizeEmail(email));
}
