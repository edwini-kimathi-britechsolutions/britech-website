import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ArrowUpRight, Check } from "lucide-react";
import type { Partner, Project } from "@prisma/client";
import type { PublicPost } from "@/lib/content";
import { formatDate, readingTime } from "@/lib/utils";

/* ------------------------------ logos ------------------------------ */

export function PartnerLogos({
  partners,
  showNames = false,
  mobileLimit,
}: {
  partners: Partner[];
  showNames?: boolean;
  /** Show only the first N logos on phones, to keep the page short. */
  mobileLimit?: number;
}) {
  if (partners.length === 0) return null;
  return (
    <ul className="flex flex-wrap justify-center gap-3">
      {partners.map((p, i) => {
        const img = (
          <Image
            src={p.logo}
            alt={p.name}
            width={200}
            height={90}
            unoptimized={p.logo.startsWith("/media/")}
            className="h-auto max-h-20 w-auto max-w-[85%] object-contain transition duration-300 group-hover:scale-105"
          />
        );
        const logo = showNames ? (
          <span className="flex h-full w-full flex-col items-center justify-center gap-2">
            <span className="flex min-h-0 flex-1 items-center justify-center">{img}</span>
            <span className="line-clamp-1 text-center text-xs font-medium text-navy-500">{p.name}</span>
          </span>
        ) : (
          img
        );
        return (
          <li
            key={p.id}
            title={p.name}
            className={`group ${mobileLimit !== undefined && i >= mobileLimit ? "max-sm:hidden" : ""} flex ${showNames ? "h-36" : "h-28"} w-[calc(50%-0.375rem)] items-center justify-center rounded-xl border border-navy-100 bg-white p-4 transition hover:border-mint-300 hover:shadow-md hover:shadow-navy-900/5 sm:w-[calc(33.333%-0.5rem)] lg:w-[calc(20%-0.6rem)]`}
          >
            {p.url ? (
              <a href={p.url} target="_blank" rel="noopener noreferrer" className="flex h-full w-full items-center justify-center">
                {logo}
              </a>
            ) : (
              logo
            )}
          </li>
        );
      })}
    </ul>
  );
}

/* ----------------------------- projects ---------------------------- */

export function ProjectCard({ project, compact = false }: { project: Project; compact?: boolean }) {
  const highlights = project.highlights.split("\n").filter(Boolean);
  return (
    <article id={project.slug} className="flex h-full scroll-mt-28 flex-col rounded-2xl border border-navy-100 bg-white p-7 transition hover:border-mint-300 hover:shadow-lg hover:shadow-navy-900/5">
      <div className="flex h-16 items-center">
        {project.logo ? (
          <Image
            src={project.logo}
            alt={project.name}
            width={240}
            height={96}
            unoptimized={project.logo.startsWith("/media/")}
            className="h-14 w-auto max-w-[220px] object-contain object-left"
          />
        ) : (
          <span className="text-2xl font-bold text-navy-900">{project.name}</span>
        )}
      </div>
      <div className="mt-5 flex flex-wrap gap-2 text-xs font-medium">
        {project.sector && <span className="rounded-full bg-mint-50 px-2.5 py-1 text-mint-700">{project.sector}</span>}
        {project.client && <span className="rounded-full bg-navy-50 px-2.5 py-1 text-navy-600">Client: {project.client}</span>}
      </div>
      <h3 className="mt-4 text-xl font-semibold text-navy-900">{project.name}</h3>
      <p className="mt-1 font-medium text-navy-600">{project.tagline}</p>
      {!compact && <p className="mt-3 leading-relaxed text-navy-500">{project.description}</p>}
      {!compact && highlights.length > 0 && (
        <ul className="mt-5 space-y-2">
          {highlights.map((h) => (
            <li key={h} className="flex items-start gap-2 text-sm text-navy-700">
              <Check className="mt-0.5 h-4 w-4 shrink-0 text-mint-700" /> {h}
            </li>
          ))}
        </ul>
      )}
      <div className="mt-auto pt-6">
        {compact ? (
          <Link href={`/our-work#${project.slug}`} className="inline-flex items-center gap-1 text-sm font-semibold text-mint-700">
            View project <ArrowRight className="h-4 w-4" />
          </Link>
        ) : (
          project.url && (
            <a
              href={project.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-sm font-semibold text-mint-700 hover:text-mint-600"
            >
              Visit {project.name} <ArrowUpRight className="h-4 w-4" />
            </a>
          )
        )}
      </div>
    </article>
  );
}

/* ------------------------------- posts ----------------------------- */

function Cover({ src, alt, className = "" }: { src: string | null; alt: string; className?: string }) {
  if (!src) {
    return (
      <div className={`flex items-center justify-center bg-navy-900 ${className}`}>
        <Image src="/images/mark.png" alt="" width={64} height={64} className="h-14 w-14 opacity-90" />
      </div>
    );
  }
  return (
    <div className={`relative overflow-hidden bg-navy-50 ${className}`}>
      <Image src={src} alt={alt} fill unoptimized={src.startsWith("/media/")} sizes="(min-width:1024px) 33vw, 100vw" className="object-cover transition duration-500 group-hover:scale-105" />
    </div>
  );
}

export function PostMeta({ post }: { post: PublicPost }) {
  return (
    <p className="text-sm text-navy-400">
      {post.publishedAt && formatDate(post.publishedAt)} · {readingTime(post.content)} min read
    </p>
  );
}

export function PostCard({ post }: { post: PublicPost }) {
  return (
    <Link href={`/blog/${post.slug}`} className="group flex h-full flex-col overflow-hidden rounded-2xl border border-navy-100 bg-white transition hover:border-mint-300 hover:shadow-lg hover:shadow-navy-900/5">
      <Cover src={post.coverImage} alt={post.title} className="aspect-[16/9]" />
      <div className="flex flex-1 flex-col p-6">
        <span className="text-xs font-semibold uppercase tracking-[0.15em] text-mint-700">{post.category}</span>
        <h3 className="mt-2 text-lg font-semibold leading-snug text-navy-900 group-hover:text-navy-700">{post.title}</h3>
        <p className="mt-2 line-clamp-3 flex-1 text-sm leading-relaxed text-navy-500">{post.excerpt}</p>
        <div className="mt-5 flex items-center justify-between">
          <PostMeta post={post} />
          <ArrowRight className="h-4 w-4 text-mint-700 transition group-hover:translate-x-1" />
        </div>
      </div>
    </Link>
  );
}

export function FeaturedPost({ post }: { post: PublicPost }) {
  return (
    <Link href={`/blog/${post.slug}`} className="group grid overflow-hidden rounded-3xl border border-navy-100 bg-white transition hover:border-mint-300 hover:shadow-xl hover:shadow-navy-900/5 lg:grid-cols-2">
      <Cover src={post.coverImage} alt={post.title} className="aspect-[16/10] lg:aspect-auto lg:min-h-[340px]" />
      <div className="flex flex-col justify-center p-8 lg:p-10">
        <span className="text-xs font-semibold uppercase tracking-[0.15em] text-mint-700">Featured · {post.category}</span>
        <h2 className="mt-3 text-2xl font-bold leading-tight text-navy-900 sm:text-3xl">{post.title}</h2>
        <p className="mt-4 leading-relaxed text-navy-500">{post.excerpt}</p>
        <div className="mt-6 flex items-center gap-3">
          <span className="font-medium text-navy-800">{post.author.name}</span>
          <PostMeta post={post} />
        </div>
      </div>
    </Link>
  );
}
