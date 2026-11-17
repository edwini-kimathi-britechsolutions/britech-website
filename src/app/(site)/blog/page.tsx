import type { Metadata } from "next";
import Link from "next/link";
import { Newspaper } from "lucide-react";
import { EmptyState, Pagination, SearchForm, parsePage } from "@/components/listing";
import CTA from "@/components/CTA";
import { FeaturedPost, PostCard } from "@/components/site-cards";
import { Container, PageHero } from "@/components/ui";
import { PAGE_SIZE, getPostCategories, getPublishedPosts } from "@/lib/content";

export const metadata: Metadata = {
  title: "Blog",
  description: "News, insights and practical guidance on software, data, AI and cybersecurity from the Britech Solutions team.",
};

export default async function BlogPage({ searchParams }: { searchParams: Promise<{ category?: string; page?: string; q?: string }> }) {
  const sp = await searchParams;
  const page = parsePage(sp.page);
  const q = sp.q?.trim().slice(0, 100) || undefined;
  const categories = await getPostCategories();
  const category = categories.some((c) => c.name === sp.category) ? sp.category : undefined;
  const { posts, pages, total } = await getPublishedPosts({ category, q, page });

  const showFeatured = page === 1 && !category && !q && posts.length > 0;
  const featured = showFeatured ? (posts.find((p) => p.featured) ?? posts[0]) : null;
  const rest = featured ? posts.filter((p) => p.id !== featured.id) : posts;

  const href = (p: number, c = category) => {
    const qs = new URLSearchParams();
    if (c) qs.set("category", c);
    if (q) qs.set("q", q);
    if (p > 1) qs.set("page", String(p));
    const s = qs.toString();
    return s ? `/blog?${s}` : "/blog";
  };

  return (
    <>
      <PageHero
        eyebrow="Blog"
        title="Insights from the Britech team"
        text="News, lessons from our projects, and practical guidance on software, data, AI and cybersecurity."
      />

      <section className="py-16 sm:py-20">
        <Container>
          <div className="mb-10 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          {categories.length > 1 ? (
            <nav aria-label="Categories" className="flex flex-wrap gap-2">
              <Link
                href={href(1, undefined)}
                className={`rounded-full px-4 py-2 text-sm font-medium ring-1 transition ${!category ? "bg-navy-900 text-white ring-navy-900" : "bg-white text-navy-600 ring-navy-200 hover:bg-navy-50"}`}
              >
                All
              </Link>
              {categories.map((c) => (
                <Link
                  key={c.name}
                  href={href(1, c.name)}
                  className={`rounded-full px-4 py-2 text-sm font-medium ring-1 transition ${category === c.name ? "bg-navy-900 text-white ring-navy-900" : "bg-white text-navy-600 ring-navy-200 hover:bg-navy-50"}`}
                >
                  {c.name} <span className="opacity-60">{c.count}</span>
                </Link>
              ))}
            </nav>
          ) : (
            <span />
          )}
          {total > 0 || q ? <SearchForm path="/blog" q={q} keep={{ category }} placeholder="Search articles" /> : null}
          </div>

          {total === 0 && (q || category) ? (
            <EmptyState title="No articles match your search" resetHref="/blog" />
          ) : total === 0 ? (
            <div className="rounded-3xl border border-dashed border-navy-200 bg-navy-50/50 px-6 py-20 text-center">
              <Newspaper className="mx-auto h-10 w-10 text-navy-300" />
              <h2 className="mt-4 text-xl font-semibold text-navy-900">No articles yet</h2>
              <p className="mt-2 text-navy-500">Our first articles are on the way. Check back soon.</p>
            </div>
          ) : (
            <>
              {featured && (
                <div className="mb-10">
                  <FeaturedPost post={featured} />
                </div>
              )}
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {rest.map((p) => (
                  <PostCard key={p.id} post={p} />
                ))}
              </div>
              <Pagination path="/blog" params={{ category, q }} page={page} pages={pages} total={total} pageSize={PAGE_SIZE} noun="articles" />
            </>
          )}
        </Container>
      </section>
      <CTA />
    </>
  );
}
