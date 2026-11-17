import Header from "@/components/Header";
import { SITE_URL } from "@/lib/site";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import { getSettings } from "@/lib/content";
import { company } from "@/lib/data";

// Content (partners, projects, posts, settings) is edited in the admin, so render on request.
export const dynamic = "force-dynamic";

const SITE = SITE_URL;

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const settings = await getSettings();

  // Organization details for search engines (shown in Google’s knowledge panel / rich results).
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: company.name,
    url: SITE,
    logo: `${SITE}/images/logo.png`,
    slogan: company.tagline,
    email: settings.email,
    telephone: [settings.phone1, settings.phone2].filter(Boolean),
    address: { "@type": "PostalAddress", streetAddress: settings.address, addressLocality: "Arusha", addressCountry: "TZ" },
    sameAs: [settings.linkedin, settings.twitter, settings.facebook, settings.instagram, settings.youtube].filter(Boolean),
  };

  return (
    <>
      <script
        type="application/ld+json"
        // JSON.stringify output with "<" escaped cannot break out of the script tag.
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded-lg focus:bg-navy-900 focus:px-4 focus:py-2 focus:text-white"
      >
        Skip to content
      </a>
      <Header phone={settings.phone1} announcement={{ text: settings.announcement_text, link: settings.announcement_link }} />
      <main id="main">{children}</main>
      <Footer />
      <WhatsAppButton number={settings.whatsapp} />
    </>
  );
}
