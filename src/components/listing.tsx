import Link from "next/link";
import { ChevronLeft, ChevronRight, Search, X } from "lucide-react";

/* Shared, JS-free list controls (plain links and GET forms), used on public and admin pages. */

export type Query = Record<string, string | number | undefined | null>;

export function buildHref(path: string, params: Query) {
  const q = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v === undefined || v === null || v === "" || (k === "page" && Number(v) <= 1)) continue;
    q.set(k, String(v));
  }
  const s = q.toString();
  return s ? `${path}?${s}` : path;
}

export function parsePage(v: string | undefined) {
  return Math.max(1, Math.min(10_000, Number.parseInt(v ?? "1", 10) || 1));
}

/** Compact page list: 1 … 4 5 [6] 7 8 … 20 */
function pageList(page: number, pages: number): (number | "…")[] {
  const set = new Set([1, pages, page - 1, page, page + 1].filter((n) => n >= 1 && n <= pages));
  const sorted = [...set].sort((a, b) => a - b);
  const out: (number | "…")[] = [];
  sorted.forEach((n, i) => {
    if (i > 0 && n - (sorted[i - 1] as number) > 1) out.push("…");
    out.push(n);
  });
  return out;
}

export function Pagination({
  path,
  params,
  page,
  pages,
  total,
  pageSize,
  noun = "items",
}: {
  path: string;
  params: Query;
  page: number;
  pages: number;
  total: number;
  pageSize: number;
  noun?: string;
}) {
  if (total === 0) return null;
  const from = (page - 1) * pageSize + 1;
  const to = Math.min(total, page * pageSize);
  const link = (p: number) => buildHref(path, { ...params, page: p });
  const btn = "flex h-9 min-w-9 items-center justify-center rounded-lg px-2 text-sm font-medium transition";

  return (
    <nav aria-label="Pagination" className="mt-10 flex flex-col items-center justify-between gap-4 sm:flex-row">
      <p className="text-sm text-navy-400">
        Showing <span className="font-medium text-navy-700">{from}</span>–<span className="font-medium text-navy-700">{to}</span> of{" "}
        <span className="font-medium text-navy-700">{total}</span> {noun}
      </p>
      {pages > 1 && (
        <ul className="flex items-center gap-1">
          <li>
            {page > 1 ? (
              <Link href={link(page - 1)} aria-label="Previous page" className={`${btn} text-navy-600 ring-1 ring-navy-200 hover:bg-navy-50`}>
                <ChevronLeft className="h-4 w-4" />
              </Link>
            ) : (
              <span className={`${btn} text-navy-300 ring-1 ring-navy-100`}>
                <ChevronLeft className="h-4 w-4" />
              </span>
            )}
          </li>
          {pageList(page, pages).map((p, i) =>
            p === "…" ? (
              <li key={`e${i}`} className="px-1 text-navy-300">
                …
              </li>
            ) : (
              <li key={p}>
                <Link
                  href={link(p)}
                  aria-current={p === page ? "page" : undefined}
                  className={`${btn} ${p === page ? "bg-navy-900 text-white" : "text-navy-600 hover:bg-navy-50"}`}
                >
                  {p}
                </Link>
              </li>
            )
          )}
          <li>
            {page < pages ? (
              <Link href={link(page + 1)} aria-label="Next page" className={`${btn} text-navy-600 ring-1 ring-navy-200 hover:bg-navy-50`}>
                <ChevronRight className="h-4 w-4" />
              </Link>
            ) : (
              <span className={`${btn} text-navy-300 ring-1 ring-navy-100`}>
                <ChevronRight className="h-4 w-4" />
              </span>
            )}
          </li>
        </ul>
      )}
    </nav>
  );
}

/** GET search form; keeps other filters as hidden fields and resets to page 1. */
export function SearchForm({
  path,
  q,
  keep = {},
  placeholder = "Search…",
}: {
  path: string;
  q?: string;
  keep?: Query;
  placeholder?: string;
}) {
  return (
    <form action={path} method="get" role="search" className="relative w-full sm:max-w-xs">
      {Object.entries(keep).map(([k, v]) => (v ? <input key={k} type="hidden" name={k} value={String(v)} /> : null))}
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-navy-400" />
      <input
        type="search"
        name="q"
        defaultValue={q}
        placeholder={placeholder}
        maxLength={100}
        aria-label={placeholder}
        className="w-full rounded-lg border border-navy-200 bg-white py-2.5 pl-9 pr-9 text-sm text-navy-900 placeholder:text-navy-400 outline-none transition focus:border-brand-500 focus:ring-4 focus:ring-brand-500/15"
      />
      {q && (
        <Link href={buildHref(path, keep)} aria-label="Clear search" className="absolute right-2.5 top-1/2 -translate-y-1/2 text-navy-400 hover:text-navy-700">
          <X className="h-4 w-4" />
        </Link>
      )}
    </form>
  );
}

export function FilterChips({
  path,
  param,
  value,
  options,
  keep = {},
}: {
  path: string;
  param: string;
  value?: string;
  options: { label: string; value?: string; count?: number }[];
  keep?: Query;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((o) => {
        const active = (o.value ?? "") === (value ?? "");
        return (
          <Link
            key={o.label}
            href={buildHref(path, { ...keep, [param]: o.value })}
            aria-current={active ? "true" : undefined}
            className={`rounded-full px-3.5 py-1.5 text-sm font-medium ring-1 transition ${
              active ? "bg-navy-900 text-white ring-navy-900" : "bg-white text-navy-600 ring-navy-200 hover:bg-navy-50"
            }`}
          >
            {o.label}
            {o.count !== undefined && <span className="ml-1 opacity-60">{o.count}</span>}
          </Link>
        );
      })}
    </div>
  );
}

export function EmptyState({ title, text, resetHref }: { title: string; text?: string; resetHref?: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-navy-200 bg-navy-50/50 px-6 py-14 text-center">
      <p className="font-semibold text-navy-900">{title}</p>
      {text && <p className="mt-1 text-sm text-navy-500">{text}</p>}
      {resetHref && (
        <Link href={resetHref} className="mt-4 inline-block text-sm font-semibold text-navy-900 underline-offset-4 hover:underline">
          Clear filters
        </Link>
      )}
    </div>
  );
}
