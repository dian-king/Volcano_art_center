import { CheckCircle } from "lucide-react"
import type { ContentDashboardData } from "@/lib/content-dashboard"

export function ContentAttentionList({ kpis }: { kpis: ContentDashboardData["kpis"] }) {
  const items = [
    { label: "Reviews to Moderate", count: kpis.pendingReviews, href: "/admin/reviews" },
    { label: "Testimonials to Publish", count: kpis.pendingTestimonials, href: "/admin/reviews" },
    { label: "Talent Applications", count: kpis.pendingTalentApplications, href: "/admin/applications" },
    { label: "Products in Draft", count: kpis.draftProducts, href: "/admin/products" },
    { label: "Unpublished Experiences", count: kpis.totalExperiences - kpis.publishedExperiences, href: "/admin/experiences" },
  ].filter(i => i.count > 0)

  return (
    <section className="admin-card" aria-labelledby="attn-title">
      <div className="admin-card__header">
        <h3 id="attn-title">Needs Attention</h3>
        <p>Content queues awaiting your action.</p>
      </div>
      <div className="admin-card__body admin-card__body--flush">
        {items.length === 0 ? (
          <div style={{ padding: "32px 24px", textAlign: "center" }}>
            <CheckCircle size={32} style={{ color: "var(--green)", margin: "0 auto var(--space-3)", display: "block" }} />
            <p style={{ color: "var(--green)", fontWeight: 600, marginBottom: "var(--space-1)" }}>All content is up to date.</p>
            <p style={{ color: "var(--text-muted)", fontSize: "var(--text-small)" }}>No items need your attention right now.</p>
          </div>
        ) : (
          <div className="vac-attention-list">
            {items.map(({ label, count, href }) => (
              <a key={label} className="vac-attention-item" href={href}>
                <span className="vac-attention-title">{label}</span>
                <span className="vac-attention-badge">{count}</span>
              </a>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
