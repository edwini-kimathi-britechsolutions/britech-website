import Link from "next/link";
import { Plus } from "lucide-react";
import type { PartnerKind, Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { EmptyState, FilterChips, Pagination, SearchForm, parsePage } from "@/components/listing";
import { Notice, PageTitle } from "@/components/admin/StatusBadge";

export const metadata = { title: "Clients & partners" };

const PAGE_SIZE = 40;
const KIND = { PARTNER: "Partner", CLIENT: "Client", BOTH: "Client & partner" } as const;

export default async function PartnersAdmin({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string; deleted?: string; q?: string; kind?: string; show?: string; page?: string }>;
}) {
  await requireUser(["ADMIN", "EDITOR"]);
  const sp = await searchParams;
  const q = sp.q?.trim().slice(0, 100) || undefined;
  const kind = (Object.keys(KIND) as PartnerKind[]).find((k) => k === sp.kind);
  const show = sp.show === "hidden" ? "hidden" : undefined;
  const page = parsePage(sp.page);

  const where: Prisma.PartnerWhereInput = {
    ...(q ? { name: { contains: q } } : {}),
    ...(kind ? { kind } : {}),
    ...(show ? { active: false } : {}),
  };
  const [partners, total, hiddenCount] = await Promise.all([
    db.partner.findMany({ where, orderBy: [{ sortOrder: "asc" }, { name: "asc" }], skip: (page - 1) * PAGE_SIZE, take: PAGE_SIZE }),
    db.partner.count({ where }),
    db.partner.count({ where: { active: false } }),
  ]);

  return (
    <div>
      <PageTitle
        title="Clients & partners"
        text="Logos shown on the home page (first 15) and the Clients & Partners page."
        action={
          <Link href="/admin/partners/new" className="inline-flex items-center gap-2 rounded-lg bg-mint-500 px-4 py-2.5 text-sm font-semibold text-navy-950 hover:bg-mint-400">
            <Plus className="h-4 w-4" /> Add logo
          </Link>
        }
      />
      {sp.saved && <Notice>Saved.</Notice>}
      {sp.deleted && <Notice>Removed.</Notice>}
      {hiddenCount > 0 && !show && (
        <Notice tone="warn">
          {hiddenCount} logo{hiddenCount > 1 ? "s are" : " is"} hidden from the website.{" "}
          <Link href="/admin/partners?show=hidden" className="font-semibold underline">
            Review
          </Link>
        </Notice>
      )}

      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <FilterChips
          path="/admin/partners"
          param="kind"
          value={kind}
          keep={{ q, show }}
          options={[{ label: "All" }, { label: "Clients", value: "CLIENT" }, { label: "Partners", value: "PARTNER" }, { label: "Both", value: "BOTH" }]}
        />
        <SearchForm path="/admin/partners" q={q} keep={{ kind, show }} placeholder="Search organizations" />
      </div>

      {partners.length === 0 ? (
        <EmptyState title="Nothing matches" resetHref="/admin/partners" />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5">
          {partners.map((p) => (
            <Link key={p.id} href={`/admin/partners/${p.id}`} className="rounded-xl border border-navy-100 bg-white p-4 transition hover:border-navy-300">
              <div className="flex h-14 items-center justify-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={p.logo} alt="" className={`max-h-12 max-w-[140px] object-contain ${p.active ? "" : "opacity-40"}`} />
              </div>
              <p className="mt-3 truncate text-sm font-semibold text-navy-900">{p.name}</p>
              <p className="text-xs text-navy-400">
                {KIND[p.kind]} · {p.active ? "visible" : "hidden"} · #{p.sortOrder}
              </p>
            </Link>
          ))}
        </div>
      )}
      <Pagination path="/admin/partners" params={{ q, kind, show }} page={page} pages={Math.max(1, Math.ceil(total / PAGE_SIZE))} total={total} pageSize={PAGE_SIZE} noun="logos" />
    </div>
  );
}
