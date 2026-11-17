import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { partners } from "@/lib/data";

export function Container({ className = "", children }: { className?: string; children: React.ReactNode }) {
  return <div className={`mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 ${className}`}>{children}</div>;
}

export function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.2em] text-mint-700">
      <span className="h-px w-8 bg-mint-500" />
      {children}
    </span>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  text,
  center = true,
}: {
  eyebrow?: string;
  title: React.ReactNode;
  text?: string;
  center?: boolean;
}) {
  return (
    <div className={center ? "mx-auto max-w-3xl text-center" : "max-w-2xl"}>
      {eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}
      <h2 className="mt-4 text-3xl font-bold tracking-tight text-navy-900 sm:text-4xl lg:text-[44px] lg:leading-tight">{title}</h2>
      {text && <p className="mt-4 text-lg leading-relaxed text-navy-500">{text}</p>}
    </div>
  );
}

export function ButtonLink({
  href,
  children,
  variant = "primary",
}: {
  href: string;
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "mint";
}) {
  const styles = {
    primary: "bg-navy-900 text-white shadow-lg shadow-navy-900/20 hover:bg-navy-800",
    secondary: "bg-white text-navy-900 ring-1 ring-navy-200 hover:ring-navy-300 hover:bg-navy-50",
    mint: "bg-mint-500 text-navy-950 shadow-lg shadow-mint-500/30 hover:bg-mint-400",
  };
  return (
    <Link
      href={href}
      className={`group inline-flex items-center gap-2 rounded-lg px-6 py-3 font-semibold transition ${styles[variant]}`}
    >
      {children}
      <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
    </Link>
  );
}

export function PartnerMarquee() {
  const row = [...partners, ...partners];
  return (
    <div className="mask-fade-x overflow-hidden">
      <div className="flex w-max animate-marquee items-center gap-14 hover:[animation-play-state:paused]">
        {row.map((p, i) => (
          <Image
            key={i}
            src={`/images/partners/${p.file}.png`}
            alt={p.name}
            width={180}
            height={60}
            className="h-10 w-auto object-contain opacity-60 grayscale transition hover:opacity-100 hover:grayscale-0 sm:h-12"
          />
        ))}
      </div>
    </div>
  );
}

export function PageHero({ eyebrow, title, text }: { eyebrow: string; title: React.ReactNode; text: string }) {
  return (
    <section className="relative overflow-hidden border-b border-navy-100 bg-navy-50/50">
      <div className="bg-grid pointer-events-none absolute inset-0 [mask-image:linear-gradient(to_left,black,transparent_70%)]" />
      <Container className="relative py-16 sm:py-20">
        <div className="max-w-3xl animate-fade-up">
          <Eyebrow>{eyebrow}</Eyebrow>
          <h1 className="mt-5 text-4xl font-bold tracking-tight text-navy-900 sm:text-5xl lg:text-[56px] lg:leading-[1.1]">{title}</h1>
          <p className="mt-5 max-w-2xl text-lg leading-relaxed text-navy-500">{text}</p>
        </div>
      </Container>
    </section>
  );
}
