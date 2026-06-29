"use client"
import { useEffect } from "react"
import { AlertTriangle } from "lucide-react"

export default function ContentDashboardError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => { console.error("Content dashboard error:", error) }, [error])
  return (
    <div className="admin-card" style={{ padding: "48px 32px", textAlign: "center", maxWidth: 480, margin: "var(--space-8) auto" }}>
      <AlertTriangle size={40} style={{ color: "var(--earth)", margin: "0 auto var(--space-4)", display: "block" }} />
      <h2 style={{ fontFamily: "var(--font-display)", fontSize: "var(--text-title)", marginBottom: "var(--space-2)" }}>Dashboard failed to load</h2>
      <p style={{ color: "var(--text-muted)", marginBottom: "var(--space-6)" }}>
        There was a problem fetching your content data. Please try again.
      </p>
      <button className="btn btn--primary" onClick={reset}>Retry</button>
    </div>
  )
}
