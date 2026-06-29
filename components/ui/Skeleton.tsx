// Thin wrapper around the .skeleton CSS class already defined in globals.css
export function Skeleton({ style }: { style?: React.CSSProperties }) {
  return <div className="skeleton" style={{ borderRadius: "var(--radius-sm)", ...style }} />
}

export function SkeletonCard({ style }: { style?: React.CSSProperties }) {
  return (
    <div style={{ background: "var(--surface-raised)", border: "1px solid var(--border-subtle)", borderRadius: "var(--radius-lg)", overflow: "hidden", ...style }}>
      <Skeleton style={{ width: "100%", aspectRatio: "4/3" }} />
      <div style={{ padding: "var(--space-4)", display: "flex", flexDirection: "column", gap: "var(--space-2)" }}>
        <Skeleton style={{ height: 12, width: "40%", borderRadius: "var(--radius-sm)" }} />
        <Skeleton style={{ height: 16, width: "80%" }} />
        <Skeleton style={{ height: 12, width: "60%" }} />
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: "var(--space-2)" }}>
          <Skeleton style={{ height: 20, width: "30%" }} />
          <Skeleton style={{ height: 32, width: 32, borderRadius: "50%" }} />
        </div>
      </div>
    </div>
  )
}

export function SkeletonExpCard() {
  return (
    <div style={{ background: "var(--surface-raised)", border: "1px solid var(--border-subtle)", borderRadius: "var(--radius-lg)", overflow: "hidden" }}>
      <Skeleton style={{ width: "100%", aspectRatio: "16/9" }} />
      <div style={{ padding: "var(--space-4)", display: "flex", flexDirection: "column", gap: "var(--space-2)" }}>
        <Skeleton style={{ height: 12, width: "30%" }} />
        <Skeleton style={{ height: 18, width: "75%" }} />
        <Skeleton style={{ height: 12, width: "90%" }} />
        <Skeleton style={{ height: 12, width: "70%" }} />
      </div>
    </div>
  )
}

export function SkeletonStoryCard() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
      <Skeleton style={{ width: "100%", aspectRatio: "16/9", borderRadius: "var(--radius-lg)" }} />
      <Skeleton style={{ height: 12, width: "25%" }} />
      <Skeleton style={{ height: 18, width: "85%" }} />
      <Skeleton style={{ height: 12, width: "65%" }} />
    </div>
  )
}

export function SkeletonCampaignCard() {
  return (
    <div style={{ background: "var(--surface-raised)", border: "1px solid var(--border-subtle)", borderRadius: "var(--radius-lg)", overflow: "hidden" }}>
      <Skeleton style={{ width: "100%", aspectRatio: "16/9" }} />
      <div style={{ padding: "var(--space-5)", display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
        <Skeleton style={{ height: 20, width: "70%" }} />
        <Skeleton style={{ height: 12, width: "100%" }} />
        <Skeleton style={{ height: 12, width: "85%" }} />
        <Skeleton style={{ height: 8, width: "100%", borderRadius: "var(--radius-pill)", marginTop: "var(--space-1)" }} />
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <Skeleton style={{ height: 12, width: "25%" }} />
          <Skeleton style={{ height: 12, width: "30%" }} />
        </div>
      </div>
    </div>
  )
}
