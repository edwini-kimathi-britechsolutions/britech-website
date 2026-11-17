import type { Metadata } from "next";
import CTA from "@/components/CTA";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import Icon from "@/components/Icon";
import { Container, PageHero } from "@/components/ui";
import { services } from "@/lib/data";

export const metadata: Metadata = {
  title: "Solutions",
  description: "Software, AI, ERP, business intelligence, cybersecurity, consulting and training services from Britech Solutions.",
};

export default function SolutionsPage() {
  return (
    <>
      <PageHero
        eyebrow="Solutions"
        title="Technology that moves you forward"
        text="From strategy to deployment and long-term support, we deliver end-to-end digital capabilities that are scalable, secure, and tailored to your needs."
      />
      <section className="py-20 sm:py-24">
        <Container className="grid gap-6 md:grid-cols-2">
          {services.map((s) => (
            <Link
              key={s.slug}
              href={`/solutions/${s.slug}`}
              className="group flex gap-6 rounded-2xl border border-navy-100 bg-white p-7 transition hover:-translate-y-1 hover:border-mint-300 hover:shadow-xl hover:shadow-navy-900/5"
            >
              <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-navy-900 text-mint-400 transition group-hover:bg-mint-500 group-hover:text-navy-950">
                <Icon name={s.icon} className="h-7 w-7" />
              </span>
              <div>
                <h2 className="text-xl font-semibold text-navy-900">{s.title}</h2>
                <p className="mt-2 leading-relaxed text-navy-500">{s.short}</p>
                <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-mint-700">
                  Learn more <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
                </span>
              </div>
            </Link>
          ))}
        </Container>
      </section>
      <CTA />
    </>
  );
}
