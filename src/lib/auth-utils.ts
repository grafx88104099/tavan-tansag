import { FirebaseError } from 'firebase/app';

const AUTH_ERROR_MESSAGES: Record<string, string> = {
  'auth/email-already-in-use': 'Энэ и-мэйл хаяг өмнө нь бүртгэлтэй байна.',
  'auth/invalid-email': 'И-мэйл хаяг буруу байна.',
  'auth/user-disabled': 'Энэ бүртгэл түр идэвхгүй болсон байна.',
  'auth/user-not-found': 'Ийм бүртгэл олдсонгүй.',
  'auth/wrong-password': 'Нууц үг буруу байна.',
  'auth/invalid-credential': 'Нэвтрэх мэдээлэл буруу байна.',
  'auth/weak-password': 'Нууц үг дор хаяж 6 тэмдэгт байх ёстой.',
  'auth/popup-closed-by-user': 'Google нэвтрэх цонх хаагдсан байна.',
  'auth/popup-blocked': 'Browser popup-г хаасан байна. Popup-г зөвшөөрөөд дахин оролдоно уу.',
  'auth/cancelled-popup-request': 'Google нэвтрэх хүсэлт цуцлагдсан.',
  'auth/network-request-failed': 'Сүлжээний алдаа гарлаа. Дахин оролдоно уу.',
  'auth/too-many-requests': 'Хэт олон оролдлого хийсэн байна. Түр хүлээгээд дахин оролдоно уу.',
};

export function getAuthErrorMessage(error: unknown) {
  if (error instanceof FirebaseError) {
    return AUTH_ERROR_MESSAGES[error.code] ?? 'Нэвтрэх үед алдаа гарлаа. Дахин оролдоно уу.';
  }

  if (error instanceof Error) {
    return error.message;
  }

  return 'Тодорхойгүй алдаа гарлаа. Дахин оролдоно уу.';
}

export function sanitizeRedirectPath(value: string | null | undefined, fallback = '/profile') {
  if (!value || !value.startsWith('/') || value.startsWith('//')) {
    return fallback;
  }

  return value;
}

export function getUserInitial(displayName: string | null | undefined, email: string | null | undefined) {
  const source = displayName?.trim() || email?.trim() || 'Т';
  return source.charAt(0).toUpperCase();
}

export function getProviderLabel(providerId: string) {
  switch (providerId) {
    case 'google.com':
      return 'Google';
    case 'password':
      return 'И-мэйл';
    default:
      return providerId;
  }
}
