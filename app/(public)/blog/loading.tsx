import { SkeletonStoryCard, Skeleton } from "@/components/ui/Skeleton"

export default function Loading() {
  return (
    <div style={{ paddingTop: "var(--nav-height)" }}>
      <div style={{ background: "var(--green-deep)", padding: "var(--space-8) 0 var(--space-7)" }}>
        <div className="container">
          <Skeleton style={{ height: 12, width: 180, marginBottom: "var(--space-3)", background: "rgba(255,255,255,0.15)" }} />
          <Skeleton style={{ height: 44, width: 240, background: "rgba(255,255,255,0.15)" }} />
        </div>
      </div>
      <div className="container" style={{ paddingBlock: "var(--space-8)" }}>
        {/* Featured post skeleton */}
        <div className="blog-featured">
          <Skeleton style={{ aspectRatio: "4/3", borderRadius: 0 }} />
          <div style={{ padding: "var(--space-7)", display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
            <Skeleton style={{ height: 12, width: "30%" }} />
            <Skeleton style={{ height: 28, width: "90%" }} />
            <Skeleton style={{ height: 12, width: "100%" }} />
            <Skeleton style={{ height: 12, width: "80%" }} />
          </div>
        </div>
        <div className="story-grid">
          {Array.from({ length: 3 }).map((_, i) => <SkeletonStoryCard key={i} />)}
        </div>
      </div>
    </div>
  )
}

