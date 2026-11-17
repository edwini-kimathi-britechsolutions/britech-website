import type { Metadata } from "next";
import CTA from "@/components/CTA";
import { EmptyState, FilterChips, Pagination, SearchForm, parsePage } from "@/components/listing";
import { PartnerLogos } from "@/components/site-cards";
import { Container, PageHero } from "@/components/ui";
import { PARTNER_PAGE_SIZE, getPartnersPage } from "@/lib/content";

export const metadata: Metadata = {
  title: "Clients & Partners",
  description: "Organizations across Tanzania and East Africa that work with Britech Solutions.",
};

type SP = { q?: string; type?: string; page?: string };

export default async function ClientsPage({ searchParams }: { searchParams: Promise<SP> }) {
  const sp = await searchParams;
  const q = sp.q?.trim().slice(0, 100) || undefined;
  const kind = sp.type === "clients" ? "CLIENT" : sp.type === "partners" ? "PARTNER" : undefined;
  const page = parsePage(sp.page);
  const { partners, total, pages } = await getPartnersPage({ q, kind, page });
  const type = kind ? sp.type : undefined;

  return (
    <>
      <PageHero
        eyebrow="Clients & partners"
        title="Organizations we work with"
        text="Public institutions, conservation bodies, development organizations and businesses across Tanzania and East Africa."
      />
      <section className="py-16 sm:py-20">
        <Container>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <FilterChips
              path="/clients"
              param="type"
              value={type}
              keep={{ q }}
              options={[
                { label: "All" },
                { label: "Clients", value: "clients" },
                { label: "Partners", value: "partners" },
              ]}
            />
            <SearchForm path="/clients" q={q} keep={{ type }} placeholder="Search organizations" />
          </div>
          <div className="mt-10">
            {partners.length === 0 ? (
              <EmptyState title="No organizations match your search" resetHref="/clients" />
            ) : (
              <PartnerLogos partners={partners} showNames />
            )}
          </div>
          <Pagination path="/clients" params={{ q, type }} page={page} pages={pages} total={total} pageSize={PARTNER_PAGE_SIZE} noun="organizations" />
        </Container>
      </section>
      <CTA />
    </>
  );
}
