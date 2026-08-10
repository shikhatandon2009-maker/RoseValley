import { cookies } from 'next/headers';
import { verifyToken, TokenPayload } from './jwt';

export const AUTH_COOKIE_NAME = 'auth_token';

export async function getSession(): Promise<TokenPayload | null> {
  const cookieStore = cookies();
  const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;
  if (!token) return null;
  return verifyToken(token);
}

export async function clearSession() {
  const cookieStore = cookies();
  cookieStore.delete(AUTH_COOKIE_NAME);
}
