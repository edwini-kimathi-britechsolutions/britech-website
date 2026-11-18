import type { Metadata } from "next";
import CTA from "@/components/CTA";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, CheckCircle2, FileCheck2 } from "lucide-react";
import Icon from "@/components/Icon";
import { Container, Eyebrow } from "@/components/ui";
import { contactForSolution, practices, serviceProcess, services } from "@/lib/data";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return services.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const s = services.find((x) => x.slug === slug);
  return s ? { title: s.title, description: s.short } : {};
}

export default async function ServicePage({ params }: Props) {
  const { slug } = await params;
  const service = services.find((s) => s.slug === slug);
  if (!service) notFound();
  // Same practice first, then the rest
  const others = [
    ...services.filter((s) => s.slug !== slug && s.practice === service.practice),
    ...services.filter((s) => s.slug !== slug && s.practice !== service.practice),
  ].slice(0, 3);
  const practice = practices.find((p) => p.slug === service.practice);
  const delivery = serviceProcess[slug];

  return (
    <>
      <section className="relative overflow-hidden border-b border-navy-100 bg-navy-50/50">
        <div className="bg-grid pointer-events-none absolute inset-0 [mask-image:linear-gradient(to_left,black,transparent_70%)]" />
        <Container className="relative py-16 sm:py-20">
          <Link href="/solutions" className="inline-flex items-center gap-1 text-sm font-medium text-navy-500 hover:text-navy-900">
            <ArrowLeft className="h-4 w-4" /> All solutions
          </Link>
          <div className="mt-6 flex animate-fade-up flex-col gap-6 lg:flex-row lg:items-center">
            <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-navy-900 text-white shadow-xl">
              <Icon name={service.icon} className="h-8 w-8" />
            </span>
            <div>
              <Eyebrow>{practice?.title ?? "Solution"}</Eyebrow>
              <h1 className="mt-3 text-4xl font-bold tracking-tight text-navy-900 sm:text-5xl">{service.title}</h1>
            </div>
          </div>
          <p className="mt-6 max-w-3xl text-xl font-medium text-navy-600">{service.headline}</p>
        </Container>
      </section>

      <section className="py-16 sm:py-20">
        <Container className="grid gap-12 lg:grid-cols-3">
          <div className="space-y-5 text-lg leading-relaxed text-navy-600 lg:col-span-2">
            {service.intro.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>
          <aside className="h-fit rounded-2xl bg-navy-900 p-7 text-white">
            <h2 className="text-lg font-semibold">Talk to an expert</h2>
            <p className="mt-2 text-sm text-navy-200">Tell us about your project and we’ll get back to you shortly.</p>
            <Link
              href={contactForSolution(service.slug)}
              className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-brand-500 px-4 py-3 font-semibold text-white transition hover:bg-brand-600"
            >
              Schedule a Consultation <ArrowRight className="h-4 w-4" />
            </Link>
          </aside>
        </Container>
      </section>

      <section className="border-y border-navy-100 bg-navy-50/40 py-16 sm:py-20">
        <Container>
          <h2 className="text-3xl font-bold tracking-tight text-navy-900">What we deliver</h2>
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {service.features.map((f) => (
              <div key={f.title} className="rounded-2xl border border-navy-100 bg-white p-6">
                <CheckCircle2 className="h-6 w-6 text-navy-900" />
                <h3 className="mt-4 font-semibold text-navy-900">{f.title}</h3>
                <p className="mt-2 text-navy-500">{f.text}</p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {delivery && (
        <section className="py-16 sm:py-20">
          <Container className="grid gap-12 lg:grid-cols-5">
            <div className="lg:col-span-3">
              <h2 className="text-3xl font-bold tracking-tight text-navy-900">Our approach</h2>
              <ol className="mt-8 space-y-4">
                {delivery.approach.map((step, i) => (
                  <li key={step} className="flex items-center gap-4 rounded-2xl border border-navy-100 p-5">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-navy-900 text-sm font-semibold text-white">
                      {i + 1}
                    </span>
                    <span className="font-medium text-navy-800">{step}</span>
                  </li>
                ))}
              </ol>
            </div>
            <div className="lg:col-span-2">
              <h2 className="text-3xl font-bold tracking-tight text-navy-900">What you receive</h2>
              <ul className="mt-8 space-y-3 rounded-2xl bg-navy-50/70 p-6">
                {delivery.deliverables.map((d) => (
                  <li key={d} className="flex items-center gap-3 text-navy-700">
                    <FileCheck2 className="h-5 w-5 shrink-0 text-navy-900" /> {d}
                  </li>
                ))}
              </ul>
            </div>
          </Container>
        </section>
      )}

      <section className={`py-16 sm:py-20 ${delivery ? "border-t border-navy-100" : ""}`}>
        <Container>
          <h2 className="text-2xl font-bold text-navy-900">Explore other solutions</h2>
          <div className="mt-8 grid gap-5 md:grid-cols-3">
            {others.map((s) => (
              <Link
                key={s.slug}
                href={`/solutions/${s.slug}`}
                className="group rounded-2xl border border-navy-100 p-6 transition hover:border-navy-300 hover:shadow-lg"
              >
                <Icon name={s.icon} className="h-6 w-6 text-navy-900" />
                <h3 className="mt-4 font-semibold text-navy-900">{s.title}</h3>
                <span className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-navy-900">
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
