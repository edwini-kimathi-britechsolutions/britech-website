"use client";

import Link from "next/link";
import { RotateCcw } from "lucide-react";

/** Friendly fallback if a page fails to load (e.g. the database is briefly unavailable). */
export default function SiteError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <section className="flex min-h-[60vh] items-center justify-center px-4 py-24">
      <div className="max-w-lg text-center">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-mint-700">Something went wrong</p>
        <h1 className="mt-4 text-3xl font-bold text-navy-900">We couldn’t load this page</h1>
        <p className="mt-3 text-navy-500">Please try again in a moment. If the problem continues, contact us directly.</p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <button
            onClick={reset}
            className="inline-flex items-center gap-2 rounded-lg bg-navy-900 px-5 py-3 font-semibold text-white hover:bg-navy-800"
          >
            <RotateCcw className="h-4 w-4" /> Try again
          </button>
          <Link href="/" className="rounded-lg px-5 py-3 font-semibold text-navy-800 ring-1 ring-navy-200 hover:bg-navy-50">
            Go to home page
          </Link>
        </div>
        <p className="mt-6 text-sm text-navy-400">info@britechsolutions.co.tz · +255 795 005 903</p>
      </div>
    </section>
  );
}
