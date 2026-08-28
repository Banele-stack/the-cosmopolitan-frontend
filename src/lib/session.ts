/**
 * Server-only session helpers. The JWT itself lives in an httpOnly cookie
 * (set by app/api/auth/login/route.ts) — never readable from client-side JS,
 * which is the point: an XSS bug in a client component can't steal it.
 * `apiFetch` (see @/lib/api) forwards this cookie's token as the
 * Authorization header on every request to compliance-pro-api.
 */
import "server-only";
import { cache } from "react";
import { cookies } from "next/headers";

export const SESSION_COOKIE = "cp_session";

export async function getSessionToken(): Promise<string | undefined> {
  const store = await cookies();
  return store.get(SESSION_COOKIE)?.value;
}

export interface CurrentUser {
  id: string;
  email: string;
  name: string;
  role: string;
  organizationId: string;
  organizationName: string;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3011";

/** Returns the logged-in user, or undefined if there's no/an invalid session — never throws. */
export const getCurrentUser = cache(async (): Promise<CurrentUser | undefined> => {
  const token = await getSessionToken();
  if (!token) return undefined;
  try {
    const res = await fetch(`${API_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
    if (!res.ok) return undefined;
    return (await res.json()) as CurrentUser;
  } catch {
    return undefined;
  }
});
