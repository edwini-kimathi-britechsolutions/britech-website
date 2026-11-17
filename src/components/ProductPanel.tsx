import Image from "next/image";
import { CheckCircle2 } from "lucide-react";
import type { Project } from "@prisma/client";

export type ProductData = Pick<Project, "id" | "name" | "slug" | "tagline" | "description" | "url" | "logo" | "sector" | "highlights">;

/** Visual summary of a Britech product: logo + its real feature list. */
export default function ProductPanel({ product }: { product: ProductData }) {
  const highlights = product.highlights.split("\n").filter(Boolean);
  return (
    <div className="relative overflow-hidden rounded-2xl bg-navy-900 p-6 sm:p-8">
      <div className="bg-grid-dark absolute inset-0 [mask-image:linear-gradient(to_bottom,black,transparent)]" />
      <div className="relative flex h-28 items-center justify-center rounded-xl bg-white p-4">
        {product.logo ? (
          <Image
            src={product.logo}
            alt={product.name}
            width={280}
            height={110}
            unoptimized={product.logo.startsWith("/media/")}
            className="h-auto max-h-20 w-auto max-w-[80%] object-contain"
          />
        ) : (
          <span className="text-2xl font-bold text-navy-900">{product.name}</span>
        )}
      </div>

      {highlights.length > 0 && (
        <ul className="relative mt-5 grid gap-3 sm:grid-cols-2">
          {highlights.slice(0, 6).map((h) => (
            <li key={h} className="flex items-center gap-3 rounded-xl bg-white/[0.06] px-4 py-3 text-sm font-medium text-white ring-1 ring-white/10">
              <CheckCircle2 className="h-4 w-4 shrink-0 text-mint-400" /> {h}
            </li>
          ))}
        </ul>
      )}

      <p className="relative mt-5 text-xs uppercase tracking-[0.18em] text-navy-300">
        {product.sector ? `${product.sector} · ` : ""}Built by Britech Solutions
      </p>
    </div>
  );
}
