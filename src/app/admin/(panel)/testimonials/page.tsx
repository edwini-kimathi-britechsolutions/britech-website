import Link from "next/link";
import { Plus, Quote } from "lucide-react";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { EmptyState, Pagination, SearchForm, parsePage } from "@/components/listing";
import { Notice, PageTitle } from "@/components/admin/StatusBadge";

export const metadata = { title: "Testimonials" };

const PAGE_SIZE = 20;

export default async function TestimonialsAdmin({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string; deleted?: string; q?: string; page?: string }>;
}) {
  await requireUser(["ADMIN", "EDITOR"]);
  const sp = await searchParams;
  const q = sp.q?.trim().slice(0, 100) || undefined;
  const page = parsePage(sp.page);
  const where = q ? { OR: [{ name: { contains: q } }, { organization: { contains: q } }, { quote: { contains: q } }] } : {};
  const [items, total] = await Promise.all([
    db.testimonial.findMany({ where, orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }], skip: (page - 1) * PAGE_SIZE, take: PAGE_SIZE }),
    db.testimonial.count({ where }),
  ]);

  return (
    <div>
      <PageTitle
        title="Testimonials"
        text="Client quotes on the home page. The section stays hidden until at least one is visible."
        action={
          <Link href="/admin/testimonials/new" className="inline-flex items-center gap-2 rounded-lg bg-mint-500 px-4 py-2.5 text-sm font-semibold text-navy-950 hover:bg-mint-400">
            <Plus className="h-4 w-4" /> Add testimonial
          </Link>
        }
      />
      {sp.saved && <Notice>Saved.</Notice>}
      {sp.deleted && <Notice>Deleted.</Notice>}
      <div className="mb-4 flex justify-end">
        <SearchForm path="/admin/testimonials" q={q} placeholder="Search testimonials" />
      </div>
      {items.length === 0 ? (
        <EmptyState
          title={q ? "No testimonials match" : "No testimonials yet"}
          text={q ? undefined : "Ask a happy client for a short quote and add it here."}
          resetHref={q ? "/admin/testimonials" : undefined}
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {items.map((t) => (
            <Link key={t.id} href={`/admin/testimonials/${t.id}`} className="rounded-xl border border-navy-100 bg-white p-5 transition hover:border-mint-300">
              <Quote className="h-5 w-5 text-navy-900" />
              <p className="mt-2 line-clamp-3 text-navy-700">{t.quote}</p>
              <p className="mt-3 text-sm font-semibold text-navy-900">{t.name}</p>
              <p className="text-xs text-navy-400">
                {[t.role, t.organization].filter(Boolean).join(", ")} · {t.active ? "visible" : "hidden"}
              </p>
            </Link>
          ))}
        </div>
      )}
      <Pagination path="/admin/testimonials" params={{ q }} page={page} pages={Math.max(1, Math.ceil(total / PAGE_SIZE))} total={total} pageSize={PAGE_SIZE} noun="testimonials" />
    </div>
  );
}
