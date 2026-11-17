import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";
import { db } from "@/lib/db";
import { industries, services } from "@/lib/data";

const SITE = SITE_URL;

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const page = (path: string, priority: number, changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"] = "monthly") => ({
    url: `${SITE}${path}`,
    lastModified: now,
    changeFrequency,
    priority,
  });

  const staticPages = [
    page("", 1, "weekly"),
    page("/about", 0.8),
    page("/solutions", 0.9),
    page("/industries", 0.8),
    page("/products", 0.9),
    page("/our-work", 0.8),
    page("/clients", 0.7),
    page("/blog", 0.8, "weekly"),
    page("/contact", 0.8),
    ...services.map((s) => page(`/solutions/${s.slug}`, 0.8)),
    ...industries.map((i) => page(`/industries/${i.slug}`, 0.7)),
  ];

  // Published posts (skip gracefully if the database is unavailable).
  const posts = await db.post
    .findMany({ where: { status: "PUBLISHED" }, select: { slug: true, updatedAt: true }, orderBy: { publishedAt: "desc" }, take: 5000 })
    .catch(() => []);

  return [
    ...staticPages,
    ...posts.map((p) => ({ url: `${SITE}/blog/${p.slug}`, lastModified: p.updatedAt, changeFrequency: "monthly" as const, priority: 0.6 })),
  ];
}
