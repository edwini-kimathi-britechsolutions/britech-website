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
  description: "Platforms and projects delivered by Britech Solutions.",
};

type SP = { q?: string; sector?: string; page?: string };

export default async function OurWorkPage({ searchParams }: { searchParams: Promise<SP> }) {
  const sp = await searchParams;
  const q = sp.q?.trim().slice(0, 100) || undefined;
  const page = parsePage(sp.page);
  const sectors = await getProjectSectors();
  const sector = sectors.some((s) => s.name === sp.sector) ? sp.sector : undefined;
  const { projects, total, pages } = await getProjectsPage({ q, sector, page });

  return (
    <>
      <PageHero
        eyebrow="Our work"
        title="Platforms we’ve built for our clients and ourselves"
        text="From poultry health monitoring to results management, enterprise operations and messaging — systems Britech has designed and delivered."
      />

      <section className="py-16 sm:py-20">
        <Container>
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
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

          {projects.length === 0 ? (
            <div className="mt-10">
              <EmptyState title="No projects match your search" resetHref="/our-work" />
            </div>
          ) : (
            <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {projects.map((p) => (
                <ProjectCard key={p.id} project={p} />
              ))}
            </div>
          )}
          <Pagination path="/our-work" params={{ q, sector }} page={page} pages={pages} total={total} pageSize={PROJECT_PAGE_SIZE} noun="projects" />

          <div className="mt-14 flex flex-col items-start justify-between gap-4 rounded-2xl border border-navy-100 bg-navy-50/60 p-6 sm:flex-row sm:items-center">
            <p className="text-navy-700">
              <span className="font-semibold text-navy-900">Clients & partners.</span> See the organizations we work with across Tanzania.
            </p>
            <Link href="/clients" className="inline-flex items-center gap-1 font-semibold text-mint-700 hover:text-mint-600">
              View clients & partners <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </Container>
      </section>

      <CTA />
    </>
  );
}
