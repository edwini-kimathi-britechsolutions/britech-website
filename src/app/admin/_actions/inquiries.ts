"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { SMTP_KEYS, sendTestEmail } from "@/lib/mail";
import { encryptSecret, hasAppSecret } from "@/lib/secrets";
import type { FormState } from "./types";

const STAFF = ["ADMIN", "EDITOR"] as const;

export async function setInquiryStatus(fd: FormData) {
  await requireUser([...STAFF]);
  const id = String(fd.get("id") ?? "");
  const status = z.enum(["NEW", "READ", "ARCHIVED"]).parse(fd.get("status"));
  await db.inquiry.update({ where: { id }, data: { status } }).catch(() => {});
  revalidatePath("/admin/inquiries");
  redirect(status === "ARCHIVED" ? "/admin/inquiries?archived=1" : `/admin/inquiries/${id}`);
}

export async function deleteInquiry(fd: FormData) {
  await requireUser(["ADMIN"]);
  await db.inquiry.delete({ where: { id: String(fd.get("id") ?? "") } }).catch(() => {});
  revalidatePath("/admin/inquiries");
  redirect("/admin/inquiries?deleted=1");
}

/* ------------------------------ SMTP settings ------------------------------ */

const emailList = z
  .string()
  .trim()
  .max(500)
  .refine(
    (v) => v.split(",").map((s) => s.trim()).filter(Boolean).every((e) => /^[^\s@,]+@[^\s@,]+\.[^\s@,]+$/.test(e)),
    "Notification recipients must be valid emails, separated by commas."
  );

const Smtp = z.object({
  smtp_host: z.string().trim().max(200).regex(/^[a-zA-Z0-9.-]*$/, "Enter a valid SMTP host, e.g. smtp.gmail.com"),
  smtp_port: z.coerce.number().int().min(1).max(65535),
  smtp_secure: z.enum(["true", "false"]),
  smtp_user: z.string().trim().max(200),
  smtp_pass: z.string().max(500),
  smtp_from: z.string().trim().max(200),
  notify_to: emailList,
});

export async function saveSmtp(_: FormState, fd: FormData): Promise<FormState> {
  await requireUser(["ADMIN"]);
  const parsed = Smtp.safeParse(Object.fromEntries(fd));
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  const v = parsed.data;
  if (v.smtp_host && !v.smtp_from) return { error: "Add a “From” address, e.g. Britech Website <noreply@britechsolutions.co.tz>" };
  if (v.smtp_host && !v.notify_to) return { error: "Add at least one email address to notify." };

  const values: Record<string, string> = {
    smtp_host: v.smtp_host,
    smtp_port: String(v.smtp_port),
    smtp_secure: v.smtp_secure,
    smtp_user: v.smtp_user,
    smtp_from: v.smtp_from,
    notify_to: v.notify_to,
  };
  // Password is write-only: blank keeps the saved one; "clear" box removes it.
  if (fd.get("smtp_pass_clear") === "on") values.smtp_pass = "";
  else if (v.smtp_pass) {
    if (!hasAppSecret()) return { error: "The server is missing APP_SECRET, so the password can’t be stored securely." };
    values.smtp_pass = encryptSecret(v.smtp_pass);
  }

  await db.$transaction(
    Object.entries(values)
      .filter(([k]) => (SMTP_KEYS as readonly string[]).includes(k))
      .map(([key, value]) => db.setting.upsert({ where: { key }, update: { value }, create: { key, value } }))
  );
  revalidatePath("/admin/settings");
  return { ok: "Email settings saved. Send a test email to check them." };
}

export async function sendSmtpTest(_: FormState, fd: FormData): Promise<FormState> {
  const user = await requireUser(["ADMIN"]);
  const to = String(fd.get("to") ?? "").trim() || user.email;
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(to)) return { error: "Enter a valid email address." };
  try {
    await sendTestEmail(to);
    return { ok: `Test email sent to ${to}. Check the inbox (and spam folder).` };
  } catch (e) {
    return { error: `Couldn’t send: ${e instanceof Error ? e.message : String(e)}` };
  }
}
