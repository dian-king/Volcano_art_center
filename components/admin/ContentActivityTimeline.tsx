import { PlusCircle, Edit3, Eye, Archive, MapPin, FilePlus, Send, Star, XCircle, UserCheck, UserX, Activity } from "lucide-react"
import type { ContentDashboardData } from "@/lib/content-dashboard"

type Log = ContentDashboardData["recentActivity"][0]

const EVENT_MAP: Record<string, { icon: React.ReactNode; label: string }> = {
  PRODUCT_CREATED:             { icon: <PlusCircle size={14} />, label: "Product Created" },
  PRODUCT_UPDATED:             { icon: <Edit3 size={14} />, label: "Product Updated" },
  PRODUCT_PUBLISHED:           { icon: <Eye size={14} />, label: "Product Published" },
  PRODUCT_ARCHIVED:            { icon: <Archive size={14} />, label: "Product Archived" },
  EXPERIENCE_CREATED:          { icon: <MapPin size={14} />, label: "Experience Created" },
  EXPERIENCE_UPDATED:          { icon: <Edit3 size={14} />, label: "Experience Updated" },
  EXPERIENCE_PUBLISHED:        { icon: <Eye size={14} />, label: "Experience Published" },
  BLOG_POST_CREATED:           { icon: <FilePlus size={14} />, label: "Blog Post Created" },
  BLOG_POST_PUBLISHED:         { icon: <Send size={14} />, label: "Blog Post Published" },
  REVIEW_APPROVED:             { icon: <Star size={14} />, label: "Review Approved" },
  REVIEW_REJECTED:             { icon: <XCircle size={14} />, label: "Review Rejected" },
  TALENT_APPLICATION_APPROVED: { icon: <UserCheck size={14} />, label: "Talent Approved" },
  TALENT_APPLICATION_REJECTED: { icon: <UserX size={14} />, label: "Talent Rejected" },
}

function formatDateTime(date: Date): string {
  return date.toLocaleDateString("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })
}

export function ContentActivityTimeline({ logs }: { logs: ContentDashboardData["recentActivity"] }) {
  return (
    <section className="admin-card" aria-labelledby="activity-title">
      <div className="admin-card__header">
        <div className="admin-card__header-row">
          <div>
            <h3 id="activity-title">Recent Activity</h3>
            <p>Content events from the audit log.</p>
          </div>
          <a className="btn btn--secondary btn--sm" href="/admin/audit">View full log</a>
        </div>
      </div>
      <div className="admin-card__body admin-card__body--flush">
        {logs.length === 0 ? (
          <div style={{ padding: "48px 24px", textAlign: "center", color: "var(--text-muted)" }}>
            <p>No recent activity to show.</p>
          </div>
        ) : (
          <div className="vac-activity-timeline">
            {logs.map(log => {
              const event = EVENT_MAP[log.eventType] ?? { icon: <Activity size={14} />, label: log.eventType.replace(/_/g, " ") }
              return (
                <div key={log.id} className="vac-activity-item">
                  <div className="vac-activity-icon" aria-hidden="true">{event.icon}</div>
                  <div className="vac-activity-details">
                    <div className="vac-activity-title">
                      <strong>{event.label}</strong>
                      <time className="vac-activity-time">{formatDateTime(log.createdAt)}</time>
                    </div>
                    {log.details && <p className="vac-activity-desc">{log.details}</p>}
                    <small className="vac-activity-actor">{log.actorEmail ?? "System"}</small>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </section>
  )
}
