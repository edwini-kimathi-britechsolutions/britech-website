import type { Metadata } from "next";
import CTA from "@/components/CTA";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import Icon from "@/components/Icon";
import { Reveal } from "@/components/motion";
import { Container, PageHero } from "@/components/ui";
import { industries, sectors } from "@/lib/data";

export const metadata: Metadata = {
  title: "Industries",
  description: "Sectors Britech Solutions supports with engineering, technology and business consultancy, from hospitality and real estate to government, finance and natural resources.",
};

export default function IndustriesPage() {
  return (
    <>
      <PageHero
        eyebrow="Industries"
        title="Expertise for the sectors that shape Africa"
        text="We bring engineering, technology and business expertise to enterprises, institutions and development programs across these sectors."
      />
      <section className="pt-16 sm:pt-20">
        <Container>
          <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-navy-500">Sectors we support</h2>
          <ul className="mt-5 flex flex-wrap gap-2">
            {sectors.map((s) => (
              <li key={s} className="rounded-full border border-navy-200 bg-white px-4 py-2 text-sm font-medium text-navy-700">
                {s}
              </li>
            ))}
          </ul>
        </Container>
      </section>
      <section className="py-12 sm:py-16">
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
                className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg bg-brand-500 px-5 py-3 font-semibold text-white transition hover:bg-brand-600"
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
