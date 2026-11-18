import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Award, Eye, Globe, Heart, Phone, Quote, Target } from "lucide-react";
import CTA from "@/components/CTA";
import Hero from "@/components/Hero";
import Icon from "@/components/Icon";
import { CountUp, Reveal } from "@/components/motion";
import { PartnerLogos, PostCard } from "@/components/site-cards";
import { ButtonLink, Container, PartnerMarquee, SectionHeading } from "@/components/ui";
import { getHeroLogos, getLatestPosts, getPartnerPreview, getSettings, getTestimonials } from "@/lib/content";
import { contactHref, engagementProcess, industries, practices, sectors, servicesIn, stats, telHref, values } from "@/lib/data";

export default async function Home() {
  const [{ partners, total: partnerTotal }, heroLogos, testimonials, posts, settings] = await Promise.all([
    getPartnerPreview(15),
    getHeroLogos(5),
    getTestimonials(6),
    getLatestPosts(3),
    getSettings(),
  ]);

  return (
    <>
      <Hero logos={heroLogos} />

      {/* STATS */}
      <section className="border-b border-navy-100 bg-white">
        <Container className="grid grid-cols-2 gap-y-8 py-12 lg:grid-cols-4">
          {stats.map((s, i) => (
            <div key={s.label} className={`px-2 ${i > 0 ? "lg:border-l lg:border-navy-100 lg:pl-8" : ""}`}>
              <CountUp value={s.value} className="block text-4xl font-bold tracking-tight text-navy-900" />
              <p className="mt-1 text-navy-500">{s.label}</p>
            </div>
          ))}
        </Container>
      </section>

      {/* CLIENTS & PARTNERS */}
      {partners.length > 0 && (
        <section className="py-20 sm:py-24">
          <Container>
            <div className="grid items-end gap-6 lg:grid-cols-2">
              <SectionHeading center={false} eyebrow="Trusted by" title="Clients & partners across Tanzania" />
              <p className="text-lg text-navy-500 lg:pb-2">
                We work alongside public institutions, conservation bodies, businesses and development organizations.
              </p>
            </div>
            <div className="mt-12">
              <PartnerLogos partners={partners} mobileLimit={8} />
            </div>
            <div className="mt-8 text-center">
              <Link href="/clients" className="inline-flex items-center gap-1 font-semibold text-navy-900 underline-offset-4 hover:underline">
                {partnerTotal > 8 ? `View all ${partnerTotal} clients & partners` : "View all clients & partners"}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </Container>
        </section>
      )}

      {/* PRACTICES */}
      <section className="bg-navy-50/50 py-20 sm:py-28">
        <Container>
          <div className="grid items-end gap-6 lg:grid-cols-2">
            <SectionHeading center={false} eyebrow="What we do" title="Three practices, one integrated team" />
            <p className="text-lg text-navy-500 lg:pb-2">
              Engineers, technology professionals and business consultants work in coordinated teams, so technical design, technology
              and operating requirements are considered together.
            </p>
          </div>
          <div className="mt-12 grid gap-5 lg:grid-cols-3">
            {practices.map((pr, i) => {
              const list = servicesIn(pr.slug);
              const single = list.length === 1 ? list[0] : null;
              const href = single ? `/solutions/${single.slug}` : `/solutions#${pr.slug}`;
              return (
                <Reveal key={pr.slug} delay={i * 80}>
                  <div className="flex h-full flex-col rounded-2xl border border-navy-100 bg-white p-7">
                    <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-navy-900 text-white">
                      <Icon name={pr.icon} className="h-6 w-6" />
                    </span>
                    <h3 className="mt-5 text-xl font-semibold text-navy-900">{pr.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-navy-500">{pr.short}</p>
                    <ul className="mt-5 flex-1 space-y-2 border-t border-navy-100 pt-5 text-sm">
                      {single
                        ? single.features.map((ft) => (
                            <li key={ft.title} className="font-medium text-navy-700">
                              {ft.title}
                            </li>
                          ))
                        : list.map((sv) => (
                            <li key={sv.slug}>
                              <Link href={`/solutions/${sv.slug}`} className="font-medium text-navy-700 underline-offset-4 hover:text-navy-900 hover:underline">
                                {sv.title}
                              </Link>
                            </li>
                          ))}
                    </ul>
                    <Link href={href} className="mt-6 inline-flex items-center gap-1 text-sm font-semibold text-navy-900 underline-offset-4 hover:underline">
                      Explore {pr.title} <ArrowRight className="h-4 w-4" />
                    </Link>
                  </div>
                </Reveal>
              );
            })}
          </div>
          <div className="mt-5 flex flex-col gap-5 rounded-2xl bg-navy-900 p-7 text-white sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-lg font-semibold">Not sure where to start?</h3>
              <p className="mt-1 text-sm leading-relaxed text-navy-200">
                Tell us what you’re trying to achieve and we’ll recommend the right approach.
              </p>
            </div>
            <div className="flex shrink-0 flex-col items-start gap-3 sm:items-end">
              <Link
                href={contactHref({ message: "I’d like to book a consultation." })}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-600"
              >
                Book a consultation <ArrowRight className="h-4 w-4" />
              </Link>
              <a href={telHref(settings.phone1)} className="inline-flex items-center gap-2 text-sm text-navy-200 hover:text-white">
                <Phone className="h-3.5 w-3.5" /> {settings.phone1}
              </a>
            </div>
          </div>
        </Container>
      </section>

      {/* TECHNOLOGY PARTNERS */}
      <section className="border-y border-navy-100 bg-white py-10">
        <p className="mb-6 text-center text-sm font-medium text-navy-400">Technology partners we build with</p>
        <PartnerMarquee />
      </section>

      {/* INDUSTRIES */}
      <section className="bg-navy-50/50 py-20 sm:py-28">
        <Container>
          <div className="grid items-end gap-6 lg:grid-cols-2">
            <SectionHeading center={false} eyebrow="Who we serve" title="Solutions across multiple sectors" />
            <p className="text-lg text-navy-500 lg:pb-2">
              We support enterprises, institutions and development programs in {sectors.length} sectors, from hospitality and real estate
              to government, finance and natural resources.
            </p>
          </div>
          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {industries.map((ind, i) => (
              <Reveal key={ind.slug} delay={(i % 4) * 80}>
                <Link
                  href={`/industries/${ind.slug}`}
                  className="group flex h-full flex-col rounded-2xl border border-navy-100 bg-white p-6 transition hover:border-navy-300 hover:shadow-lg hover:shadow-navy-900/5"
                >
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-navy-50 text-navy-900">
                    <Icon name={ind.icon} className="h-5 w-5" />
                  </span>
                  <h3 className="mt-5 font-semibold text-navy-900">{ind.title}</h3>
                  <p className="mt-2 flex-1 text-sm leading-relaxed text-navy-500">{ind.short}</p>
                  <ArrowRight className="mt-4 h-4 w-4 text-navy-900 transition group-hover:translate-x-1" />
                </Link>
              </Reveal>
            ))}
            <Reveal delay={240}>
              <Link
                href="/industries"
                className="group flex h-full flex-col justify-between rounded-2xl border border-dashed border-navy-200 p-6 transition hover:border-navy-400 hover:bg-white"
              >
                <p className="font-semibold text-navy-900">Don’t see your sector?</p>
                <p className="mt-2 text-sm text-navy-500">Our solutions adapt to any organization.</p>
                <span className="mt-5 inline-flex items-center gap-1 text-sm font-semibold text-navy-900">
                  All industries <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
                </span>
              </Link>
            </Reveal>
          </div>
        </Container>
      </section>

      {/* HOW WE WORK */}
      <section className="py-20 sm:py-28">
        <Container>
          <div className="grid items-end gap-6 lg:grid-cols-2">
            <SectionHeading center={false} eyebrow="How we work" title="One integrated delivery model" />
            <p className="text-lg text-navy-500 lg:pb-2">
              From business goals to assurance, every engagement follows the same accountable path across engineering, technology and
              operations.
            </p>
          </div>
          <ol className="relative mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-5 lg:gap-6">
            {/* connecting line on desktop */}
            <span aria-hidden className="absolute left-5 right-5 top-5 hidden h-px bg-gradient-to-r from-brand-400 via-navy-200 to-navy-100 lg:block" />
            {engagementProcess.map((step, i) => (
              <li key={step.title} className="relative">
                <span className="relative flex h-10 w-10 items-center justify-center rounded-full bg-navy-900 text-sm font-bold text-white ring-4 ring-white">
                  {i + 1}
                </span>
                <h3 className="mt-5 font-semibold text-navy-900">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-navy-500">{step.text}</p>
              </li>
            ))}
          </ol>
        </Container>
      </section>

      {/* TESTIMONIALS — hidden until real quotes are added in the admin */}
      {testimonials.length > 0 && (
        <section className="bg-navy-950 py-20 text-white sm:py-28">
          <Container>
            <p className="inline-flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.2em] text-white">
              <span className="h-px w-8 bg-white/40" /> What clients say
            </p>
            <h2 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">In our clients’ words</h2>
            <div className={`mt-12 grid gap-5 ${testimonials.length === 1 ? "max-w-3xl" : testimonials.length === 2 ? "md:grid-cols-2" : "md:grid-cols-2 lg:grid-cols-3"}`}>
              {testimonials.map((t) => (
                <figure key={t.id} className="flex h-full flex-col rounded-2xl bg-white/[0.05] p-7 ring-1 ring-white/10">
                  <Quote className="h-6 w-6 text-white" />
                  <blockquote className="mt-4 flex-1 text-lg leading-relaxed text-navy-100">“{t.quote}”</blockquote>
                  <figcaption className="mt-6 flex items-center gap-3">
                    {t.photo ? (
                      <Image src={t.photo} alt="" width={44} height={44} unoptimized={t.photo.startsWith("/media/")} className="h-11 w-11 rounded-full object-cover" />
                    ) : (
                      <span className="flex h-11 w-11 items-center justify-center rounded-full bg-brand-500 font-bold text-white">{t.name.charAt(0)}</span>
                    )}
                    <span>
                      <span className="block font-semibold">{t.name}</span>
                      <span className="block text-sm text-navy-300">{[t.role, t.organization].filter(Boolean).join(", ")}</span>
                    </span>
                  </figcaption>
                </figure>
              ))}
            </div>
          </Container>
        </section>
      )}

      {/* WHO WE ARE */}
      <section className="py-20 sm:py-28">
        <Container>
          <div className="grid gap-8 lg:grid-cols-12 lg:items-end">
            <div className="lg:col-span-7">
              <SectionHeading center={false} eyebrow="Who we are" title="Built for complex, multidisciplinary challenges" />
            </div>
            <div className="lg:col-span-5">
              <p className="text-lg leading-relaxed text-navy-500">
                Britech Solutions Limited is a Tanzania-based multidisciplinary professional services and technology company in Arusha.
                For more than eight years we have helped clients design, modernize and operate the systems their performance depends on.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <ButtonLink href="/about">About Britech</ButtonLink>
                <ButtonLink href="/our-work" variant="secondary">
                  Our work
                </ButtonLink>
              </div>
            </div>
          </div>

          <div className="mt-14 grid gap-4 lg:grid-cols-4">
            <Reveal className="lg:col-span-2">
              <div className="relative h-full overflow-hidden rounded-3xl bg-navy-900 p-8 text-white sm:p-10">
                <div className="bg-grid-dark absolute inset-0 [mask-image:linear-gradient(to_bottom_left,black,transparent_70%)]" />
                <div className="relative">
                  <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-white">
                    <Target className="h-4 w-4" /> Mission
                  </span>
                  <p className="mt-6 text-2xl font-semibold leading-snug sm:text-[28px]">
                    To deliver secure and innovative digital systems that transform operations, empower users, and build resilient
                    institutions.
                  </p>
                </div>
              </div>
            </Reveal>

            <Reveal delay={80} className="lg:col-span-2">
              <div className="flex h-full flex-col justify-between gap-6 rounded-3xl border border-navy-100 bg-navy-50 p-8 sm:p-10">
                <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-navy-500">
                  <Eye className="h-4 w-4" /> Vision
                </span>
                <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-end sm:justify-between sm:gap-6">
                  <p className="max-w-sm text-lg font-medium leading-relaxed text-navy-800">
                    To become Africa’s most trusted digital transformation and cybersecurity solutions provider.
                  </p>
                  <p className="text-6xl font-extrabold tracking-tight text-navy-900 sm:text-7xl" aria-label="by 2030">
                    2030
                  </p>
                </div>
              </div>
            </Reveal>

            <Reveal delay={120} className="lg:col-span-2">
              <div className="h-full rounded-3xl border border-navy-100 bg-white p-8">
                <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-navy-500">
                  <Award className="h-4 w-4 text-navy-900" /> Credentials
                </span>
                <div className="mt-5 flex flex-wrap gap-2">
                  {["PMP", "CISA", "ITIL", "CISSP"].map((c) => (
                    <span key={c} className="rounded-lg bg-navy-900 px-3 py-1.5 text-sm font-bold text-white">
                      {c}
                    </span>
                  ))}
                </div>
                <p className="mt-5 flex items-start gap-2 text-navy-600">
                  <Globe className="mt-0.5 h-4 w-4 shrink-0 text-navy-900" /> Accredited .tz domain registrar, hosting nearly 200 domains.
                </p>
              </div>
            </Reveal>

            <Reveal delay={160} className="lg:col-span-2">
              <div className="h-full rounded-3xl border border-navy-100 bg-white p-8">
                <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-navy-500">
                  <Heart className="h-4 w-4 text-navy-900" /> What we stand for
                </span>
                <div className="mt-5 flex flex-wrap gap-2">
                  {values.map((v) => (
                    <span key={v.title} className="rounded-full border border-navy-200 px-4 py-1.5 text-sm font-medium text-navy-700">
                      {v.title}
                    </span>
                  ))}
                </div>
                <p className="mt-5 text-navy-500">“Run it like you own it” is the mindset every Britech team member brings to client work.</p>
              </div>
            </Reveal>
          </div>
        </Container>
      </section>

      {/* BLOG — appears once posts are published */}
      {posts.length > 0 && (
        <section className="border-t border-navy-100 bg-navy-50/50 py-20 sm:py-24">
          <Container>
            <div className="flex flex-wrap items-end justify-between gap-6">
              <SectionHeading center={false} eyebrow="From the blog" title="Latest insights" />
              <Link href="/blog" className="inline-flex items-center gap-1 font-semibold text-navy-900 underline-offset-4 hover:underline">
                All articles <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {posts.map((p) => (
                <PostCard key={p.id} post={p} />
              ))}
            </div>
          </Container>
        </section>
      )}

      <CTA />
    </>
  );
}
