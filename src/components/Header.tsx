"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowRight, ChevronDown, Menu, Phone, Sparkles, X } from "lucide-react";
import { practices, servicesIn, telHref } from "@/lib/data";
import Icon from "./Icon";

const nav = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/solutions", label: "Solutions", mega: true },
  { href: "/industries", label: "Industries" },
  { href: "/products", label: "Products" },
  { href: "/our-work", label: "Our Work" },
  { href: "/blog", label: "Blog" },
  { href: "/contact", label: "Contact" },
];

export default function Header({ phone, announcement }: { phone: string; announcement: { text: string; link: string } }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const isActive = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));

  return (
    <>
      {/* Announcement bar (edited in Admin → Site settings; hidden when empty) */}
      {announcement.text && (
        <div className="bg-navy-950 text-white">
          <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-2.5 sm:px-6 lg:px-8">
            <p className="flex min-w-0 items-center gap-2 text-sm text-navy-200">
              <Sparkles className="h-4 w-4 shrink-0 text-white" />
              <span className="truncate">{announcement.text}</span>
            </p>
            {announcement.link && (
              <Link
                href={announcement.link}
                className="inline-flex shrink-0 items-center gap-1 text-sm font-medium text-white transition hover:text-navy-200"
              >
                Learn more <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            )}
          </div>
        </div>
      )}

      <header
        className={`sticky top-0 z-50 border-b transition-all ${
          scrolled ? "border-navy-100 bg-white/85 shadow-sm backdrop-blur-lg" : "border-transparent bg-white"
        }`}
      >
        <div className="mx-auto flex h-18 max-w-7xl items-center justify-between gap-6 px-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex shrink-0 items-center" aria-label="Britech Solutions home">
            <Image src="/images/logo.svg" alt="Britech Solutions" width={139} height={50} priority unoptimized className="h-11 w-auto" />
          </Link>

          <nav className="hidden items-center gap-1 self-stretch lg:flex">
            {nav.map((item) =>
              item.mega ? (
                <div key={item.href} className="group flex items-center self-stretch">
                  <Link
                    href={item.href}
                    className={`flex items-center gap-1 rounded-full px-2.5 py-2 text-[15px] font-medium transition xl:px-4 ${
                      isActive(item.href) ? "bg-navy-50 text-navy-900 ring-1 ring-navy-100" : "text-navy-700 hover:text-navy-900"
                    }`}
                  >
                    {item.label}
                    <ChevronDown className="h-4 w-4 transition group-hover:rotate-180" />
                  </Link>
                  {/* Anchored to the sticky header, centred on the page */}
                  <div className="invisible absolute inset-x-0 top-full opacity-0 transition-all group-hover:visible group-hover:opacity-100">
                    <div className="mx-auto max-w-5xl px-4">
                      <div className="grid grid-cols-3 gap-6 rounded-2xl border border-navy-100 bg-white p-5 shadow-xl shadow-navy-900/10">
                        <div className="space-y-5">
                          {practices
                            .filter((p) => p.slug !== "digital")
                            .map((p) => (
                              <div key={p.slug}>
                                <p className="px-3 text-xs font-semibold uppercase tracking-wider text-navy-400">{p.title}</p>
                                {servicesIn(p.slug).map((s) => (
                                  <Link key={s.slug} href={`/solutions/${s.slug}`} className="mt-1 flex gap-3 rounded-xl p-3 transition hover:bg-navy-50">
                                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-navy-50 text-navy-900">
                                      <Icon name={s.icon} className="h-5 w-5" />
                                    </span>
                                    <span>
                                      <span className="block text-sm font-semibold text-navy-900">{s.title}</span>
                                      <span className="line-clamp-2 text-xs text-navy-400">{s.short}</span>
                                    </span>
                                  </Link>
                                ))}
                              </div>
                            ))}
                        </div>
                        <div className="col-span-2">
                          <p className="px-3 text-xs font-semibold uppercase tracking-wider text-navy-400">
                            {practices.find((p) => p.slug === "digital")?.title}
                          </p>
                          <div className="mt-1 grid grid-cols-2 gap-1">
                            {servicesIn("digital").map((s) => (
                              <Link key={s.slug} href={`/solutions/${s.slug}`} className="flex items-center gap-3 rounded-xl p-2.5 transition hover:bg-navy-50">
                                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-navy-50 text-navy-900">
                                  <Icon name={s.icon} className="h-4 w-4" />
                                </span>
                                <span className="text-sm font-semibold text-navy-900">{s.title}</span>
                              </Link>
                            ))}
                          </div>
                          <Link
                            href="/solutions"
                            className="mt-3 flex items-center justify-center gap-2 rounded-xl bg-navy-900 p-3 text-sm font-semibold text-white transition hover:bg-navy-800"
                          >
                            View all solutions <ArrowRight className="h-4 w-4" />
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`rounded-full px-2.5 py-2 text-[15px] font-medium transition xl:px-4 ${
                    isActive(item.href) ? "bg-navy-50 text-navy-900 ring-1 ring-navy-100" : "text-navy-700 hover:text-navy-900"
                  }`}
                >
                  {item.label}
                </Link>
              )
            )}
          </nav>

          <div className="hidden items-center gap-4 lg:flex">
            <Link
              href="/contact"
              className="rounded-lg bg-navy-900 px-5 py-2.5 text-[15px] font-medium text-white shadow-md shadow-navy-900/20 ring-1 ring-navy-700 transition hover:bg-navy-800"
            >
              Get a Quote
            </Link>
          </div>

          <button
            onClick={() => setOpen((o) => !o)}
            className="rounded-lg p-2 text-navy-900 ring-1 ring-navy-100 lg:hidden"
            aria-label="Toggle menu"
            aria-expanded={open}
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {open && (
          <div className="border-t border-navy-100 bg-white px-4 pb-6 pt-2 lg:hidden">
            {nav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`block rounded-lg px-3 py-3 font-medium ${isActive(item.href) ? "bg-navy-50 text-navy-900" : "text-navy-700"}`}
              >
                {item.label}
              </Link>
            ))}
            <div className="mt-2 border-t border-navy-100 pt-3">
              {practices.map((p) => (
                <div key={p.slug} className="mt-2">
                  <p className="px-3 pb-1 text-xs font-semibold uppercase tracking-wider text-navy-400">{p.title}</p>
                  {servicesIn(p.slug).map((s) => (
                    <Link key={s.slug} href={`/solutions/${s.slug}`} className="block px-3 py-2 text-sm text-navy-700">
                      {s.title}
                    </Link>
                  ))}
                </div>
              ))}
            </div>
            <a
              href={telHref(phone)}
              className="mt-4 flex items-center justify-center gap-2 rounded-lg bg-navy-900 px-4 py-3 font-medium text-white"
            >
              <Phone className="h-4 w-4" /> {phone}
            </a>
          </div>
        )}
      </header>
    </>
  );
}
