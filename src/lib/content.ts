import "server-only";
import { cache } from "react";
import { unstable_cache } from "next/cache";
import type { PartnerKind } from "@prisma/client";
import { db } from "./db";
import { company } from "./data";

/* ------------------------------ caching ------------------------------ */

/**
 * Admin-edited content is cached across requests and cleared on every admin save
 * (`revalidateTag(CONTENT_TAG)`), with a 1-hour safety refresh.
 * Note: cached values are JSON, so Date fields come back as strings — don't format them.
 */
export const CONTENT_TAG = "content";
const cached = <A extends unknown[], R>(fn: (...args: A) => Promise<R>, key: string) =>
  unstable_cache(fn, [key], { tags: [CONTENT_TAG], revalidate: 3600 });

const loadSettingRows = cached(() => db.setting.findMany(), "settings");

/* ----------------------------- settings ---------------------------- */

export const SETTING_KEYS = [
  "phone1",
  "phone2",
  "email",
  "address",
  "linkedin",
  "twitter",
  "facebook",
  "instagram",
  "youtube",
  "whatsapp",
  "announcement_text",
  "announcement_link",
] as const;
export type SettingKey = (typeof SETTING_KEYS)[number];
export type SiteSettings = Record<SettingKey, string>;

const DEFAULTS: SiteSettings = {
  phone1: company.phones[0],
  phone2: company.phones[1] ?? "",
  email: company.email,
  address: company.address,
  // Social links stay empty until set in the admin, so no placeholder links are shown.
  linkedin: "",
  twitter: "",
  facebook: "",
  instagram: "",
  youtube: "",
  // WhatsApp button stays hidden until a number is set in the admin.
  whatsapp: "",
  // Empty text hides the announcement bar.
  announcement_text: "Meet Njiwa, Britech’s bulk SMS platform.",
  announcement_link: "/products#njiwa",
};

export const getSettings = cache(async (): Promise<SiteSettings> => {
  try {
    const rows = await loadSettingRows();
    const out = { ...DEFAULTS };
    for (const r of rows) if ((SETTING_KEYS as readonly string[]).includes(r.key)) out[r.key as SettingKey] = r.value;
    return out;
  } catch (e) {
    console.error("getSettings failed, using defaults", e);
    return DEFAULTS;
  }
});

/* ------------------------- partners & projects ------------------------ */

const byOrder = [{ sortOrder: "asc" as const }, { name: "asc" as const }];

/** Home page preview: first N logos plus the total count. */
async function loadPartnerPreview(take = 15) {
  const where = { active: true };
  const [partners, total] = await Promise.all([
    db.partner.findMany({ where, orderBy: byOrder, take }),
    db.partner.count({ where }),
  ]);
  return { partners, total };
}
export const getPartnerPreview = cached(loadPartnerPreview, "partner-preview");

export const PARTNER_PAGE_SIZE = 30;

async function loadPartnersPage({ q, kind, page = 1 }: { q?: string; kind?: PartnerKind; page?: number }) {
  const where = {
    active: true,
    ...(q ? { name: { contains: q } } : {}),
    // "BOTH" counts as both a client and a partner.
    ...(kind ? { kind: { in: [kind, "BOTH" as const] } } : {}),
  };
  const [partners, total] = await Promise.all([
    db.partner.findMany({ where, orderBy: byOrder, skip: (page - 1) * PARTNER_PAGE_SIZE, take: PARTNER_PAGE_SIZE }),
    db.partner.count({ where }),
  ]);
  return { partners, total, pages: Math.max(1, Math.ceil(total / PARTNER_PAGE_SIZE)) };
}
export const getPartnersPage = cached(loadPartnersPage, "partners-page");

export const PROJECT_PAGE_SIZE = 12;

async function loadProjectsPage({ q, sector, page = 1 }: { q?: string; sector?: string; page?: number }) {
  const where = {
    published: true,
    isProduct: false, // Britech products are listed on /products, not here
    ...(sector ? { sector } : {}),
    ...(q ? { OR: [{ name: { contains: q } }, { tagline: { contains: q } }, { client: { contains: q } }, { description: { contains: q } }] } : {}),
  };
  const [projects, total] = await Promise.all([
    db.project.findMany({ where, orderBy: byOrder, skip: (page - 1) * PROJECT_PAGE_SIZE, take: PROJECT_PAGE_SIZE }),
    db.project.count({ where }),
  ]);
  return { projects, total, pages: Math.max(1, Math.ceil(total / PROJECT_PAGE_SIZE)) };
}
export const getProjectsPage = cached(loadProjectsPage, "projects-page");

async function loadProjectSectors() {
  const rows = await db.project.groupBy({ by: ["sector"], where: { published: true, isProduct: false, sector: { not: null } }, _count: true });
  return rows.map((r) => ({ name: r.sector as string, count: r._count })).sort((a, b) => a.name.localeCompare(b.name));
}
export const getProjectSectors = cached(loadProjectSectors, "project-sectors");

export const PRODUCT_PAGE_SIZE = 6;

/** Britech-owned platforms (projects flagged “Show as a product”). */
async function loadProducts({ page = 1, take }: { page?: number; take?: number } = {}) {
  const where = { published: true, isProduct: true };
  const size = take ?? PRODUCT_PAGE_SIZE;
  const [products, total] = await Promise.all([
    db.project.findMany({ where, orderBy: byOrder, skip: (page - 1) * size, take: size }),
    db.project.count({ where }),
  ]);
  return { products, total, pages: Math.max(1, Math.ceil(total / size)) };
}
export const getProducts = cached(loadProducts, "products");

/* ------------------------------- posts ------------------------------- */

const publicPost = {
  id: true,
  title: true,
  slug: true,
  excerpt: true,
  coverImage: true,
  category: true,
  tags: true,
  featured: true,
  publishedAt: true,
  content: true,
  author: { select: { name: true } },
} as const;

export const PAGE_SIZE = 9;

export async function getPublishedPosts({ category, q, page = 1 }: { category?: string; q?: string; page?: number }) {
  const where = {
    status: "PUBLISHED" as const,
    ...(category ? { category } : {}),
    ...(q ? { OR: [{ title: { contains: q } }, { excerpt: { contains: q } }, { tags: { contains: q } }] } : {}),
  };
  const [posts, total] = await Promise.all([
    db.post.findMany({
      where,
      select: publicPost,
      orderBy: { publishedAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    db.post.count({ where }),
  ]);
  return { posts, total, pages: Math.max(1, Math.ceil(total / PAGE_SIZE)) };
}

export async function getPostCategories() {
  const rows = await db.post.groupBy({ by: ["category"], where: { status: "PUBLISHED" }, _count: true });
  return rows.map((r) => ({ name: r.category, count: r._count })).sort((a, b) => b.count - a.count);
}

export const getPostBySlug = cache((slug: string) =>
  db.post.findFirst({ where: { slug, status: "PUBLISHED" }, select: publicPost })
);

export async function getRelatedPosts(category: string, excludeId: string) {
  return db.post.findMany({
    where: { status: "PUBLISHED", category, id: { not: excludeId } },
    select: publicPost,
    orderBy: { publishedAt: "desc" },
    take: 3,
  });
}

export async function getLatestPosts(take = 3) {
  try {
    return await db.post.findMany({ where: { status: "PUBLISHED" }, select: publicPost, orderBy: { publishedAt: "desc" }, take });
  } catch {
    return [];
  }
}

export type PublicPost = Awaited<ReturnType<typeof getLatestPosts>>[number];

/* ---------------------------- testimonials --------------------------- */

const loadTestimonials = cached(
  (take: number) => db.testimonial.findMany({ where: { active: true }, orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }], take }),
  "testimonials"
);

export async function getTestimonials(take = 6) {
  try {
    return await loadTestimonials(take);
  } catch {
    return [];
  }
}
