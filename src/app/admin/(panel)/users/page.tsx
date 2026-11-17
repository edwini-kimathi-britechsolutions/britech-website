import type { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { EmptyState, Pagination, SearchForm, parsePage } from "@/components/listing";
import { CreateUserForm, UserRow } from "@/components/admin/forms";
import { PageTitle } from "@/components/admin/StatusBadge";

export const metadata = { title: "Team accounts" };

const PAGE_SIZE = 25;

export default async function UsersPage({ searchParams }: { searchParams: Promise<{ q?: string; page?: string }> }) {
  const me = await requireUser(["ADMIN"]);
  const sp = await searchParams;
  const q = sp.q?.trim().slice(0, 100) || undefined;
  const page = parsePage(sp.page);
  const where: Prisma.UserWhereInput = q ? { OR: [{ name: { contains: q } }, { email: { contains: q } }] } : {};
  const [users, total] = await Promise.all([
    db.user.findMany({
      where,
      orderBy: [{ active: "desc" }, { name: "asc" }],
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      select: { id: true, name: true, email: true, role: true, active: true },
    }),
    db.user.count({ where }),
  ]);
  return (
    <div className="space-y-6">
      <PageTitle title="Team accounts" text="Authors write posts, editors publish and manage content, admins manage everything." />
      <CreateUserForm />
      <div className="flex justify-end">
        <SearchForm path="/admin/users" q={q} placeholder="Search name or email" />
      </div>
      {users.length === 0 ? (
        <EmptyState title="No accounts match" resetHref="/admin/users" />
      ) : (
        <div className="space-y-3">
          {users.map((u) => (
            <UserRow key={u.id} user={u} isMe={u.id === me.id} />
          ))}
        </div>
      )}
      <Pagination path="/admin/users" params={{ q }} page={page} pages={Math.max(1, Math.ceil(total / PAGE_SIZE))} total={total} pageSize={PAGE_SIZE} noun="accounts" />
    </div>
  );
}
