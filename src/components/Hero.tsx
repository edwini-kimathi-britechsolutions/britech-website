import Image from "next/image";
import { BarChart3, Cloud, Cpu, Database, ShieldCheck } from "lucide-react";
import Icon from "./Icon";
import { NetworkField, RotatingWord } from "./motion";
import { ButtonLink } from "./ui";
import type { Partner } from "@prisma/client";

const words = ["facilities", "software", "networks", "dashboards", "security"];

/** Capabilities in orbit, across Britech's three practices. */
const orbit = [
  { label: "Engineering", icon: "Building2" },
  { label: "Energy", icon: "Zap" },
  { label: "Apps", icon: "Smartphone" },
  { label: "ERP", icon: "Layers" },
  { label: "Data & BI", icon: "BarChart3" },
  { label: "Security", icon: "ShieldCheck" },
  { label: "Cloud", icon: "Cloud" },
  { label: "Advisory", icon: "Briefcase" },
];

/** Position n items evenly on a circle (percent coords, starting at 12 o'clock). */
const onCircle = (i: number, n: number) => {
  const a = (i / n) * Math.PI * 2 - Math.PI / 2;
  return { left: `${50 + 50 * Math.cos(a)}%`, top: `${50 + 50 * Math.sin(a)}%` };
};

const inner = [Cloud, Database, Cpu];

/** Britech mark at the centre with its capabilities in orbit: "one partner, every capability". */
function ServiceOrbit() {
  return (
    <div className="relative mx-auto aspect-square w-full max-w-[520px]">
      {/* glow */}
      <div className="absolute inset-[18%] rounded-full bg-brand-300/30 blur-3xl" />

      {/* Outer ring – services */}
      <div className="absolute inset-[7%] animate-orbit rounded-full border border-dashed border-navy-200">
        {orbit.map((s, i) => (
          <div key={s.label} className="absolute -translate-x-1/2 -translate-y-1/2" style={onCircle(i, orbit.length)}>
            <div className="animate-orbit-reverse">
              <div className="flex flex-col items-center gap-1.5">
                <span className="flex h-11 w-11 items-center justify-center rounded-2xl border border-navy-100 bg-white text-navy-800 shadow-lg shadow-navy-900/10 sm:h-14 sm:w-14">
                  <Icon name={s.icon} className="h-5 w-5 text-navy-900 sm:h-6 sm:w-6" />
                </span>
                <span className="rounded-full bg-white/90 px-2 py-0.5 text-[10px] font-semibold text-navy-700 shadow-sm sm:text-xs">
                  {s.label}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Inner ring – platforms */}
      <div className="absolute inset-[29%] animate-orbit-reverse-slow rounded-full border border-navy-100 bg-white/40 backdrop-blur-[2px]">
        {inner.map((I, i) => (
          <div key={i} className="absolute -translate-x-1/2 -translate-y-1/2" style={onCircle(i, inner.length)}>
            <div className="animate-orbit-slow">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-navy-900 text-white shadow-md sm:h-9 sm:w-9">
                <I className="h-4 w-4" />
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Centre */}
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="absolute h-[26%] w-[26%] animate-ping-slow rounded-3xl bg-brand-400/30" />
        <div className="relative flex h-[26%] w-[26%] items-center justify-center rounded-3xl border border-navy-100 bg-white shadow-2xl shadow-navy-900/15">
          <Image src="/images/mark.png" alt="Britech Solutions" width={120} height={120} priority className="h-3/5 w-3/5 object-contain" />
        </div>
      </div>

      {/* Status cards */}
      <div className="absolute -left-[4%] top-0 hidden animate-pop-in sm:block [animation-delay:900ms]">
        <div className="flex animate-float items-center gap-3 rounded-xl border-l-4 border-brand-500 bg-white px-4 py-3 shadow-xl shadow-navy-900/10">
          <ShieldCheck className="h-5 w-5 text-navy-900" />
          <div>
            <p className="text-sm font-semibold text-navy-900">Systems secured</p>
            <p className="text-xs text-navy-400">ISO 27001 · NIST aligned</p>
          </div>
        </div>
      </div>
      <div className="absolute -right-[6%] top-[70%] hidden animate-pop-in sm:block [animation-delay:1300ms]">
        <div className="flex animate-float items-center gap-3 rounded-xl border-l-4 border-navy-900 bg-white px-4 py-3 shadow-xl shadow-navy-900/10 [animation-delay:-3s]">
          <BarChart3 className="h-5 w-5 text-navy-700" />
          <div>
            <p className="text-sm font-semibold text-navy-900">Insights in real time</p>
            <p className="text-xs text-navy-400">Power BI · GIS dashboards</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Hero({ logos }: { logos: Pick<Partner, "id" | "name" | "logo">[] }) {
  return (
    <section className="relative overflow-hidden border-b border-navy-100 bg-gradient-to-br from-white via-white to-brand-50/60">
      <div className="absolute inset-0 [mask-image:radial-gradient(ellipse_at_70%_40%,black_20%,transparent_75%)]">
        <NetworkField />
      </div>
      <div className="pointer-events-none absolute -right-40 -top-40 h-[520px] w-[520px] animate-blob rounded-full bg-brand-200/40 blur-3xl" />

      <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-4 pb-20 pt-14 sm:px-6 sm:pt-20 lg:grid-cols-2 lg:px-8 lg:pb-24">
        <div>
          <p className="flex animate-fade-up items-center gap-3 text-sm font-semibold uppercase tracking-[0.2em] text-navy-500">
            <span className="h-px w-10 bg-navy-300" />
            One Britech. Three practices.
          </p>

          <h1 className="mt-6 animate-fade-up text-5xl font-extrabold leading-[1.08] tracking-tight text-navy-900 [animation-delay:100ms] sm:text-6xl lg:text-[68px]">
            Building smart
            <br />
            <RotatingWord words={words} />
            <br />
            for Africa & beyond.
          </h1>

          <p className="mt-6 max-w-xl animate-fade-up text-lg leading-relaxed text-navy-500 [animation-delay:200ms]">
            Britech Solutions brings engineering consultancy, digital transformation and business advisory together to design,
            modernize and operate the physical, digital and organizational systems that performance depends on.
          </p>

          <div className="mt-9 flex animate-fade-up flex-wrap gap-3 [animation-delay:300ms]">
            <ButtonLink href="/contact">Start a Project</ButtonLink>
            <ButtonLink href="/solutions" variant="secondary">
              Explore Solutions
            </ButtonLink>
          </div>

          {logos.length > 0 && (
            <div className="mt-10 animate-fade-up [animation-delay:400ms]">
              <p className="text-sm font-medium text-navy-500">Trusted by public institutions, NGOs and businesses</p>
              <ul className="mt-3 flex flex-wrap items-center gap-2">
                {logos.map((l) => (
                  <li key={l.id} title={l.name} className="flex h-11 items-center rounded-lg border border-navy-100 bg-white/90 px-3 shadow-sm">
                    <Image
                      src={l.logo}
                      alt={l.name}
                      width={90}
                      height={32}
                      unoptimized={l.logo.startsWith("/media/")}
                      className="h-7 w-auto max-w-[84px] object-contain"
                    />
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className="animate-fade-up [animation-delay:250ms]">
          <ServiceOrbit />
        </div>
      </div>
    </section>
  );
}
