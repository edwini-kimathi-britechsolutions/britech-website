"use server";

import { randomBytes } from "node:crypto";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/lib/db";
import { hashPassword, requireUser } from "@/lib/auth";
import type { FormState } from "./types";

const tempPassword = () => `${randomBytes(9).toString("base64url")}4k`;

const NewUser = z.object({
  name: z.string().trim().min(2, "Enter a name.").max(120),
  email: z.string().trim().toLowerCase().email("Enter a valid email.").max(191),
  role: z.enum(["ADMIN", "EDITOR", "AUTHOR"]),
});

export async function createUser(_: FormState, fd: FormData): Promise<FormState> {
  await requireUser(["ADMIN"]);
  const parsed = NewUser.safeParse(Object.fromEntries(fd));
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  if (await db.user.findUnique({ where: { email: parsed.data.email } })) return { error: "That email already has an account." };

  const password = tempPassword();
  await db.user.create({ data: { ...parsed.data, passwordHash: await hashPassword(password) } });
  revalidatePath("/admin/users");
  return { ok: `Account created for ${parsed.data.email}. Share this temporary password securely — it won’t be shown again:`, secret: password };
}

const UpdateUser = z.object({
  id: z.string().min(1),
  role: z.enum(["ADMIN", "EDITOR", "AUTHOR"]),
  active: z.string().optional(),
});

export async function updateUser(_: FormState, fd: FormData): Promise<FormState> {
  const me = await requireUser(["ADMIN"]);
  const parsed = UpdateUser.safeParse(Object.fromEntries(fd));
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  const { id, role } = parsed.data;
  const active = parsed.data.active === "on";

  if (id === me.id && (role !== "ADMIN" || !active)) return { error: "You can’t remove your own admin access." };

  await db.user.update({ where: { id }, data: { role, active } });
  if (!active) await db.session.deleteMany({ where: { userId: id } });
  revalidatePath("/admin/users");
  return { ok: "User updated." };
}

export async function resetUserPassword(_: FormState, fd: FormData): Promise<FormState> {
  await requireUser(["ADMIN"]);
  const id = String(fd.get("id") ?? "");
  const user = await db.user.findUnique({ where: { id } });
  if (!user) return { error: "User not found." };
  const password = tempPassword();
  await db.user.update({ where: { id }, data: { passwordHash: await hashPassword(password) } });
  await db.session.deleteMany({ where: { userId: id } });
  return { ok: `New temporary password for ${user.email} (shown once):`, secret: password };
}
