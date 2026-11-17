import type { Metadata } from "next";
import { SITE_URL } from "@/lib/site";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Mail } from "lucide-react";
import CTA from "@/components/CTA";
import { FacebookIcon, LinkedInIcon, XIcon } from "@/components/Icon";
import { PostCard } from "@/components/site-cards";
import { Container } from "@/components/ui";
import { getPostBySlug, getRelatedPosts } from "@/lib/content";
import { sanitizePostHtml } from "@/lib/sanitize";
import { formatDate, readingTime } from "@/lib/utils";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) return {};
  return {
    title: post.title,
    description: post.excerpt,
    openGraph: {
      type: "article",
      title: post.title,
      description: post.excerpt,
      publishedTime: post.publishedAt?.toISOString(),
      images: post.coverImage ? [post.coverImage] : ["/images/logo.png"],
    },
  };
}

export default async function PostPage({ params }: Props) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) notFound();
  const related = await getRelatedPosts(post.category, post.id);

  const url = `${SITE_URL}/blog/${post.slug}`;
  const enc = encodeURIComponent;
  const share = [
    { label: "Share on LinkedIn", href: `https://www.linkedin.com/sharing/share-offsite/?url=${enc(url)}`, Icon: LinkedInIcon },
    { label: "Share on X", href: `https://twitter.com/intent/tweet?url=${enc(url)}&text=${enc(post.title)}`, Icon: XIcon },
    { label: "Share on Facebook", href: `https://www.facebook.com/sharer/sharer.php?u=${enc(url)}`, Icon: FacebookIcon },
    { label: "Share by email", href: `mailto:?subject=${enc(post.title)}&body=${enc(url)}`, Icon: Mail },
  ];
  const tags = post.tags.split(",").map((t) => t.trim()).filter(Boolean);

  return (
    <>
      <article>
        <header className="border-b border-navy-100 bg-navy-50/50">
          <Container className="max-w-4xl py-14 sm:py-16">
            <Link href="/blog" className="inline-flex items-center gap-1 text-sm font-medium text-navy-500 hover:text-navy-900">
              <ArrowLeft className="h-4 w-4" /> All articles
            </Link>
            <p className="mt-6 text-xs font-semibold uppercase tracking-[0.2em] text-mint-700">{post.category}</p>
            <h1 className="mt-3 text-3xl font-bold leading-tight tracking-tight text-navy-900 sm:text-5xl">{post.title}</h1>
            <p className="mt-5 text-lg leading-relaxed text-navy-500">{post.excerpt}</p>
            <div className="mt-6 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-navy-500">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-navy-900 text-sm font-semibold text-mint-400">
                {post.author.name.charAt(0)}
              </span>
              <span className="font-medium text-navy-800">{post.author.name}</span>
              <span>·</span>
              {post.publishedAt && <time dateTime={post.publishedAt.toISOString()}>{formatDate(post.publishedAt)}</time>}
              <span>·</span>
              <span>{readingTime(post.content)} min read</span>
            </div>
          </Container>
        </header>

        {post.coverImage && (
          <Container className="max-w-5xl">
            <div className="relative -mb-4 mt-10 aspect-[16/8] overflow-hidden rounded-3xl bg-navy-50">
              <Image src={post.coverImage} alt="" fill priority unoptimized={post.coverImage.startsWith("/media/")} sizes="(min-width:1024px) 1024px, 100vw" className="object-cover" />
            </div>
          </Container>
        )}

        <Container className="max-w-3xl py-14">
          {/* Content is sanitized when saved; sanitized again here as defence in depth. */}
          <div className="prose prose-lg prose-britech max-w-none" dangerouslySetInnerHTML={{ __html: sanitizePostHtml(post.content) }} />

          <div className="mt-12 flex flex-wrap items-center justify-between gap-6 border-t border-navy-100 pt-8">
            {tags.length > 0 ? (
              <ul className="flex flex-wrap gap-2">
                {tags.map((t) => (
                  <li key={t} className="rounded-full bg-navy-50 px-3 py-1 text-sm text-navy-600">
                    #{t}
                  </li>
                ))}
              </ul>
            ) : (
              <span />
            )}
            <div className="flex items-center gap-2">
              <span className="mr-1 text-sm text-navy-400">Share</span>
              {share.map(({ label, href, Icon }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="flex h-9 w-9 items-center justify-center rounded-lg text-navy-600 ring-1 ring-navy-200 transition hover:bg-navy-900 hover:text-white"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>
        </Container>
      </article>

      {related.length > 0 && (
        <section className="border-t border-navy-100 bg-navy-50/50 py-16">
          <Container>
            <h2 className="text-2xl font-bold text-navy-900">More in {post.category}</h2>
            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((p) => (
                <PostCard key={p.id} post={p} />
              ))}
            </div>
          </Container>
        </section>
      )}

      <CTA />
    </>
  );
}
