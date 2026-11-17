import type { PostStatus } from "@prisma/client";

const styles: Record<PostStatus, string> = {
  PUBLISHED: "bg-navy-900 text-white ring-navy-900",
  REVIEW: "bg-amber-50 text-amber-700 ring-amber-200",
  DRAFT: "bg-navy-50 text-navy-600 ring-navy-200",
};
const labels: Record<PostStatus, string> = { PUBLISHED: "Published", REVIEW: "In review", DRAFT: "Draft" };

export function StatusBadge({ status }: { status: PostStatus }) {
  return <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ${styles[status]}`}>{labels[status]}</span>;
}

export function PageTitle({ title, text, action }: { title: string; text?: string; action?: React.ReactNode }) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="text-2xl font-bold text-navy-900">{title}</h1>
        {text && <p className="text-navy-500">{text}</p>}
      </div>
      {action}
    </div>
  );
}

export function Notice({ children, tone = "ok" }: { children: React.ReactNode; tone?: "ok" | "warn" }) {
  return (
    <p className={`mb-6 rounded-lg px-4 py-3 text-sm ${tone === "ok" ? "bg-navy-50 text-navy-900" : "bg-amber-50 text-amber-800"}`}>
      {children}
    </p>
  );
}
