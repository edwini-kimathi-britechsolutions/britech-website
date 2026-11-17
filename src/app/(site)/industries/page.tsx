import type { Metadata } from "next";
import CTA from "@/components/CTA";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import Icon from "@/components/Icon";
import { Reveal } from "@/components/motion";
import { Container, PageHero } from "@/components/ui";
import { industries } from "@/lib/data";

export const metadata: Metadata = {
  title: "Industries",
  description: "How Britech Solutions supports government, NGOs, agriculture, finance, healthcare, education and conservation.",
};

export default function IndustriesPage() {
  return (
    <>
      <PageHero
        eyebrow="Industries"
        title="Technology for the sectors that shape Africa"
        text="We bring software, data, and security expertise to institutions in agriculture, health, education, conservation, finance, and governance."
      />
      <section className="py-20 sm:py-24">
        <Container className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {industries.map((ind, i) => (
            <Reveal key={ind.slug} delay={(i % 3) * 80}>
              <Link
                href={`/industries/${ind.slug}`}
                className="group flex h-full flex-col rounded-2xl border border-navy-100 bg-white p-7 transition hover:border-navy-300 hover:shadow-lg hover:shadow-navy-900/5"
              >
                <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-navy-50 text-navy-900">
                  <Icon name={ind.icon} className="h-6 w-6" />
                </span>
                <h2 className="mt-5 text-lg font-semibold text-navy-900">{ind.title}</h2>
                <p className="mt-2 flex-1 leading-relaxed text-navy-500">{ind.short}</p>
                <span className="mt-5 inline-flex items-center gap-1 text-sm font-semibold text-navy-900">
                  Learn more <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
                </span>
              </Link>
            </Reveal>
          ))}
          <Reveal delay={80} className="lg:col-span-2">
            <div className="flex h-full flex-col justify-between gap-6 rounded-2xl bg-navy-900 p-7 text-white sm:flex-row sm:items-center">
              <div>
                <h2 className="text-lg font-semibold">Don’t see your sector?</h2>
                <p className="mt-2 max-w-md text-navy-200">
                  Our solutions adapt to any organization. Tell us about your challenges and we’ll show you what’s possible.
                </p>
              </div>
              <Link
                href="/contact"
                className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg bg-mint-500 px-5 py-3 font-semibold text-navy-950 transition hover:bg-mint-400"
              >
                Talk to us <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </Reveal>
        </Container>
      </section>
      <CTA />
    </>
  );
}
