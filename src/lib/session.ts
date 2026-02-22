import { cookies } from 'next/headers';
import bcrypt from 'bcryptjs';

const SESSION_COOKIE_NAME = 'recipe_session';
const SESSION_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 days

const validUsername = process.env.RECIPE_APP_USERNAME || 'admin';
const validPasswordHash = process.env.RECIPE_APP_PASSWORD_HASH;

// For development: if no hash is set, use a default
// In production, you should pre-hash your password and set RECIPE_APP_PASSWORD_HASH
async function verifyPassword(password: string): Promise<boolean> {
  if (!validPasswordHash) {
    // Development fallback - compare directly
    return password === (process.env.RECIPE_APP_PASSWORD || 'admin');
  }

  return bcrypt.compare(password, validPasswordHash);
}

export async function setSession() {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, 'authenticated', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: SESSION_DURATION / 1000,
    path: '/',
  });
}

export async function getSession(): Promise<boolean> {
  const cookieStore = await cookies();
  const session = cookieStore.get(SESSION_COOKIE_NAME);
  return session?.value === 'authenticated';
}

export async function clearSession() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
}

export async function verifyCredentials(username: string, password: string): Promise<boolean> {
  if (username !== validUsername) {
    return false;
  }

  return verifyPassword(password);
}

// Helper to generate a password hash for setting in .env
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}
