/**
 * Seeds partners, projects and contact settings. Safe to re-run: only adds missing items, never overwrites admin edits.
 * Content comes from Britech and the projects' own public websites — no invented figures.
 *   npm run db:seed
 */
import { PrismaClient, type PartnerKind } from "@prisma/client";

const db = new PrismaClient();

// Order follows Britech's "Our Satisfied Customers" slide. `active: false` = needs confirming before it is shown.
const partners: { name: string; logo: string; url: string | null; kind: PartnerKind; active?: boolean }[] = [
  { name: "USAID", logo: "/images/clients/usaid.png", url: "https://www.usaid.gov", kind: "CLIENT" },
  { name: "UN Women", logo: "/images/clients/unwomen.png", url: "https://www.unwomen.org", kind: "CLIENT" },
  { name: "Rikolto", logo: "/images/clients/rikolto.png", url: "https://www.rikolto.org", kind: "CLIENT" },
  { name: "TAHA – Tanzania Horticultural Association", logo: "/images/clients/taha.png", url: "https://www.taha.or.tz", kind: "CLIENT" },
  { name: "Tanzania Wildlife Research Institute (TAWIRI)", logo: "/images/clients/tawiri.png", url: "https://www.tawiri.or.tz", kind: "BOTH" },
  { name: "Ngorongoro Conservation Area Authority", logo: "/images/clients/ngorongoro.png", url: "https://www.ngorongorocrater.org", kind: "BOTH" },
  { name: "Mwanga Hakika Bank", logo: "/images/clients/mwanga.png", url: null, kind: "CLIENT" },
  { name: "CSC", logo: "/images/clients/csc.png", url: null, kind: "CLIENT", active: false },
  { name: "Tanzania Atomic Energy Commission (TAEC)", logo: "/images/clients/taec.png", url: "https://www.taec.go.tz", kind: "CLIENT" },
  { name: "Match Maker Associates", logo: "/images/clients/matchmaker.png", url: null, kind: "CLIENT" },
  { name: "TEMDO", logo: "/images/clients/temdo.png", url: null, kind: "CLIENT" },
  { name: "Hortanzia Ltd", logo: "/images/clients/hortanzia.png", url: null, kind: "CLIENT" },
  { name: "EcoValley Advisers", logo: "/images/clients/ecovalley.png", url: null, kind: "CLIENT" },
  { name: "SNV", logo: "/images/clients/snv.png", url: "https://www.snv.org", kind: "CLIENT" },
  { name: "Institute of Accountancy Arusha (IAA)", logo: "/images/clients/iaa.png", url: "https://www.iaa.ac.tz", kind: "CLIENT" },
  { name: "Silverlands Tanzania", logo: "/images/clients/silverlands.png", url: null, kind: "BOTH" },
  { name: "East African Business Council (EABC)", logo: "/images/clients/eabc.png", url: "https://www.eabc-online.com", kind: "BOTH" },
  { name: "TRIAS Tanzania", logo: "/images/clients/trias.png", url: "https://www.trias.ngo", kind: "CLIENT" },
  { name: "Pastoral Women's Council", logo: "/images/clients/pwc.png", url: "https://pastoralwomenscouncil.org", kind: "BOTH" },
  { name: "Selcom", logo: "/images/clients/selcom.png", url: "https://www.selcom.net", kind: "PARTNER" },
];

const projects = [
  {
    slug: "silvertrack",
    name: "SilverTrack",
    client: "Silverlands Tanzania",
    tagline: "Poultry health monitoring system",
    sector: "Agriculture",
    url: "https://silvertrack.co.tz",
    logo: "/images/clients/silvertrack.png",
    description:
      "SilverTrack is the Tanzania DVS Poultry Health System, a poultry health monitoring platform built for Silverlands Tanzania. Silverlands commenced day-old-chick and poultry feed production in 2014 to supply commercial and small-scale chicken farmers across Tanzania.",
    highlights: ["Poultry health monitoring", "Built for Silverlands Tanzania", "Supports commercial and small-scale chicken farmers"],
    isProduct: false, // client project
  },
  {
    slug: "njiwa",
    name: "Njiwa",
    client: null,
    tagline: "Bulk SMS platform",
    sector: "Communications",
    url: "https://njiwa.co.tz",
    logo: "/images/clients/njiwa.png",
    description: "Njiwa is Britech Solutions’ bulk SMS platform for reaching customers, members and communities by text message.",
    highlights: ["Bulk SMS messaging"],
    isProduct: true,
  },
  {
    slug: "rasiflow",
    name: "RASIFlow",
    client: null,
    tagline: "Enterprise HR, Finance & Operations platform",
    sector: "NGOs & Organizations",
    url: "https://rasiflow.co.tz",
    logo: "/images/clients/rasiflow.png",
    description:
      "RASIFlow digitizes HR, leave, finance, imprest, fleet and payroll management into one transparent, role-based administrative platform for NGOs and organizations in Tanzania.",
    highlights: ["HR & leave management", "Finance & imprest", "Fleet management", "Payroll", "Role-based controls and workflows"],
    isProduct: true,
  },
  {
    slug: "resulynx",
    name: "Resulynx",
    client: null,
    tagline: "Monitoring, Evaluation, Learning & Results Management",
    sector: "Development",
    url: "https://www.resulynx.com",
    logo: "/images/clients/resulynx.png",
    description:
      "Resulynx connects Theory of Change, logframes, indicators, field data, evidence, dashboards, learning and adaptive management in one results-management platform.",
    highlights: ["Theory of Change & logframes", "Indicators & field data", "Evidence & dashboards", "Learning & adaptive management"],
    isProduct: true,
  },
  {
    slug: "trans-it",
    name: "Trans-iT",
    client: null,
    tagline: "Fleet & logistics management platform",
    sector: "Logistics",
    url: "https://trans-it.co.tz",
    logo: "/images/clients/transit.png",
    description: "Trans-iT is a fleet and logistics management platform built by Britech Solutions.",
    highlights: ["Fleet management", "Logistics operations"],
    isProduct: true,
  },
];

const settings: Record<string, string> = {
  phone1: "+255 795 005 903",
  phone2: "+255 763 981 298",
  email: "info@britechsolutions.co.tz",
  address: "25 Mallyse Street, Arusha, Tanzania",
};

async function main() {
  for (const [i, p] of partners.entries()) {
    const existing = await db.partner.findFirst({ where: { name: p.name } });
    const { active, ...rest } = p;
    const data = { ...rest, sortOrder: i };
    // Visibility is only set on first insert, so choices made in the admin are kept.
    // Create-only: never overwrite logos edited in the admin.
    if (!existing) await db.partner.create({ data: { ...data, active: active ?? true } });
  }

  for (const [i, p] of projects.entries()) {
    const data = { ...p, highlights: p.highlights.join("\n"), sortOrder: i };
    // Create-only: never overwrite content edited in the admin.
    await db.project.upsert({ where: { slug: p.slug }, update: {}, create: data });
  }

  for (const [key, value] of Object.entries(settings)) {
    // Don't overwrite values already edited in the admin.
    await db.setting.upsert({ where: { key }, update: {}, create: { key, value } });
  }

  console.log(`Seeded ${partners.length} partners, ${projects.length} projects, ${Object.keys(settings).length} settings.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
