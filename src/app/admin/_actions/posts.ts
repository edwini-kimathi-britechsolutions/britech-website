"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import type { PostStatus } from "@prisma/client";
import { db } from "@/lib/db";
import { canManageContent, requireUser } from "@/lib/auth";
import { sanitizePostHtml, stripTags } from "@/lib/sanitize";
import { slugify } from "@/lib/utils";
import type { FormState } from "./types";

const imagePath = z
  .string()
  .trim()
  .refine((v) => v === "" || /^\/(media|images)\/[\w./-]+$/.test(v), "Cover image must be an uploaded image.");

const PostInput = z.object({
  title: z.string().trim().min(3, "Title is too short.").max(200),
  slug: z.string().trim().max(191).optional(),
  excerpt: z.string().trim().min(10, "Write a short summary (at least 10 characters).").max(400),
  category: z.string().trim().min(2, "Choose a category.").max(60),
  tags: z.string().trim().max(300).optional(),
  coverImage: imagePath.optional(),
  content: z.string().max(500_000),
  intent: z.enum(["draft", "review", "publish"]),
  featured: z.string().optional(),
});

async function uniqueSlug(base: string, excludeId?: string) {
  const root = slugify(base) || "post";
  let slug = root;
  for (let i = 2; ; i++) {
    const hit = await db.post.findFirst({ where: { slug, ...(excludeId ? { id: { not: excludeId } } : {}) }, select: { id: true } });
    if (!hit) return slug;
    slug = `${root}-${i}`;
  }
}

export async function savePost(_: FormState, fd: FormData): Promise<FormState> {
  const user = await requireUser();
  const id = String(fd.get("id") ?? "") || undefined;

  const parsed = PostInput.safeParse(Object.fromEntries(fd));
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  const input = parsed.data;

  const existing = id ? await db.post.findUnique({ where: { id } }) : null;
  if (id && !existing) return { error: "This post no longer exists." };

  const editor = canManageContent(user);
  if (existing && !editor) {
    if (existing.authorId !== user.id) return { error: "You can only edit your own posts." };
    if (existing.status === "PUBLISHED") return { error: "This post is published. Ask an editor to make changes." };
  }

  const content = sanitizePostHtml(input.content);
  if (input.intent !== "draft" && stripTags(content).trim().length < 50) {
    return { error: "Add more content before submitting (at least a short paragraph)." };
  }

  // Authors can’t publish — “publish” from an author becomes “submit for review”.
  const status: PostStatus = input.intent === "draft" ? "DRAFT" : input.intent === "publish" && editor ? "PUBLISHED" : "REVIEW";

  const data = {
    title: input.title,
    slug: await uniqueSlug(input.slug || input.title, id),
    excerpt: input.excerpt,
    category: input.category,
    tags: (input.tags ?? "")
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean)
      .slice(0, 10)
      .join(", "),
    coverImage: input.coverImage || null,
    content,
    status,
    featured: editor ? input.featured === "on" : (existing?.featured ?? false),
    publishedAt: status === "PUBLISHED" ? (existing?.publishedAt ?? new Date()) : existing?.publishedAt ?? null,
  };

  const post = existing
    ? await db.post.update({ where: { id: existing.id }, data })
    : await db.post.create({ data: { ...data, authorId: user.id } });

  revalidatePath("/blog", "layout");
  revalidatePath("/");
  redirect(`/admin/posts/${post.id}?saved=${status.toLowerCase()}`);
}

export async function deletePost(fd: FormData) {
  const user = await requireUser();
  const id = String(fd.get("id") ?? "");
  const post = await db.post.findUnique({ where: { id } });
  if (!post) redirect("/admin/posts");
  const allowed = canManageContent(user) || (post.authorId === user.id && post.status !== "PUBLISHED");
  if (!allowed) redirect(`/admin/posts/${id}?error=delete`);
  await db.post.delete({ where: { id } });
  revalidatePath("/blog", "layout");
  revalidatePath("/");
  redirect("/admin/posts?deleted=1");
}
