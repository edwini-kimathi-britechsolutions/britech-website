"use server";

import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import {
  burnPasswordCheck,
  clearFailedLogins,
  clientIp,
  createSession,
  destroySession,
  hashPassword,
  isRateLimited,
  passwordProblem,
  recordFailedLogin,
  requireUser,
  verifyPassword,
} from "@/lib/auth";
import type { FormState } from "./types";

export async function login(_: FormState, fd: FormData): Promise<FormState> {
  const email = String(fd.get("email") ?? "").toLowerCase().trim().slice(0, 191);
  const password = String(fd.get("password") ?? "").slice(0, 200);
  if (!email || !password) return { error: "Enter your email and password." };

  const ip = await clientIp();
  if (await isRateLimited(email, ip)) return { error: "Too many sign-in attempts. Please wait 15 minutes and try again." };

  const user = await db.user.findUnique({ where: { email } });
  const ok = user && user.active ? await verifyPassword(password, user.passwordHash) : await burnPasswordCheck(password);
  if (!ok || !user) {
    await recordFailedLogin(email, ip);
    return { error: "Incorrect email or password." };
  }

  await clearFailedLogins(email);
  await db.session.deleteMany({ where: { userId: user.id, expiresAt: { lt: new Date() } } });
  await createSession(user.id);
  redirect("/admin");
}

export async function logout() {
  await destroySession();
  redirect("/admin/login");
}

export async function updateProfile(_: FormState, fd: FormData): Promise<FormState> {
  const user = await requireUser();
  const name = String(fd.get("name") ?? "").trim();
  if (name.length < 2 || name.length > 120) return { error: "Name must be 2–120 characters." };
  await db.user.update({ where: { id: user.id }, data: { name } });
  return { ok: "Profile updated." };
}

export async function changePassword(_: FormState, fd: FormData): Promise<FormState> {
  const user = await requireUser();
  const current = String(fd.get("current") ?? "");
  const next = String(fd.get("next") ?? "");
  const confirm = String(fd.get("confirm") ?? "");

  const row = await db.user.findUniqueOrThrow({ where: { id: user.id } });
  if (!(await verifyPassword(current, row.passwordHash))) return { error: "Your current password is incorrect." };
  if (next !== confirm) return { error: "The new passwords don’t match." };
  const problem = passwordProblem(next);
  if (problem) return { error: problem };

  await db.user.update({ where: { id: user.id }, data: { passwordHash: await hashPassword(next) } });
  // Sign out every session (including this one), then sign back in fresh.
  await db.session.deleteMany({ where: { userId: user.id } });
  await createSession(user.id);
  return { ok: "Password changed. Other devices have been signed out." };
}
