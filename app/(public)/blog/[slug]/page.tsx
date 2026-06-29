import { db } from "@/lib/db"
import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"
import { formatDate } from "@/lib/utils"
import { StoryCard } from "@/components/public/StoryCard"
import type { Metadata } from "next"

export const revalidate = 3600

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const post = await db.blogPost.findUnique({ where: { slug } })
  if (!post) return {}
  return {
    title: post.seoTitle || post.title,
    description: post.seoDesc || post.excerpt || undefined,
    openGraph: {
      title: post.title,
      description: post.excerpt ?? undefined,
      images: post.featuredImageUrl ? [post.featuredImageUrl] : [],
    },
  }
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const post = await db.blogPost.findUnique({ where: { slug, published: true } })
  if (!post) notFound()

  // Fire-and-forget — don't await
  db.blogPost.update({ where: { id: post.id }, data: { viewCount: { increment: 1 } } }).catch(() => {})

  const related = await db.blogPost.findMany({
    where: { published: true, category: post.category, NOT: { id: post.id } },
    orderBy: { publishedAt: "desc" },
    take: 3,
    select: { id: true, title: true, slug: true, excerpt: true, category: true, publishedAt: true, featuredImageUrl: true }
  })

  return (
    <div style={{ paddingTop: "var(--nav-height)" }}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Article",
            headline: post.title,
            description: post.excerpt ?? undefined,
            image: post.featuredImageUrl ?? undefined,
            datePublished: (post.publishedAt ?? post.createdAt).toISOString(),
            dateModified: post.updatedAt.toISOString(),
            publisher: {
              "@type": "Organization",
              name: "Volcano Arts Center Inc Rwanda",
              logo: { "@type": "ImageObject", url: `${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}/images/logo.png` }
            }
          })
        }}
      />
      {/* Hero */}
      <div style={{ background: "var(--green-deep)", padding: "var(--space-8) 0 var(--space-7)" }}>
        <div className="container" style={{ maxWidth: "var(--container-narrow)" }}>
          <Link href="/blog" style={{ fontFamily: "var(--font-ui)", fontSize: "var(--text-small)", color: "rgba(255,255,255,0.65)", display: "inline-flex", alignItems: "center", gap: "var(--space-2)", marginBottom: "var(--space-4)", textDecoration: "none" }}>
            ← Blog & Stories
          </Link>
          {post.category && (
            <span className="chip chip--accent" style={{ marginBottom: "var(--space-4)", display: "inline-flex" }}>{post.category}</span>
          )}
          <h1 style={{ fontFamily: "var(--font-display)", fontSize: "var(--text-headline)", fontWeight: 600, color: "#fff", lineHeight: 1.15 }}>
            {post.title}
          </h1>
          {post.excerpt && (
            <p style={{ color: "rgba(255,255,255,0.75)", fontSize: "var(--text-lead)", marginTop: "var(--space-3)" }}>
              {post.excerpt}
            </p>
          )}
          <time style={{ display: "block", fontFamily: "var(--font-mono)", fontSize: "var(--text-caption)", color: "rgba(255,255,255,0.55)", marginTop: "var(--space-4)" }}>
            {formatDate(post.publishedAt ?? post.createdAt)}
          </time>
        </div>
      </div>

      {/* Featured image */}
      {post.featuredImageUrl && (
        <div style={{ maxWidth: "var(--container-narrow)", margin: "0 auto", padding: "0 clamp(var(--space-4), 5vw, var(--space-8))" }}>
          <div style={{ position: "relative", aspectRatio: "16/9", borderRadius: "var(--radius-lg)", overflow: "hidden", marginTop: "var(--space-7)" }}>
            <Image src={post.featuredImageUrl} alt={post.title} fill unoptimized style={{ objectFit: "cover" }} />
          </div>
        </div>
      )}

      {/* Content */}
      <article style={{ maxWidth: "var(--container-narrow)", margin: "0 auto", padding: "var(--space-8) clamp(var(--space-4), 5vw, var(--space-8))" }}>
        <div
          className="blog-content"
          style={{ fontFamily: "var(--font-body)", fontSize: "var(--text-lead)", lineHeight: 1.8, color: "var(--text-primary)" }}
          dangerouslySetInnerHTML={{ __html: post.content }}
        />

        {post.tags.length > 0 && (
          <div style={{ display: "flex", gap: "var(--space-2)", flexWrap: "wrap", marginTop: "var(--space-8)", paddingTop: "var(--space-6)", borderTop: "1px solid var(--border-subtle)" }}>
            {post.tags.map(tag => (
              <span key={tag} className="chip chip--neutral">{tag}</span>
            ))}
          </div>
        )}

        {related.length > 0 && (
          <div style={{ borderTop: "1px solid var(--border-subtle)", paddingTop: "var(--space-8)", marginTop: "var(--space-8)" }}>
            <h3 style={{ fontFamily: "var(--font-display)", fontSize: "var(--text-title)", fontWeight: 600, marginBottom: "var(--space-6)" }}>
              More Stories
            </h3>
            <div className="story-grid">
              {related.map(p => <StoryCard key={p.id} post={p} />)}
            </div>
          </div>
        )}

        <div style={{ marginTop: "var(--space-8)" }}>
          <Link href="/blog" className="btn btn--ghost">← Back to Blog</Link>
        </div>
      </article>
    </div>
  )
}
