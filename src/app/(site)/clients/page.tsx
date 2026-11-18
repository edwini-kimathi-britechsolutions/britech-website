import type { Metadata } from "next";
import Image from "next/image";
import CTA from "@/components/CTA";
import { EmptyState, FilterChips, Pagination, SearchForm, parsePage } from "@/components/listing";
import { PartnerLogos } from "@/components/site-cards";
import { Container, PageHero } from "@/components/ui";
import { PARTNER_PAGE_SIZE, getPartnersPage } from "@/lib/content";
import { partners as techPartners } from "@/lib/data";

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

      {/* Technology partners (same list as the home page strip); hidden while searching or viewing clients only */}
      {!q && type !== "clients" && (
        <section className="border-t border-navy-100 bg-navy-50/50 py-16 sm:py-20">
          <Container>
            <h2 className="text-2xl font-bold tracking-tight text-navy-900 sm:text-3xl">Technology partners we build with</h2>
            <p className="mt-3 max-w-2xl text-navy-500">The technology vendors and platforms behind the systems we design, deliver and support.</p>
            <ul className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
              {techPartners.map((p) => (
                <li key={p.file} className="flex h-32 flex-col items-center justify-center gap-3 rounded-2xl border border-navy-100 bg-white p-4">
                  <Image src={`/images/partners/${p.file}.png`} alt={p.name} width={180} height={60} className="h-10 w-auto max-w-full object-contain" />
                  <span className="text-center text-xs font-medium text-navy-500">{p.name}</span>
                </li>
              ))}
            </ul>
          </Container>
        </section>
      )}
      <CTA />
    </>
  );
}
