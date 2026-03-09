import { FirebaseError } from 'firebase/app';

const AUTH_ERROR_MESSAGES: Record<string, string> = {
  'auth/email-already-in-use': 'Энэ и-мэйл хаяг өмнө нь бүртгэлтэй байна.',
  'auth/invalid-email': 'И-мэйл хаяг буруу байна.',
  'auth/user-disabled': 'Энэ бүртгэл түр идэвхгүй болсон байна.',
  'auth/user-not-found': 'Ийм бүртгэл олдсонгүй.',
  'auth/wrong-password': 'Нууц үг буруу байна.',
  'auth/invalid-credential': 'Нэвтрэх мэдээлэл буруу байна.',
  'auth/weak-password': 'Нууц үг дор хаяж 6 тэмдэгт байх ёстой.',
  'auth/operation-not-allowed': 'Firebase Console дээр Google sign-in provider идэвхжээгүй байна.',
  'auth/unauthorized-domain': 'Энэ домэйн Firebase Auth-ийн Authorized domains жагсаалтад алга байна.',
  'auth/account-exists-with-different-credential':
    'Энэ и-мэйл өөр нэвтрэх аргаар бүртгэлтэй байна. Өмнөх аргаа ашиглан нэвтэрнэ үү.',
  'auth/operation-not-supported-in-this-environment':
    'Энэ browser орчин popup нэвтрэлтийг дэмжихгүй байна. Дахин оролдоно уу.',
  'auth/popup-closed-by-user': 'Google нэвтрэх цонх хаагдсан байна.',
  'auth/popup-blocked': 'Browser popup-г хаасан байна. Popup-г зөвшөөрөөд дахин оролдоно уу.',
  'auth/cancelled-popup-request': 'Google нэвтрэх хүсэлт цуцлагдсан.',
  'auth/network-request-failed': 'Сүлжээний алдаа гарлаа. Дахин оролдоно уу.',
  'auth/too-many-requests': 'Хэт олон оролдлого хийсэн байна. Түр хүлээгээд дахин оролдоно уу.',
  'permission-denied':
    'Firebase Firestore rules publish хийгдээгүй эсвэл эрх хүрэлцэхгүй байна. Админ нь rules-ээ deploy хийх шаардлагатай.',
  unavailable: 'Firebase үйлчилгээ түр ажиллахгүй байна. Түр хүлээгээд дахин оролдоно уу.',
  'failed-precondition': 'Firebase project-ийн шаардлагатай тохиргоо дутуу байна.',
};

export function getAuthErrorMessage(error: unknown) {
  if (error instanceof FirebaseError) {
    return (
      AUTH_ERROR_MESSAGES[error.code] ??
      `Алдаа гарлаа (${error.code}). Firebase тохиргоо болон rules-ээ шалгана уу.`
    );
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
