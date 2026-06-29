import Link from "next/link"
import Image from "next/image"
import { formatDate } from "@/lib/utils"
import { MotionCard } from "./MotionCard"

interface StoryCardProps {
  post: {
    id: string
    title: string
    slug: string
    excerpt: string | null
    category: string | null
    publishedAt: Date | string | null
    featuredImageUrl: string | null
  }
}

export function StoryCard({ post }: StoryCardProps) {
  return (
    <MotionCard className="story-card">
      <Link href={`/blog/${post.slug}`} className="story-card__media media media--16x9" style={{ display: "block" }}>
        {post.featuredImageUrl ? (
          <Image
            src={post.featuredImageUrl}
            alt={post.title}
            fill
            unoptimized
            sizes="33vw"
            style={{ objectFit: "cover" }}
          />
        ) : (
          <div style={{ position: "absolute", inset: 0, background: "var(--green-tint)" }} />
        )}
        {post.category && (
          <span className="chip chip--accent" style={{ position: "absolute", top: "var(--space-3)", left: "var(--space-3)", zIndex: 2 }}>
            {post.category}
          </span>
        )}
      </Link>
      <p className="story-card__date">{formatDate(post.publishedAt ?? new Date())}</p>
      <h3><Link href={`/blog/${post.slug}`}>{post.title}</Link></h3>
      {post.excerpt && <span>{post.excerpt}</span>}
      <Link href={`/blog/${post.slug}`} className="story-card__action">Read story →</Link>
    </MotionCard>
  )
}
