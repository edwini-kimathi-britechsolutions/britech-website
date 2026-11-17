import Link from "next/link";
import { AlertTriangle } from "lucide-react";
import type { InquiryStatus, Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { getSmtpConfig } from "@/lib/mail";
import { formatDate } from "@/lib/utils";
import { EmptyState, FilterChips, Pagination, SearchForm, parsePage } from "@/components/listing";
import { Notice, PageTitle } from "@/components/admin/StatusBadge";

export const metadata = { title: "Inquiries" };

const PAGE_SIZE = 25;
const STATUSES: InquiryStatus[] = ["NEW", "READ", "ARCHIVED"];

export default async function InquiriesPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; q?: string; page?: string; archived?: string; deleted?: string }>;
}) {
  const user = await requireUser(["ADMIN", "EDITOR"]);
  const sp = await searchParams;
  const status = STATUSES.find((s) => s === sp.status);
  const q = sp.q?.trim().slice(0, 100) || undefined;
  const page = parsePage(sp.page);

  const search: Prisma.InquiryWhereInput = q
    ? {
        OR: [
          { firstName: { contains: q } },
          { lastName: { contains: q } },
          { email: { contains: q } },
          { company: { contains: q } },
          { message: { contains: q } },
        ],
      }
    : {};
  // Default view hides archived messages.
  const where: Prisma.InquiryWhereInput = { ...search, status: status ?? { not: "ARCHIVED" } };

  const [rows, total, counts, smtp] = await Promise.all([
    db.inquiry.findMany({ where, orderBy: { createdAt: "desc" }, skip: (page - 1) * PAGE_SIZE, take: PAGE_SIZE }),
    db.inquiry.count({ where }),
    db.inquiry.groupBy({ by: ["status"], where: search, _count: true }),
    getSmtpConfig(),
  ]);
  const count = (s: InquiryStatus) => counts.find((c) => c.status === s)?._count ?? 0;

  return (
    <div>
      <PageTitle title="Inquiries" text="Messages sent through the website contact form." />
      {sp.archived && <Notice>Inquiry archived.</Notice>}
      {sp.deleted && <Notice>Inquiry deleted.</Notice>}
      {!smtp.host && (
        <Notice tone="warn">
          Email notifications are off. Inquiries are still saved here.{" "}
          {user.role === "ADMIN" ? (
            <Link href="/admin/settings" className="font-semibold underline">Set up SMTP in Site settings</Link>
          ) : (
            "Ask an admin to set up SMTP in Site settings."
          )}
        </Notice>
      )}

      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <FilterChips
          path="/admin/inquiries"
          param="status"
          value={status}
          keep={{ q }}
          options={[
            { label: "Inbox", count: count("NEW") + count("READ") },
            { label: "New", value: "NEW", count: count("NEW") },
            { label: "Read", value: "READ", count: count("READ") },
            { label: "Archived", value: "ARCHIVED", count: count("ARCHIVED") },
          ]}
        />
        <SearchForm path="/admin/inquiries" q={q} keep={{ status }} placeholder="Search name, email, message" />
      </div>

      {rows.length === 0 ? (
        <EmptyState title={q || status ? "No inquiries match" : "No inquiries yet"} resetHref={q || status ? "/admin/inquiries" : undefined} />
      ) : (
        <div className="divide-y divide-navy-100 overflow-hidden rounded-xl border border-navy-100 bg-white">
          {rows.map((r) => (
            <Link key={r.id} href={`/admin/inquiries/${r.id}`} className="flex items-start gap-4 px-5 py-4 hover:bg-navy-50/60">
              <span className={`mt-2 h-2 w-2 shrink-0 rounded-full ${r.status === "NEW" ? "bg-mint-500" : "bg-transparent"}`} />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-baseline gap-x-2">
                  <span className={`text-navy-900 ${r.status === "NEW" ? "font-semibold" : "font-medium"}`}>
                    {r.firstName} {r.lastName}
                  </span>
                  {r.company && <span className="text-sm text-navy-500">· {r.company}</span>}
                </div>
                <p className="mt-0.5 truncate text-sm text-navy-500">
                  <span className="font-medium text-navy-700">{r.service}</span>: {r.message}
                </p>
              </div>
              <div className="flex shrink-0 flex-col items-end gap-1">
                <span className="text-xs text-navy-400">{formatDate(r.createdAt)}</span>
                {r.emailError && (
                  <span title={r.emailError} className="inline-flex items-center gap-1 text-xs text-amber-700">
                    <AlertTriangle className="h-3 w-3" /> not emailed
                  </span>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
      <Pagination path="/admin/inquiries" params={{ status, q }} page={page} pages={Math.max(1, Math.ceil(total / PAGE_SIZE))} total={total} pageSize={PAGE_SIZE} noun="inquiries" />
    </div>
  );
}
