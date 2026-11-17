import type { Metadata } from "next";
import { ArrowUpRight } from "lucide-react";
import CTA from "@/components/CTA";
import ProductPanel from "@/components/ProductPanel";
import { EmptyState, Pagination, parsePage } from "@/components/listing";
import { ButtonLink, Container, PageHero } from "@/components/ui";
import { PRODUCT_PAGE_SIZE, getProducts } from "@/lib/content";
import { contactForProduct } from "@/lib/data";

export const metadata: Metadata = {
  title: "Products",
  description: "Platforms built and run by Britech Solutions, including RASIFlow, Resulynx, Trans-iT and Njiwa.",
};

export default async function ProductsPage({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  const page = parsePage((await searchParams).page);
  const { products, total, pages } = await getProducts({ page });

  return (
    <>
      <PageHero
        eyebrow="Products"
        title="Our flagship products & systems"
        text="Platforms designed, built and supported by Britech to help organizations run operations, track results and reach people."
      />
      <section className="py-20 sm:py-24">
        <Container>
          {total === 0 ? (
            <EmptyState title="Products coming soon" />
          ) : (
            <div className="space-y-10">
              {products.map((p, i) => {
                const highlightCount = p.highlights.split("\n").filter(Boolean).length;
                return (
                  <div
                    key={p.id}
                    id={p.slug}
                    className="grid scroll-mt-28 items-center gap-10 rounded-3xl border border-navy-100 bg-white p-6 shadow-lg shadow-navy-900/5 sm:p-10 lg:grid-cols-2"
                  >
                    <div className={i % 2 ? "lg:order-2" : ""}>
                      <span className="text-sm font-semibold uppercase tracking-wider text-navy-500">{p.tagline}</span>
                      <h2 className="mt-2 text-3xl font-bold text-navy-900 sm:text-4xl">{p.name}</h2>
                      <p className="mt-4 text-lg leading-relaxed text-navy-500">{p.description}</p>
                      <div className="mt-8 flex flex-wrap items-center gap-4">
                        <ButtonLink href={contactForProduct(p)}>Request a Demo</ButtonLink>
                        {p.url && (
                          <a href={p.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 font-semibold text-navy-900 underline-offset-4 hover:underline">
                            Visit {p.name} <ArrowUpRight className="h-4 w-4" />
                          </a>
                        )}
                      </div>
                      {highlightCount === 0 && <p className="mt-4 text-sm text-navy-400">More details coming soon.</p>}
                    </div>
                    <ProductPanel product={p} />
                  </div>
                );
              })}
            </div>
          )}
          <Pagination path="/products" params={{}} page={page} pages={pages} total={total} pageSize={PRODUCT_PAGE_SIZE} noun="products" />
        </Container>
      </section>
      <CTA />
    </>
  );
}
