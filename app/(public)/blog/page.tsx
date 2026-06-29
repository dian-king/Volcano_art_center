import { db } from "@/lib/db"
import { StoryCard } from "@/components/public/StoryCard"
import { EmptyState } from "@/components/ui/EmptyState"
import Link from "next/link"
import Image from "next/image"
import { BookOpen } from "lucide-react"
import { formatDate } from "@/lib/utils"
import type { Metadata } from "next"

export const revalidate = 3600
export const metadata: Metadata = {
  title: "Blog & Stories",
  description: "Insights, stories, and updates from the Volcano Arts Center community.",
}

export default async function BlogPage() {
  const posts = await db.blogPost.findMany({
    where: { published: true },
    orderBy: { publishedAt: "desc" },
  })

  const [featured, ...rest] = posts

  return (
    <div style={{ paddingTop: "var(--nav-height)" }}>
      {/* Header */}
      <div style={{ background: "var(--green-deep)", padding: "var(--space-8) 0 var(--space-7)" }}>
        <div className="container">
          <span className="eyebrow" style={{ color: "rgba(255,255,255,0.65)" }}>From the Heart of Rwanda</span>
          <h1 style={{ fontFamily: "var(--font-display)", fontSize: "var(--text-headline)", fontWeight: 600, marginTop: "var(--space-2)", color: "#fff" }}>
            Blog & Stories
          </h1>
          <p style={{ color: "rgba(255,255,255,0.75)", fontSize: "var(--text-lead)", marginTop: "var(--space-3)" }}>
            Art, culture, and community from the heart of Rwanda
          </p>
        </div>
      </div>

      <div className="container" style={{ paddingBlock: "var(--space-8)" }}>
        {posts.length === 0 ? (
          <EmptyState icon={BookOpen} title="No stories published yet" description="Check back soon." />
        ) : (
          <>
            {/* Featured post */}
            {featured && (
              <Link href={`/blog/${featured.slug}`} className="blog-featured">
                <div style={{ position: "relative", aspectRatio: "4/3", background: "var(--green-tint)" }}>
                  {featured.featuredImageUrl && (
                    <Image src={featured.featuredImageUrl} alt={featured.title} fill unoptimized style={{ objectFit: "cover" }} />
                  )}
                  {featured.category && (
                    <span className="chip chip--accent" style={{ position: "absolute", top: "var(--space-3)", left: "var(--space-3)", zIndex: 2 }}>
                      {featured.category}
                    </span>
                  )}
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
                  <span style={{ fontFamily: "var(--font-ui)", fontSize: "var(--text-caption)", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--green)" }}>
                    Featured
                  </span>
                  <h2 style={{ fontFamily: "var(--font-display)", fontSize: "var(--text-title)", fontWeight: 600, color: "var(--text-primary)", lineHeight: 1.25 }}>
                    {featured.title}
                  </h2>
                  {featured.excerpt && (
                    <p style={{ color: "var(--text-secondary)", fontSize: "var(--text-body)", lineHeight: 1.6 }}>
                      {featured.excerpt}
                    </p>
                  )}
                  <time style={{ fontFamily: "var(--font-mono)", fontSize: "var(--text-caption)", color: "var(--text-muted)" }}>
                    {formatDate(featured.publishedAt ?? featured.createdAt)}
                  </time>
                  <span style={{ fontFamily: "var(--font-ui)", fontWeight: 600, fontSize: "var(--text-small)", color: "var(--green)", marginTop: "var(--space-2)" }}>
                    Read story →
                  </span>
                </div>
              </Link>
            )}

            {/* Rest of posts */}
            {rest.length > 0 && (
              <div className="story-grid">
                {rest.map((p) => <StoryCard key={p.id} post={p} />)}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
