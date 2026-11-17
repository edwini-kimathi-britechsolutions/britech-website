"use server";

import { z } from "zod";
import { db } from "@/lib/db";
import { clientIp } from "@/lib/auth";
import { sendInquiryNotification } from "@/lib/mail";
import { INQUIRY_SERVICES } from "@/lib/data";
import { SITE_URL } from "@/lib/site";

export type ContactState = { error?: string; ok?: boolean } | undefined;

const Inquiry = z.object({
  firstName: z.string().trim().min(1, "Enter your first name.").max(80),
  lastName: z.string().trim().min(1, "Enter your last name.").max(80),
  company: z.string().trim().max(160).optional(),
  email: z.string().trim().toLowerCase().email("Enter a valid email address.").max(191),
  phone: z
    .string()
    .trim()
    .max(40)
    .regex(/^[+\d\s()-]*$/, "Phone number can only contain digits, spaces, +, ( ) and -.")
    .optional(),
  service: z.enum(INQUIRY_SERVICES, { error: "Choose how we can help." }),
  message: z.string().trim().min(10, "Please write a little more about your project.").max(5000),
});

const WINDOW_MS = 60 * 60 * 1000;
const MAX_PER_HOUR = 5;
const MIN_FILL_MS = 3000;

export async function submitInquiry(_: ContactState, fd: FormData): Promise<ContactState> {
  // Spam traps: a hidden field humans never fill, and a minimum time on the form.
  if (String(fd.get("website") ?? "") !== "") return { ok: true };
  const startedAt = Number(fd.get("t"));
  if (!startedAt || Date.now() - startedAt < MIN_FILL_MS) return { error: "Please take a moment to complete the form, then send it again." };

  const parsed = Inquiry.safeParse(Object.fromEntries(fd));
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const ip = await clientIp();
  const key = `inq:${ip}`;
  const recent = await db.loginAttempt.count({ where: { key, createdAt: { gt: new Date(Date.now() - WINDOW_MS) } } });
  if (recent >= MAX_PER_HOUR) return { error: "You’ve sent several messages already. Please email or call us instead." };
  await db.loginAttempt.create({ data: { key } });

  const d = parsed.data;
  const inquiry = await db.inquiry.create({
    data: { ...d, company: d.company || null, phone: d.phone || null, ip: ip.slice(0, 64) },
  });

  // Email the team. A mail failure never loses the inquiry — it is saved and shown in the admin.
  try {
    // Built from the configured site URL — never from request headers, which a visitor can forge.
    await sendInquiryNotification(inquiry, `${SITE_URL}/admin/inquiries/${inquiry.id}`);
    await db.inquiry.update({ where: { id: inquiry.id }, data: { emailedAt: new Date() } });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error("Inquiry email failed:", msg);
    await db.inquiry.update({ where: { id: inquiry.id }, data: { emailError: msg.slice(0, 500) } });
  }

  return { ok: true };
}
