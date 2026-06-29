import { Skeleton } from "@/components/ui/Skeleton"

export default function Loading() {
  return (
    <div style={{ paddingTop: "var(--nav-height)" }}>
      <div style={{ background: "var(--green-deep)", padding: "var(--space-8) 0 var(--space-7)" }}>
        <div className="container">
          <Skeleton style={{ height: 12, width: 120, marginBottom: "var(--space-3)", background: "rgba(255,255,255,0.15)" }} />
          <Skeleton style={{ height: 44, width: 280, background: "rgba(255,255,255,0.15)" }} />
        </div>
      </div>
      <div className="container" style={{ paddingBlock: "var(--space-8)" }}>
        {/* 3-col talent card grid */}
        <div className="talent-grid">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} style={{ background: "var(--surface-raised)", border: "1px solid var(--border-subtle)", borderRadius: "var(--radius-lg)", overflow: "hidden" }}>
              <Skeleton style={{ aspectRatio: "4/3" }} />
              <div style={{ padding: "var(--space-4)", display: "flex", flexDirection: "column", gap: "var(--space-2)" }}>
                <Skeleton style={{ height: 16, width: "70%" }} />
                <Skeleton style={{ height: 12, width: "50%" }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

