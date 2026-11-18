import Image from "next/image";
import Link from "next/link";
import { Mail, MapPin, Phone } from "lucide-react";
import { company, practices, servicesIn, telHref } from "@/lib/data";
import { getSettings } from "@/lib/content";
import { FacebookIcon, InstagramIcon, LinkedInIcon, XIcon } from "./Icon";

export default async function Footer() {
  const settings = await getSettings();
  // Only show social icons that have a real link set in the admin.
  const socials = [
    { href: settings.linkedin, label: "LinkedIn", Icon: LinkedInIcon },
    { href: settings.twitter, label: "X", Icon: XIcon },
    { href: settings.facebook, label: "Facebook", Icon: FacebookIcon },
    { href: settings.instagram, label: "Instagram", Icon: InstagramIcon },
  ].filter((s) => s.href);
  const phones = [settings.phone1, settings.phone2].filter(Boolean);

  return (
    <footer className="relative overflow-hidden bg-navy-950 text-navy-200">
      <div className="relative mx-auto max-w-7xl px-4 pb-10 pt-16 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-3">
            <Image src="/images/logo-white.svg" alt="Britech Solutions" width={150} height={54} unoptimized className="h-12 w-auto" />
            <p className="mt-6 max-w-sm leading-relaxed text-navy-300">
              {company.summary} Engineering consultancy, digital transformation and business advisory from Arusha, Tanzania.
            </p>
            {socials.length > 0 && (
            <div className="mt-6 flex gap-3">
              {socials.map(({ href, label, Icon }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={label}
                  className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/5 ring-1 ring-white/10 transition hover:bg-white hover:text-navy-950"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
            )}
          </div>

          <div className="lg:col-span-4">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-white">Solutions</h3>
            <ul className="mt-5 space-y-3">
              {practices.map((p) => {
                const list = servicesIn(p.slug);
                return (
                  <li key={p.slug}>
                    <Link href={list.length === 1 ? `/solutions/${list[0].slug}` : `/solutions#${p.slug}`} className="transition hover:text-white">
                      {p.title}
                    </Link>
                  </li>
                );
              })}
              <li>
                <Link href="/solutions" className="font-medium text-white underline-offset-4 hover:underline">
                  All solutions
                </Link>
              </li>
            </ul>
          </div>

          <div className="lg:col-span-2">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-white">Company</h3>
            <ul className="mt-5 space-y-3">
              {[
                ["/about", "About Britech"],
                ["/industries", "Industries"],
                ["/our-work", "Our Work"],
                ["/clients", "Clients & Partners"],
                ["/blog", "Blog"],
                ["/contact", "Contact"],
              ].map(([href, label]) => (
                <li key={label}>
                  <Link href={href} className="transition hover:text-white">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="lg:col-span-3">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-white">Contact</h3>
            <ul className="mt-5 space-y-4 text-sm">
              <li className="flex gap-3">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-white" />
                {settings.address}
              </li>
              <li className="flex gap-3">
                <Mail className="mt-0.5 h-4 w-4 shrink-0 text-white" />
                <a href={`mailto:${settings.email}`} className="hover:text-white">
                  {settings.email}
                </a>
              </li>
              {phones.map((p) => (
                <li key={p} className="flex gap-3">
                  <Phone className="mt-0.5 h-4 w-4 shrink-0 text-white" />
                  <a href={telHref(p)} className="hover:text-white">
                    {p}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-14 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-8 text-sm text-navy-400 sm:flex-row">
          <p>© {new Date().getFullYear()} {company.legalName}. All rights reserved.</p>
          <p className="font-medium text-navy-300">{company.tagline}</p>
        </div>
      </div>
    </footer>
  );
}
