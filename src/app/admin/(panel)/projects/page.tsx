import Link from "next/link";
import { Plus } from "lucide-react";
import type { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { EmptyState, FilterChips, Pagination, SearchForm, parsePage } from "@/components/listing";
import { Notice, PageTitle } from "@/components/admin/StatusBadge";

export const metadata = { title: "Projects" };

const PAGE_SIZE = 25;

export default async function ProjectsAdmin({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string; deleted?: string; q?: string; type?: string; page?: string }>;
}) {
  await requireUser(["ADMIN", "EDITOR"]);
  const sp = await searchParams;
  const q = sp.q?.trim().slice(0, 100) || undefined;
  const type = sp.type === "products" || sp.type === "clients" ? sp.type : undefined;
  const page = parsePage(sp.page);

  const where: Prisma.ProjectWhereInput = {
    ...(q ? { OR: [{ name: { contains: q } }, { tagline: { contains: q } }, { client: { contains: q } }] } : {}),
    ...(type ? { isProduct: type === "products" } : {}),
  };
  const [projects, total] = await Promise.all([
    db.project.findMany({ where, orderBy: [{ sortOrder: "asc" }, { name: "asc" }], skip: (page - 1) * PAGE_SIZE, take: PAGE_SIZE }),
    db.project.count({ where }),
  ]);

  return (
    <div>
      <PageTitle
        title="Projects & products"
        text="Client work appears on Our Work. Projects marked “Show as a Britech product” appear on Products instead."
        action={
          <Link href="/admin/projects/new" className="inline-flex items-center gap-2 rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-600">
            <Plus className="h-4 w-4" /> Add project
          </Link>
        }
      />
      {sp.saved && <Notice>Project saved.</Notice>}
      {sp.deleted && <Notice>Project deleted.</Notice>}

      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <FilterChips
          path="/admin/projects"
          param="type"
          value={type}
          keep={{ q }}
          options={[{ label: "All" }, { label: "Products", value: "products" }, { label: "Client work", value: "clients" }]}
        />
        <SearchForm path="/admin/projects" q={q} keep={{ type }} placeholder="Search projects" />
      </div>

      {projects.length === 0 ? (
        <EmptyState title="No projects match" resetHref="/admin/projects" />
      ) : (
        <div className="overflow-x-auto rounded-xl border border-navy-100 bg-white">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="border-b border-navy-100 bg-navy-50/60 text-xs uppercase tracking-wider text-navy-500">
              <tr>
                <th className="px-5 py-3 font-semibold">Project</th>
                <th className="px-5 py-3 font-semibold">Client</th>
                <th className="px-5 py-3 font-semibold">Type</th>
                <th className="px-5 py-3 font-semibold">Status</th>
                <th className="px-5 py-3 font-semibold">Order</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-navy-100">
              {projects.map((p) => (
                <tr key={p.id} className="hover:bg-navy-50/60">
                  <td className="px-5 py-3">
                    <Link href={`/admin/projects/${p.id}`} className="flex items-center gap-3">
                      <span className="flex h-10 w-16 shrink-0 items-center justify-center">
                        {p.logo && (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={p.logo} alt="" className="max-h-10 max-w-16 object-contain" />
                        )}
                      </span>
                      <span>
                        <span className="block font-medium text-navy-900">{p.name}</span>
                        <span className="block text-xs text-navy-400">{p.tagline}</span>
                      </span>
                    </Link>
                  </td>
                  <td className="px-5 py-3 text-navy-600">{p.client ?? "Not set"}</td>
                  <td className="px-5 py-3">
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${p.isProduct ? "bg-navy-900 text-white" : "bg-navy-50 text-navy-600"}`}>
                      {p.isProduct ? "Product" : "Client work"}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-navy-600">{p.published ? "Visible" : "Hidden"}</td>
                  <td className="px-5 py-3 text-navy-600">{p.sortOrder}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <Pagination path="/admin/projects" params={{ q, type }} page={page} pages={Math.max(1, Math.ceil(total / PAGE_SIZE))} total={total} pageSize={PAGE_SIZE} noun="projects" />
    </div>
  );
}
