import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import CTA from "@/components/CTA";
import { EmptyState, FilterChips, Pagination, SearchForm, parsePage } from "@/components/listing";
import { ProjectCard } from "@/components/site-cards";
import { Container, PageHero } from "@/components/ui";
import { PROJECT_PAGE_SIZE, getProjectSectors, getProjectsPage } from "@/lib/content";

export const metadata: Metadata = {
  title: "Our Work",
  description: "Client projects designed and delivered by Britech Solutions.",
};

type SP = { q?: string; sector?: string; page?: string };

export default async function OurWorkPage({ searchParams }: { searchParams: Promise<SP> }) {
  const sp = await searchParams;
  const q = sp.q?.trim().slice(0, 100) || undefined;
  const page = parsePage(sp.page);
  const sectors = await getProjectSectors();
  const sector = sectors.some((s) => s.name === sp.sector) ? sp.sector : undefined;
  const { projects, total, pages } = await getProjectsPage({ q, sector, page });
  // Search and filters only help once there are enough projects to browse.
  const showTools = Boolean(q || sector) || total > PROJECT_PAGE_SIZE;

  return (
    <>
      <PageHero
        eyebrow="Our work"
        title="Systems we’ve built for our clients"
        text="Platforms Britech has designed and delivered for organizations across Tanzania."
      />

      <section className="py-16 sm:py-20">
        <Container>
          {showTools && (
          <div className="mb-10 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            {sectors.length > 1 ? (
              <FilterChips
                path="/our-work"
                param="sector"
                value={sector}
                keep={{ q }}
                options={[{ label: "All", count: undefined }, ...sectors.map((s) => ({ label: s.name, value: s.name, count: s.count }))]}
              />
            ) : (
              <span />
            )}
            <SearchForm path="/our-work" q={q} keep={{ sector }} placeholder="Search projects" />
          </div>
          )}

          {projects.length === 0 ? (
            q || sector ? (
              <EmptyState title="No projects match your search" resetHref="/our-work" />
            ) : (
              <EmptyState title="Client projects coming soon" />
            )
          ) : (
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {projects.map((p) => (
                <ProjectCard key={p.id} project={p} />
              ))}
            </div>
          )}
          <Pagination path="/our-work" params={{ q, sector }} page={page} pages={pages} total={total} pageSize={PROJECT_PAGE_SIZE} noun="projects" />

          <div className="mt-14 grid gap-4 md:grid-cols-2">
            <div className="flex flex-col items-start justify-between gap-4 rounded-2xl border border-navy-100 bg-navy-50/60 p-6">
              <p className="text-navy-700">
                <span className="font-semibold text-navy-900">Our own products.</span> The platforms Britech builds, runs and supports itself.
              </p>
              <Link href="/products" className="inline-flex items-center gap-1 font-semibold text-navy-900 underline-offset-4 hover:underline">
                View products <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="flex flex-col items-start justify-between gap-4 rounded-2xl border border-navy-100 bg-navy-50/60 p-6">
              <p className="text-navy-700">
                <span className="font-semibold text-navy-900">Clients & partners.</span> See the organizations we work with across Tanzania.
              </p>
              <Link href="/clients" className="inline-flex items-center gap-1 font-semibold text-navy-900 underline-offset-4 hover:underline">
                View clients & partners <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </Container>
      </section>

      <CTA />
    </>
  );
}
