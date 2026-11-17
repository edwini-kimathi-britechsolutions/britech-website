"use client";

import { useState } from "react";
import { ArrowUpRight } from "lucide-react";
import ProductPanel, { type ProductData } from "./ProductPanel";
import { ButtonLink } from "./ui";
import { contactForProduct } from "@/lib/data";

export default function ProductTabs({ products }: { products: ProductData[] }) {
  const [active, setActive] = useState(0);
  const p = products[active];
  if (!p) return null;

  return (
    <div>
      {/* Scrolls horizontally when there are many products */}
      <div className="mx-auto flex w-fit max-w-full flex-wrap justify-center gap-1 rounded-2xl border border-navy-100 bg-navy-50/60 p-1 sm:rounded-full" role="tablist">
        {products.map((prod, i) => (
          <button
            key={prod.id}
            role="tab"
            aria-selected={i === active}
            onClick={() => setActive(i)}
            className={`shrink-0 rounded-full px-5 py-2 text-sm font-semibold transition ${
              i === active ? "bg-white text-navy-900 shadow ring-1 ring-navy-100" : "text-navy-500 hover:text-navy-900"
            }`}
          >
            {prod.name}
          </button>
        ))}
      </div>

      <div key={p.id} className="mt-10 grid animate-fade-up items-center gap-10 rounded-3xl border border-navy-100 bg-white p-6 shadow-xl shadow-navy-900/5 sm:p-10 lg:grid-cols-2">
        <div>
          <span className="text-sm font-semibold uppercase tracking-wider text-navy-500">{p.tagline}</span>
          <h3 className="mt-2 text-3xl font-bold text-navy-900 sm:text-4xl">{p.name}</h3>
          <p className="mt-4 leading-relaxed text-navy-500">{p.description}</p>
          <div className="mt-8 flex flex-wrap items-center gap-4">
            <ButtonLink href={contactForProduct(p)}>Request a Demo</ButtonLink>
            {p.url && (
              <a
                href={p.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 font-semibold text-navy-900 underline-offset-4 hover:underline"
              >
                Visit {p.name} <ArrowUpRight className="h-4 w-4" />
              </a>
            )}
          </div>
        </div>
        <ProductPanel product={p} />
      </div>
    </div>
  );
}
