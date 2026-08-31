import { notFound } from "next/navigation";
import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { getJournalPostBySlug } from "@/lib/queries";
import { formatDate } from "@/lib/utils/format";
import { ChevronLeft } from "lucide-react";

export const dynamic = "force-dynamic";
export const revalidate = 0;

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = (await getJournalPostBySlug(slug)) as any;
  if (!post) return { title: "Article Not Found" };

  return {
    title: post.seo_title || post.title,
    description: post.seo_description || post.excerpt || undefined,
  };
}

export default async function JournalArticlePage({ params }: Props) {
  const { slug } = await params;
  const post = (await getJournalPostBySlug(slug)) as any;

  if (!post) notFound();

  return (
    <article className="container-luxury py-12 md:py-20">
      <div className="max-w-2xl mx-auto">
        <Link
          href="/journal"
          className="inline-flex items-center gap-1 opacity-60 hover:opacity-100 mb-8 label-uppercase text-xs tracking-widest text-navy transition-opacity"
        >
          <ChevronLeft size={14} /> BACK TO JOURNAL
        </Link>

        <div className="flex items-center gap-3 text-xs opacity-50 mb-4" style={{ fontFamily: "var(--font-inter)" }}>
          <span>{post.published_at ? formatDate(post.published_at) : formatDate(post.created_at)}</span>
          <span>·</span>
          <span>By {post.author}</span>
        </div>

        <h1
          className="text-navy text-3xl md:text-5xl font-normal leading-tight mb-8"
          style={{ fontFamily: "var(--font-cormorant)" }}
        >
          {post.title}
        </h1>

        {post.cover_image_url && (
          <div className="relative aspect-[16/9] w-full overflow-hidden mb-10 bg-beige/30">
            <Image
              src={post.cover_image_url}
              alt={post.title}
              fill
              sizes="(max-width: 1024px) 100vw, 750px"
              className="object-cover"
              priority
            />
          </div>
        )}

        {post.excerpt && (
          <p
            className="text-lg md:text-xl font-normal text-navy/90 leading-relaxed mb-8 italic border-l-2 border-champagne pl-4"
            style={{ fontFamily: "var(--font-cormorant)" }}
          >
            {post.excerpt}
          </p>
        )}

        <div
          className="prose prose-navy max-w-none opacity-85 leading-loose text-charcoal text-base"
          style={{ fontFamily: "var(--font-inter)", whiteSpace: "pre-line" }}
        >
          {post.content}
        </div>
      </div>
    </article>
  );
}
