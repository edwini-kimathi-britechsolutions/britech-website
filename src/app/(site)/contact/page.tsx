import type { Metadata } from "next";
import { Mail, MapPin, Phone } from "lucide-react";
import ContactForm from "@/components/ContactForm";
import { Container, PageHero } from "@/components/ui";
import { isInquiryService, telHref } from "@/lib/data";
import { getSettings } from "@/lib/content";

export const metadata: Metadata = {
  title: "Contact",
  description: "Get in touch with Britech Solutions in Arusha, Tanzania.",
};

export default async function ContactPage({ searchParams }: { searchParams: Promise<{ service?: string; message?: string }> }) {
  const [settings, sp] = await Promise.all([getSettings(), searchParams]);
  const defaultService = isInquiryService(sp.service) ? sp.service : "";
  const defaultMessage = (sp.message ?? "").slice(0, 300);
  const phones = [settings.phone1, settings.phone2].filter(Boolean);
  const cards = [
    { Icon: MapPin, title: "Visit us", lines: [{ text: settings.address }] },
    { Icon: Mail, title: "Email us", lines: [{ text: settings.email, href: `mailto:${settings.email}` }] },
    { Icon: Phone, title: "Call us", lines: phones.map((p) => ({ text: p, href: telHref(p) })) },
  ];

  return (
    <>
      <PageHero
        eyebrow="Contact"
        title="Let’s build something brilliant"
        text="Tell us about your goals and our team will help you find the right solution, from a quick consultation to full-scale delivery."
      />
      <section className="py-20 sm:py-24">
        <Container className="grid gap-10 lg:grid-cols-5">
          <div className="space-y-4 lg:col-span-2">
            {cards.map(({ Icon, title, lines }) => (
              <div key={title} className="flex gap-4 rounded-2xl border border-navy-100 p-5">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-navy-50 text-navy-900">
                  <Icon className="h-5 w-5" />
                </span>
                <div className="min-w-0">
                  <h2 className="font-semibold text-navy-900">{title}</h2>
                  {lines.map((l) =>
                    "href" in l && l.href ? (
                      <a key={l.text} href={l.href} className="block break-words text-navy-500 hover:text-mint-600">
                        {l.text}
                      </a>
                    ) : (
                      <p key={l.text} className="text-navy-500">
                        {l.text}
                      </p>
                    )
                  )}
                </div>
              </div>
            ))}
            <div className="overflow-hidden rounded-2xl border border-navy-100">
              <iframe
                title="Britech Solutions location"
                src={`https://www.google.com/maps?q=${encodeURIComponent(settings.address || "Arusha, Tanzania")}&output=embed`}
                className="h-64 w-full"
                loading="lazy"
              />
            </div>
          </div>
          <div id="form" className="scroll-mt-28 rounded-3xl border border-navy-100 bg-white p-6 shadow-xl shadow-navy-900/5 sm:p-10 lg:col-span-3">
            <h2 className="text-2xl font-bold text-navy-900">Get in Touch</h2>
            <p className="mb-8 mt-2 text-navy-500">Fill in the form and we’ll get back to you shortly.</p>
            <ContactForm renderedAt={Date.now()} defaultService={defaultService} defaultMessage={defaultMessage} />
          </div>
        </Container>
      </section>
    </>
  );
}
