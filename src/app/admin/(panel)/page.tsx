import Link from "next/link";
import { ArrowRight, Briefcase, FileText, Handshake, Inbox, PenLine } from "lucide-react";
import { db } from "@/lib/db";
import { canManageContent, requireUser } from "@/lib/auth";
import { formatDate } from "@/lib/utils";
import { StatusBadge } from "@/components/admin/StatusBadge";

export const metadata = { title: "Dashboard" };

export default async function Dashboard({ searchParams }: { searchParams: Promise<{ denied?: string }> }) {
  const user = await requireUser();
  const { denied } = await searchParams;
  const editor = canManageContent(user);
  const mine = editor ? {} : { authorId: user.id };

  const [published, review, drafts, projects, partners, recent, inquiries] = await Promise.all([
    db.post.count({ where: { ...mine, status: "PUBLISHED" } }),
    db.post.count({ where: { ...mine, status: "REVIEW" } }),
    db.post.count({ where: { ...mine, status: "DRAFT" } }),
    db.project.count(),
    db.partner.count({ where: { active: true } }),
    db.post.findMany({
      where: mine,
      orderBy: { updatedAt: "desc" },
      take: 6,
      select: { id: true, title: true, status: true, updatedAt: true, author: { select: { name: true } } },
    }),
    editor ? db.inquiry.count({ where: { status: "NEW" } }) : Promise.resolve(0),
  ]);

  const cards = [
    { label: "Published posts", value: published, href: "/admin/posts?status=PUBLISHED", Icon: FileText },
    { label: "Awaiting review", value: review, href: "/admin/posts?status=REVIEW", Icon: PenLine },
    { label: "Drafts", value: drafts, href: "/admin/posts?status=DRAFT", Icon: FileText },
    ...(editor
      ? [
          { label: "New inquiries", value: inquiries, href: "/admin/inquiries?status=NEW", Icon: Inbox },
          { label: "Projects", value: projects, href: "/admin/projects", Icon: Briefcase },
          { label: "Clients & partners", value: partners, href: "/admin/partners", Icon: Handshake },
        ]
      : []),
  ];

  return (
    <div>
      {denied && (
        <p className="mb-6 rounded-lg bg-amber-50 px-4 py-3 text-sm text-amber-800">You don’t have permission to open that page.</p>
      )}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-navy-900">Welcome, {user.name.split(" ")[0]}</h1>
          <p className="text-navy-500">Manage the Britech Solutions website.</p>
        </div>
        <Link
          href="/admin/posts/new"
          className="inline-flex items-center gap-2 rounded-lg bg-mint-500 px-4 py-2.5 text-sm font-semibold text-navy-950 hover:bg-mint-400"
        >
          <PenLine className="h-4 w-4" /> Write a post
        </Link>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-3 xl:grid-cols-6">
        {cards.map(({ label, value, href, Icon }) => (
          <Link key={label} href={href} className="rounded-xl border border-navy-100 bg-white p-5 transition hover:border-navy-300">
            <Icon className="h-5 w-5 text-navy-900" />
            <p className="mt-3 text-3xl font-bold text-navy-900">{value}</p>
            <p className="text-sm text-navy-500">{label}</p>
          </Link>
        ))}
      </div>

      <section className="mt-10">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-navy-900">Recently updated posts</h2>
          <Link href="/admin/posts" className="inline-flex items-center gap-1 text-sm font-medium text-navy-900">
            All posts <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="mt-4 divide-y divide-navy-100 overflow-hidden rounded-xl border border-navy-100 bg-white">
          {recent.length === 0 && <p className="p-6 text-sm text-navy-500">No posts yet. Write the first one!</p>}
          {recent.map((p) => (
            <Link key={p.id} href={`/admin/posts/${p.id}`} className="flex items-center gap-4 px-5 py-3.5 hover:bg-navy-50/60">
              <span className="min-w-0 flex-1 truncate font-medium text-navy-900">{p.title}</span>
              <span className="hidden text-sm text-navy-400 sm:block">{p.author.name}</span>
              <span className="hidden text-sm text-navy-400 md:block">{formatDate(p.updatedAt)}</span>
              <StatusBadge status={p.status} />
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
