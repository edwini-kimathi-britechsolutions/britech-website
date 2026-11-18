import Link from "next/link";
import { PenLine } from "lucide-react";
import type { PostStatus, Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { canManageContent, requireUser } from "@/lib/auth";
import { formatDate } from "@/lib/utils";
import { EmptyState, FilterChips, Pagination, SearchForm, parsePage } from "@/components/listing";
import { Notice, PageTitle, StatusBadge } from "@/components/admin/StatusBadge";

export const metadata = { title: "Blog posts" };

const PAGE_SIZE = 20;
const STATUSES: PostStatus[] = ["PUBLISHED", "REVIEW", "DRAFT"];

export default async function PostsPage({ searchParams }: { searchParams: Promise<{ status?: string; q?: string; page?: string; deleted?: string }> }) {
  const user = await requireUser();
  const sp = await searchParams;
  const status = STATUSES.find((s) => s === sp.status);
  const q = sp.q?.trim().slice(0, 100) || undefined;
  const page = parsePage(sp.page);
  const editor = canManageContent(user);

  const base: Prisma.PostWhereInput = {
    ...(editor ? {} : { authorId: user.id }),
    ...(q ? { OR: [{ title: { contains: q } }, { excerpt: { contains: q } }, { tags: { contains: q } }] } : {}),
  };
  const where: Prisma.PostWhereInput = { ...base, ...(status ? { status } : {}) };

  const [posts, total, counts] = await Promise.all([
    db.post.findMany({
      where,
      orderBy: { updatedAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      select: { id: true, title: true, status: true, category: true, updatedAt: true, author: { select: { name: true } } },
    }),
    db.post.count({ where }),
    db.post.groupBy({ by: ["status"], where: base, _count: true }),
  ]);
  const count = (s?: PostStatus) => (s ? (counts.find((c) => c.status === s)?._count ?? 0) : counts.reduce((n, c) => n + c._count, 0));

  return (
    <div>
      <PageTitle
        title="Blog posts"
        text={editor ? "Write, review and publish articles." : "Write articles and submit them for review."}
        action={
          <Link href="/admin/posts/new" className="inline-flex items-center gap-2 rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-600">
            <PenLine className="h-4 w-4" /> New post
          </Link>
        }
      />
      {sp.deleted && <Notice>Post deleted.</Notice>}

      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <FilterChips
          path="/admin/posts"
          param="status"
          value={status}
          keep={{ q }}
          options={[
            { label: "All", count: count() },
            { label: "Published", value: "PUBLISHED", count: count("PUBLISHED") },
            { label: "In review", value: "REVIEW", count: count("REVIEW") },
            { label: "Drafts", value: "DRAFT", count: count("DRAFT") },
          ]}
        />
        <SearchForm path="/admin/posts" q={q} keep={{ status }} placeholder="Search posts" />
      </div>

      {posts.length === 0 ? (
        <EmptyState title={q || status ? "No posts match" : "No posts yet"} resetHref={q || status ? "/admin/posts" : undefined} />
      ) : (
        <div className="divide-y divide-navy-100 overflow-hidden rounded-xl border border-navy-100 bg-white">
          {posts.map((p) => (
            <Link key={p.id} href={`/admin/posts/${p.id}`} className="flex items-center gap-4 px-5 py-4 hover:bg-navy-50/60">
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium text-navy-900">{p.title}</p>
                <p className="truncate text-xs text-navy-400">
                  {p.category} · {p.author.name} · updated {formatDate(p.updatedAt)}
                </p>
              </div>
              <StatusBadge status={p.status} />
            </Link>
          ))}
        </div>
      )}
      <Pagination path="/admin/posts" params={{ status, q }} page={page} pages={Math.max(1, Math.ceil(total / PAGE_SIZE))} total={total} pageSize={PAGE_SIZE} noun="posts" />
    </div>
  );
}
