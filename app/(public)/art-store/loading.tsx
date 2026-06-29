import { SkeletonCard, Skeleton } from "@/components/ui/Skeleton"

export default function Loading() {
  return (
    <div style={{ paddingTop: "var(--nav-height)" }}>
      <div style={{ background: "var(--green-deep)", padding: "var(--space-8) 0 var(--space-7)" }}>
        <div className="container">
          <Skeleton style={{ height: 12, width: 130, marginBottom: "var(--space-3)", background: "rgba(255,255,255,0.15)" }} />
          <Skeleton style={{ height: 44, width: 220, background: "rgba(255,255,255,0.15)" }} />
        </div>
      </div>
      <div className="container" className="store-layout">
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
          {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} style={{ height: 28, borderRadius: "var(--radius-md)" }} />)}
        </div>
        <div className="art-grid">
          {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      </div>
    </div>
  )
}

