import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Search } from "lucide-react";

export const metadata = { title: "Page not found" };

const links = [
  { href: "/solutions", label: "Solutions" },
  { href: "/products", label: "Products" },
  { href: "/our-work", label: "Our work" },
  { href: "/blog", label: "Blog" },
  { href: "/contact", label: "Contact" },
];

export default function NotFound() {
  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-white">
      <div className="bg-grid pointer-events-none absolute inset-0 [mask-image:radial-gradient(ellipse_at_center,black_20%,transparent_70%)]" />
      <header className="relative mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <Link href="/" aria-label="Britech Solutions home">
          <Image src="/images/logo.png" alt="Britech Solutions" width={140} height={53} className="h-10 w-auto" priority />
        </Link>
      </header>
      <main className="relative flex flex-1 items-center justify-center px-4 pb-24">
        <div className="max-w-xl text-center">
          <p className="text-8xl font-extrabold tracking-tight text-navy-900 sm:text-9xl">
            4<span className="text-mint-500">0</span>4
          </p>
          <h1 className="mt-6 text-2xl font-bold text-navy-900 sm:text-3xl">We couldn’t find that page</h1>
          <p className="mt-3 text-navy-500">The link may be broken, or the page may have moved. Try one of these instead:</p>
          <div className="mt-8 flex flex-wrap justify-center gap-2">
            {links.map((l) => (
              <Link key={l.href} href={l.href} className="rounded-full border border-navy-200 px-4 py-2 text-sm font-medium text-navy-700 transition hover:border-mint-400 hover:bg-mint-50">
                {l.label}
              </Link>
            ))}
          </div>
          <div className="mt-10 flex flex-wrap justify-center gap-3">
            <Link href="/" className="inline-flex items-center gap-2 rounded-lg bg-navy-900 px-5 py-3 font-semibold text-white hover:bg-navy-800">
              <ArrowLeft className="h-4 w-4" /> Back to home
            </Link>
            <Link href="/blog" className="inline-flex items-center gap-2 rounded-lg px-5 py-3 font-semibold text-navy-800 ring-1 ring-navy-200 hover:bg-navy-50">
              <Search className="h-4 w-4" /> Search articles
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
