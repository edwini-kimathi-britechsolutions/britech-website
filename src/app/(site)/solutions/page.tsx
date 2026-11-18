import type { Metadata } from "next";
import CTA from "@/components/CTA";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import Icon from "@/components/Icon";
import { Container, PageHero } from "@/components/ui";
import { practices, servicesIn } from "@/lib/data";

export const metadata: Metadata = {
  title: "Solutions",
  description:
    "Engineering consultancy, digital transformation and technology, and business and management consultancy from Britech Solutions.",
};

export default function SolutionsPage() {
  return (
    <>
      <PageHero
        eyebrow="Solutions"
        title="One Britech. Three practices."
        text="Engineering consultancy, digital transformation and business advisory, integrated to help you design, modernize and operate the physical, digital and organizational systems your performance depends on."
      />
      {practices.map((pr, i) => {
        const list = servicesIn(pr.slug);
        return (
          <section key={pr.slug} id={pr.slug} className={`scroll-mt-24 py-16 sm:py-20 ${i % 2 ? "bg-navy-50/50" : ""}`}>
            <Container>
              <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
                <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-navy-900 text-white">
                  <Icon name={pr.icon} className="h-7 w-7" />
                </span>
                <div className="max-w-3xl">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-navy-500">Practice {i + 1}</p>
                  <h2 className="mt-2 text-3xl font-bold tracking-tight text-navy-900">{pr.title}</h2>
                  <p className="mt-3 text-lg leading-relaxed text-navy-500">{pr.short}</p>
                </div>
              </div>
              {list.length === 1 ? (
                <>
                  <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                    {list[0].features.map((f) => (
                      <div key={f.title} className="rounded-2xl border border-navy-100 bg-white p-6">
                        <h3 className="font-semibold text-navy-900">{f.title}</h3>
                        <p className="mt-2 text-sm leading-relaxed text-navy-500">{f.text}</p>
                      </div>
                    ))}
                  </div>
                  <Link
                    href={`/solutions/${list[0].slug}`}
                    className="mt-8 inline-flex items-center gap-1 font-semibold text-navy-900 underline-offset-4 hover:underline"
                  >
                    More about {list[0].title} <ArrowRight className="h-4 w-4" />
                  </Link>
                </>
              ) : (
              <div className="mt-10 grid gap-5 md:grid-cols-2">
                {list.map((s) => (
                  <Link
                    key={s.slug}
                    href={`/solutions/${s.slug}`}
                    className="group flex gap-6 rounded-2xl border border-navy-100 bg-white p-7 transition hover:-translate-y-1 hover:border-navy-300 hover:shadow-xl hover:shadow-navy-900/5"
                  >
                    <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-navy-50 text-navy-900">
                      <Icon name={s.icon} className="h-6 w-6" />
                    </span>
                    <div>
                      <h3 className="text-xl font-semibold text-navy-900">{s.title}</h3>
                      <p className="mt-2 leading-relaxed text-navy-500">{s.short}</p>
                      <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-navy-900">
                        Learn more <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
              )}
            </Container>
          </section>
        );
      })}
      <CTA />
    </>
  );
}
