import "server-only";
import { createHash, randomBytes } from "node:crypto";
import { cache } from "react";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import type { Role, User } from "@prisma/client";
import { db } from "./db";

export const SESSION_COOKIE = "britech_session";
const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 7; // 7 days
const REFRESH_WHEN_LEFT_MS = 1000 * 60 * 60 * 24 * 3.5; // extend when under half the lifetime remains
const BCRYPT_ROUNDS = 12;

export type SessionUser = Pick<User, "id" | "name" | "email" | "role">;

const sha256 = (v: string) => createHash("sha256").update(v).digest("hex");

/* ---------------------------- passwords ---------------------------- */

export const hashPassword = (pw: string) => bcrypt.hash(pw, BCRYPT_ROUNDS);
export const verifyPassword = (pw: string, hash: string) => bcrypt.compare(pw, hash);

// Used to keep sign-in timing the same whether or not the email exists.
let dummyHash: Promise<string> | null = null;
export async function burnPasswordCheck(pw: string) {
  dummyHash ??= bcrypt.hash("britech-timing-equaliser", BCRYPT_ROUNDS);
  await bcrypt.compare(pw, await dummyHash);
  return false;
}

export function passwordProblem(pw: string): string | null {
  if (pw.length < 10) return "Password must be at least 10 characters.";
  if (!/[A-Za-z]/.test(pw) || !/\d/.test(pw)) return "Password must contain letters and numbers.";
  return null;
}

/* ----------------------------- sessions ---------------------------- */

export async function createSession(userId: string) {
  const token = randomBytes(32).toString("base64url");
  const expiresAt = new Date(Date.now() + SESSION_TTL_MS);
  await db.session.create({ data: { id: sha256(token), userId, expiresAt } });
  (await cookies()).set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: expiresAt,
  });
}

export async function destroySession() {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (token) await db.session.deleteMany({ where: { id: sha256(token) } });
  jar.delete(SESSION_COOKIE);
}

/** Validates the session cookie. Cached per request. */
export const getCurrentUser = cache(async (): Promise<SessionUser | null> => {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token) return null;

  const session = await db.session.findUnique({
    where: { id: sha256(token) },
    include: { user: { select: { id: true, name: true, email: true, role: true, active: true } } },
  });
  if (!session) return null;

  if (session.expiresAt.getTime() <= Date.now() || !session.user.active) {
    await db.session.delete({ where: { id: session.id } }).catch(() => {});
    return null;
  }

  // Sliding expiry (the cookie itself is refreshed in middleware).
  if (session.expiresAt.getTime() - Date.now() < REFRESH_WHEN_LEFT_MS) {
    await db.session.update({ where: { id: session.id }, data: { expiresAt: new Date(Date.now() + SESSION_TTL_MS) } });
  }

  const { id, name, email, role } = session.user;
  return { id, name, email, role };
});

/** Use in admin pages and every server action. Redirects to sign-in if needed. */
export async function requireUser(roles?: Role[]): Promise<SessionUser> {
  const user = await getCurrentUser();
  if (!user) redirect("/admin/login");
  if (roles && !roles.includes(user.role)) redirect("/admin?denied=1");
  return user;
}

export const canManageContent = (u: SessionUser) => u.role === "ADMIN" || u.role === "EDITOR";

/* ---------------------------- rate limit --------------------------- */

const WINDOW_MS = 15 * 60 * 1000;
const MAX_PER_ACCOUNT = 5;
const MAX_PER_IP = 20;

export async function clientIp() {
  const h = await headers();
  // Prefer X-Real-IP, set by our reverse proxy (see DEPLOYMENT.md). The first X-Forwarded-For entry
  // can be forged by the client, so it is only a fallback.
  return (h.get("x-real-ip") ?? h.get("x-forwarded-for")?.split(",").pop() ?? "unknown").trim().slice(0, 64);
}

export async function isRateLimited(email: string, ip: string) {
  const since = new Date(Date.now() - WINDOW_MS);
  const [perAccount, perIp] = await Promise.all([
    db.loginAttempt.count({ where: { key: `acct:${email}`, createdAt: { gt: since } } }),
    db.loginAttempt.count({ where: { key: `ip:${ip}`, createdAt: { gt: since } } }),
  ]);
  return perAccount >= MAX_PER_ACCOUNT || perIp >= MAX_PER_IP;
}

export async function recordFailedLogin(email: string, ip: string) {
  await db.loginAttempt.createMany({ data: [{ key: `acct:${email}` }, { key: `ip:${ip}` }] });
  // Housekeeping: drop old attempts.
  await db.loginAttempt.deleteMany({ where: { createdAt: { lt: new Date(Date.now() - WINDOW_MS * 4) } } });
}

export async function clearFailedLogins(email: string) {
  await db.loginAttempt.deleteMany({ where: { key: `acct:${email}` } });
}
