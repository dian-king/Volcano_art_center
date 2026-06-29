import { SkeletonCampaignCard, Skeleton } from "@/components/ui/Skeleton"

export default function Loading() {
  return (
    <div style={{ paddingTop: "var(--nav-height)" }}>
      <div style={{ background: "var(--green-deep)", padding: "var(--space-8) 0 var(--space-7)" }}>
        <div className="container">
          <Skeleton style={{ height: 12, width: 160, marginBottom: "var(--space-3)", background: "rgba(255,255,255,0.15)" }} />
          <Skeleton style={{ height: 44, width: 220, background: "rgba(255,255,255,0.15)" }} />
        </div>
      </div>
      <div className="container" style={{ paddingBlock: "var(--space-8)" }}>
        <Skeleton style={{ height: 32, width: 200, marginBottom: "var(--space-6)" }} />
        <div className="campaign-grid" style={{ marginBottom: "var(--space-10)" }}>
          {Array.from({ length: 3 }).map((_, i) => <SkeletonCampaignCard key={i} />)}
        </div>
        <Skeleton style={{ height: 28, width: 180, marginBottom: "var(--space-5)" }} />
        <div style={{ maxWidth: 560, display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
          {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} style={{ height: 44, borderRadius: "var(--radius-md)" }} />)}
        </div>
      </div>
    </div>
  )
}
