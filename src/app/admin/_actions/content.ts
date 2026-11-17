"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { CONTENT_TAG, SETTING_KEYS } from "@/lib/content";
import { safeUrl, slugify } from "@/lib/utils";
import type { FormState } from "./types";

const EDITORS = ["ADMIN", "EDITOR"] as const;

const image = z
  .string()
  .trim()
  .refine((v) => v === "" || /^\/(media|images)\/[\w./-]+$/.test(v), "Logo must be an uploaded image.");

const optionalUrl = z
  .string()
  .trim()
  .max(300)
  .refine((v) => v === "" || safeUrl(v) !== null, "Enter a full web address starting with https://");

function revalidatePublic() {
  revalidateTag(CONTENT_TAG); // clear cached settings/logos/projects/testimonials
  revalidatePath("/", "layout");
}

/* ------------------------------ projects ------------------------------ */

const ProjectInput = z.object({
  name: z.string().trim().min(2).max(120),
  slug: z.string().trim().max(191).optional(),
  client: z.string().trim().max(160).optional(),
  tagline: z.string().trim().min(3, "Add a short tagline.").max(200),
  description: z.string().trim().min(20, "Description is too short.").max(5000),
  url: optionalUrl,
  logo: image,
  sector: z.string().trim().max(80).optional(),
  highlights: z.string().max(3000).optional(),
  sortOrder: z.coerce.number().int().min(0).max(999),
  published: z.string().optional(),
  isProduct: z.string().optional(),
});

export async function saveProject(_: FormState, fd: FormData): Promise<FormState> {
  await requireUser([...EDITORS]);
  const id = String(fd.get("id") ?? "") || undefined;
  const parsed = ProjectInput.safeParse(Object.fromEntries(fd));
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  const p = parsed.data;

  const slug = slugify(p.slug || p.name);
  const clash = await db.project.findFirst({ where: { slug, ...(id ? { id: { not: id } } : {}) } });
  if (clash) return { error: `Another project already uses the address “${slug}”.` };

  const data = {
    name: p.name,
    slug,
    client: p.client || null,
    tagline: p.tagline,
    description: p.description,
    url: safeUrl(p.url),
    logo: p.logo || null,
    sector: p.sector || null,
    highlights: (p.highlights ?? "")
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean)
      .join("\n"),
    sortOrder: p.sortOrder,
    published: p.published === "on",
    isProduct: p.isProduct === "on",
  };
  if (id) await db.project.update({ where: { id }, data });
  else await db.project.create({ data });
  revalidatePublic();
  redirect("/admin/projects?saved=1");
}

export async function deleteProject(fd: FormData) {
  await requireUser([...EDITORS]);
  await db.project.delete({ where: { id: String(fd.get("id")) } }).catch(() => {});
  revalidatePublic();
  redirect("/admin/projects?deleted=1");
}

/* ------------------------------ partners ------------------------------ */

const PartnerInput = z.object({
  name: z.string().trim().min(2).max(160),
  logo: image.refine((v) => v !== "", "Upload a logo."),
  url: optionalUrl,
  kind: z.enum(["PARTNER", "CLIENT", "BOTH"]),
  sortOrder: z.coerce.number().int().min(0).max(999),
  active: z.string().optional(),
});

export async function savePartner(_: FormState, fd: FormData): Promise<FormState> {
  await requireUser([...EDITORS]);
  const id = String(fd.get("id") ?? "") || undefined;
  const parsed = PartnerInput.safeParse(Object.fromEntries(fd));
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  const p = parsed.data;
  const data = { name: p.name, logo: p.logo, url: safeUrl(p.url), kind: p.kind, sortOrder: p.sortOrder, active: p.active === "on" };
  if (id) await db.partner.update({ where: { id }, data });
  else await db.partner.create({ data });
  revalidatePublic();
  redirect("/admin/partners?saved=1");
}

export async function deletePartner(fd: FormData) {
  await requireUser([...EDITORS]);
  await db.partner.delete({ where: { id: String(fd.get("id")) } }).catch(() => {});
  revalidatePublic();
  redirect("/admin/partners?deleted=1");
}

/* ------------------------------ settings ------------------------------ */

const SOCIAL = ["linkedin", "twitter", "facebook", "instagram", "youtube"];

export async function saveSettings(_: FormState, fd: FormData): Promise<FormState> {
  await requireUser(["ADMIN"]);
  const values: Record<string, string> = {};
  for (const key of SETTING_KEYS) {
    const v = String(fd.get(key) ?? "").trim().slice(0, 300);
    if (SOCIAL.includes(key) && v && !safeUrl(v)?.startsWith("http")) {
      return { error: `The ${key} link must be a full address starting with https://` };
    }
    if (key === "email" && v && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) return { error: "Enter a valid email address." };
    if (key === "whatsapp" && v && !/^\+?[\d\s]{9,20}$/.test(v)) return { error: "WhatsApp number must be digits, e.g. +255 795 005 903" };
    if (key === "announcement_link" && v && !safeUrl(v)) return { error: "Announcement link must start with / or https://" };
    values[key] = v;
  }
  await db.$transaction(
    Object.entries(values).map(([key, value]) => db.setting.upsert({ where: { key }, update: { value }, create: { key, value } }))
  );
  revalidatePublic();
  return { ok: "Settings saved." };
}

/* ---------------------------- testimonials ---------------------------- */

const TestimonialInput = z.object({
  quote: z.string().trim().min(10, "The quote is too short.").max(600, "Keep quotes under 600 characters."),
  name: z.string().trim().min(2, "Enter the person’s name.").max(120),
  role: z.string().trim().max(160).optional(),
  organization: z.string().trim().max(160).optional(),
  photo: image,
  sortOrder: z.coerce.number().int().min(0).max(999),
  active: z.string().optional(),
});

export async function saveTestimonial(_: FormState, fd: FormData): Promise<FormState> {
  await requireUser([...EDITORS]);
  const id = String(fd.get("id") ?? "") || undefined;
  const parsed = TestimonialInput.safeParse(Object.fromEntries(fd));
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  const t = parsed.data;
  const data = {
    quote: t.quote,
    name: t.name,
    role: t.role || null,
    organization: t.organization || null,
    photo: t.photo || null,
    sortOrder: t.sortOrder,
    active: t.active === "on",
  };
  if (id) await db.testimonial.update({ where: { id }, data });
  else await db.testimonial.create({ data });
  revalidatePublic();
  redirect("/admin/testimonials?saved=1");
}

export async function deleteTestimonial(fd: FormData) {
  await requireUser([...EDITORS]);
  await db.testimonial.delete({ where: { id: String(fd.get("id")) } }).catch(() => {});
  revalidatePublic();
  redirect("/admin/testimonials?deleted=1");
}
