import { SkeletonExpCard, Skeleton } from "@/components/ui/Skeleton"

export default function Loading() {
  return (
    <div style={{ paddingTop: "var(--nav-height)" }}>
      <div style={{ background: "var(--green-deep)", padding: "var(--space-8) 0 var(--space-7)" }}>
        <div className="container">
          <Skeleton style={{ height: 12, width: 130, marginBottom: "var(--space-3)", background: "rgba(255,255,255,0.15)" }} />
          <Skeleton style={{ height: 44, width: 260, background: "rgba(255,255,255,0.15)" }} />
        </div>
      </div>
      <div className="container" style={{ paddingBlock: "var(--space-8)" }}>
        <div style={{ display: "flex", gap: "var(--space-2)", marginBottom: "var(--space-7)", flexWrap: "wrap" }}>
          {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} style={{ height: 36, width: 90, borderRadius: "var(--radius-pill)" }} />)}
        </div>
        <div className="exp-grid">
          {Array.from({ length: 6 }).map((_, i) => <SkeletonExpCard key={i} />)}
        </div>
      </div>
    </div>
  )
}
