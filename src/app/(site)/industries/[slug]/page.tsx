import type { Metadata } from "next";
import CTA from "@/components/CTA";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AlertCircle, ArrowLeft, ArrowRight, CheckCircle2 } from "lucide-react";
import Icon from "@/components/Icon";
import { Container, Eyebrow } from "@/components/ui";
import { industries, services } from "@/lib/data";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return industries.map((i) => ({ slug: i.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const ind = industries.find((x) => x.slug === slug);
  return ind ? { title: ind.title, description: ind.short } : {};
}

export default async function IndustryPage({ params }: Props) {
  const { slug } = await params;
  const ind = industries.find((i) => i.slug === slug);
  if (!ind) notFound();
  const related = ind.related.map((r) => services.find((s) => s.slug === r)).filter((s) => s !== undefined);

  return (
    <>
      <section className="relative overflow-hidden border-b border-navy-100 bg-navy-50/50">
        <div className="bg-grid pointer-events-none absolute inset-0 [mask-image:linear-gradient(to_left,black,transparent_70%)]" />
        <Container className="relative py-16 sm:py-20">
          <Link href="/industries" className="inline-flex items-center gap-1 text-sm font-medium text-navy-500 hover:text-navy-900">
            <ArrowLeft className="h-4 w-4" /> All industries
          </Link>
          <div className="mt-6 flex animate-fade-up flex-col gap-6 lg:flex-row lg:items-center">
            <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-navy-900 text-mint-400 shadow-xl">
              <Icon name={ind.icon} className="h-8 w-8" />
            </span>
            <div>
              <Eyebrow>Industry</Eyebrow>
              <h1 className="mt-3 text-4xl font-bold tracking-tight text-navy-900 sm:text-5xl">{ind.title}</h1>
            </div>
          </div>
          <p className="mt-6 max-w-3xl text-lg leading-relaxed text-navy-600">{ind.intro}</p>
        </Container>
      </section>

      <section className="py-16 sm:py-20">
        <Container className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-3xl border border-navy-100 p-8">
            <h2 className="text-2xl font-bold text-navy-900">Challenges we address</h2>
            <ul className="mt-6 space-y-4">
              {ind.challenges.map((c) => (
                <li key={c} className="flex gap-3 text-navy-600">
                  <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-navy-300" /> {c}
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-3xl bg-navy-900 p-8 text-white">
            <h2 className="text-2xl font-bold">How Britech helps</h2>
            <ul className="mt-6 space-y-4">
              {ind.help.map((h) => (
                <li key={h} className="flex gap-3 text-navy-100">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-mint-400" /> {h}
                </li>
              ))}
            </ul>
          </div>
        </Container>
      </section>

      <section className="border-t border-navy-100 py-16 sm:py-20">
        <Container>
          <h2 className="text-2xl font-bold text-navy-900">Related solutions</h2>
          <div className="mt-8 grid gap-5 md:grid-cols-3">
            {related.map((s) => (
              <Link
                key={s.slug}
                href={`/solutions/${s.slug}`}
                className="group rounded-2xl border border-navy-100 p-6 transition hover:border-mint-300 hover:shadow-lg"
              >
                <Icon name={s.icon} className="h-6 w-6 text-mint-700" />
                <h3 className="mt-4 font-semibold text-navy-900">{s.title}</h3>
                <span className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-mint-700">
                  Learn more <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
                </span>
              </Link>
            ))}
          </div>
        </Container>
      </section>

      <CTA />
    </>
  );
}
