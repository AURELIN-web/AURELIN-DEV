import { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { getPublishedJournalPosts } from "@/lib/queries";
import { formatDate } from "@/lib/utils/format";

export const metadata: Metadata = {
  title: "The Journal",
  description: "Essays, sartorial insights, styling guides, and brand stories from the AURELIN atelier.",
};

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function JournalPage() {
  const posts = (await getPublishedJournalPosts(20)) as any[];

  return (
    <div className="container-luxury py-16 md:py-24">
      <div className="text-center mb-16">
        <p
          className="mb-3"
          style={{
            fontFamily: "var(--font-inter)",
            fontSize: "0.625rem",
            letterSpacing: "0.22em",
            textTransform: "uppercase",
            color: "#B9A77A",
          }}
        >
          MAISON NOTES
        </p>
        <h1
          style={{
            fontFamily: "var(--font-cormorant)",
            fontSize: "clamp(2.25rem, 5vw, 3.5rem)",
            fontWeight: 400,
            color: "#172744",
          }}
        >
          The Aurelin Journal
        </h1>
      </div>

      {posts.length === 0 ? (
        <div className="py-20 text-center max-w-sm mx-auto">
          <p className="text-navy text-xl font-normal mb-2" style={{ fontFamily: "var(--font-cormorant)" }}>
            New Stories Coming Soon
          </p>
          <p className="opacity-60 text-sm" style={{ fontFamily: "var(--font-inter)" }}>
            Our upcoming essays and sartorial guides are currently being penned.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {posts.map((post) => (
            <article key={post.id} className="group flex flex-col">
              <Link href={`/journal/${post.slug}`} className="block relative aspect-[16/10] overflow-hidden mb-4 bg-beige/30">
                {post.cover_image_url && (
                  <Image
                    src={post.cover_image_url}
                    alt={post.title}
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                )}
              </Link>

              <div className="flex items-center gap-3 text-xs opacity-50 mb-2" style={{ fontFamily: "var(--font-inter)" }}>
                <span>{post.published_at ? formatDate(post.published_at) : formatDate(post.created_at)}</span>
                <span>·</span>
                <span>By {post.author}</span>
              </div>

              <Link href={`/journal/${post.slug}`}>
                <h2
                  className="text-navy text-xl font-normal group-hover:opacity-75 transition-opacity mb-2 leading-snug"
                  style={{ fontFamily: "var(--font-cormorant)" }}
                >
                  {post.title}
                </h2>
              </Link>

              {post.excerpt && (
                <p className="opacity-70 text-sm line-clamp-3 leading-relaxed mb-4" style={{ fontFamily: "var(--font-inter)" }}>
                  {post.excerpt}
                </p>
              )}

              <Link
                href={`/journal/${post.slug}`}
                className="mt-auto label-uppercase text-navy text-xs tracking-widest font-medium hover:opacity-70 transition-opacity"
              >
                READ ARTICLE →
              </Link>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
