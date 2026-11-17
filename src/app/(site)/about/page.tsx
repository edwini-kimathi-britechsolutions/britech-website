import type { Metadata } from "next";
import CTA from "@/components/CTA";
import { Eye, Target } from "lucide-react";
import Icon from "@/components/Icon";
import { CountUp } from "@/components/motion";
import { Container, PageHero, PartnerMarquee, SectionHeading } from "@/components/ui";
import { engagementProcess, highlights, stats, values } from "@/lib/data";

export const metadata: Metadata = {
  title: "About Britech",
  description: "Seven years of growth, innovation, and impact — learn about Britech Solutions’ mission, vision, and values.",
};

export default function AboutPage() {
  return (
    <>
      <PageHero
        eyebrow="About Britech"
        title="Seven years of growth, innovation & impact"
        text="We were founded with a mission to solve real-world challenges through technology — delivering digital solutions that transform institutions, empower communities, and shape a better future."
      />

      <section className="py-20 sm:py-24">
        <Container className="grid items-center gap-14 lg:grid-cols-2">
          <div>
            <SectionHeading center={false} eyebrow="Who we are" title="Innovation, trust, and impact" />
            <div className="mt-6 space-y-4 text-lg leading-relaxed text-navy-500">
              <p>
                Britech Solutions is proud to mark seven years of growth, innovation, and impact. It has been an inspiring journey filled
                with accomplishments, valuable lessons, and milestones that reflect our resilience, creativity, and shared purpose.
              </p>
              <p>
                We extend our heartfelt appreciation to every member of the Britech team, our clients, technology partners, and
                stakeholders. Your trust, support, and collaboration have been the cornerstone of our progress.
              </p>
              <p>
                We have refreshed our brand identity to reflect our future-forward vision — a palette that symbolizes clarity,
                intelligence, and transformation.
              </p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-px overflow-hidden rounded-3xl border border-navy-100 bg-navy-100">
            {stats.map((st) => (
              <div key={st.label} className="bg-white p-8">
                <CountUp value={st.value} className="block text-4xl font-bold tracking-tight text-navy-900 sm:text-5xl" />
                <p className="mt-2 text-navy-500">{st.label}</p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* Mission / Vision */}
      <section className="py-20 sm:py-24">
        <Container className="grid gap-6 md:grid-cols-2">
          {[
            {
              Icon: Target,
              title: "Our mission",
              text: "To deliver secure and innovative digital systems that transform operations, empower users, and build resilient institutions.",
            },
            {
              Icon: Eye,
              title: "Our vision",
              text: "To become Africa’s most trusted digital transformation and cybersecurity solutions provider by 2030.",
            },
          ].map(({ Icon: I, title, text }) => (
            <div key={title} className="rounded-3xl border border-navy-100 bg-white p-8 sm:p-10">
              <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-mint-50 text-mint-700">
                <I className="h-6 w-6" />
              </span>
              <h2 className="mt-5 text-2xl font-bold text-navy-900">{title}</h2>
              <p className="mt-3 text-lg leading-relaxed text-navy-600">{text}</p>
            </div>
          ))}
        </Container>
      </section>

      {/* How we work */}
      <section className="pb-20 sm:pb-24">
        <Container>
          <SectionHeading
            center={false}
            eyebrow="How we work"
            title="From discovery to handover"
            text="We combine strategic insight, technical capability, cybersecurity awareness, and local context — with accountability from inception to handover."
          />
          <ol className="mt-12 grid gap-px overflow-hidden rounded-3xl border border-navy-100 bg-navy-100 sm:grid-cols-2 lg:grid-cols-4">
            {engagementProcess.map((step, i) => (
              <li key={step.title} className="bg-white p-7">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-navy-900 text-sm font-semibold text-mint-400">
                  {i + 1}
                </span>
                <h3 className="mt-5 font-semibold text-navy-900">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-navy-500">{step.text}</p>
              </li>
            ))}
          </ol>
        </Container>
      </section>

      {/* At a glance */}
      <section className="border-y border-navy-100 bg-navy-50/50 py-20 sm:py-24">
        <Container>
          <SectionHeading eyebrow="At a glance" title="What sets Britech apart" />
          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {highlights.map((h) => (
              <div key={h.title} className="rounded-2xl border border-navy-100 bg-white p-7">
                <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-navy-900 text-mint-400">
                  <Icon name={h.icon} className="h-6 w-6" />
                </span>
                <h3 className="mt-5 text-lg font-semibold text-navy-900">{h.title}</h3>
                <p className="mt-2 leading-relaxed text-navy-500">{h.text}</p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* Values */}
      <section className="py-20 sm:py-24">
        <Container>
          <SectionHeading eyebrow="Our values" title="What we stand for" />
          <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-5">
            {values.map((v) => (
              <div key={v.title} className="border-t-2 border-navy-100 pt-5">
                <h3 className="text-lg font-semibold text-navy-900">{v.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-navy-500">{v.text}</p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* Team */}
      <section className="pb-8">
        <Container>
          <div className="rounded-3xl bg-navy-900 p-8 sm:p-12">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-mint-400">Our team</p>
            <p className="mt-4 text-3xl font-bold tracking-tight text-white sm:text-4xl">“Run it like you own it.”</p>
            <p className="mt-5 max-w-3xl text-lg leading-relaxed text-navy-200">
              The key to our success lies in our passionate, professional, and highly skilled team, which brings together years of
              experience across transformative projects. Our team blends youthful energy and innovation with the depth and wisdom of
              seasoned experts — united by a shared vision, creativity, and purpose.
            </p>
          </div>
        </Container>
      </section>

      <section className="py-16">
        <Container>
          <p className="mb-6 text-center text-sm font-medium text-navy-400">Technology partners we work with</p>
        </Container>
        <PartnerMarquee />
      </section>

      <CTA />
    </>
  );
}
