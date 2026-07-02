import Image from "next/image"
import { Pencil, Inbox } from "lucide-react"
import { TH, TD } from "./AdminForm"
import type { ContentDashboardData } from "@/lib/content-dashboard"

type Item = ContentDashboardData["recentlyUpdatedContent"][0]

function formatRelativeTime(date: Date): string {
  const diff = Date.now() - date.getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  const days = Math.floor(hrs / 24)
  if (days === 1) return "Yesterday"
  if (days < 7) return `${days}d ago`
  return date.toLocaleDateString("en-GB", { day: "numeric", month: "short" })
}

function editHref(item: Item): string {
  if (item.type === "Experience") return `/admin/experiences/${item.id}/edit`
  return `/admin/blog/${item.id}/edit`
}

const TYPE_LABEL: Record<string, string> = { Experience: "Experience", BlogPost: "Blog Post" }
const STATUS_CHIP: Record<string, string> = { PUBLISHED: "chip--success", DRAFT: "chip--neutral", ARCHIVED: "chip--danger" }

export function RecentContentTable({ items }: { items: ContentDashboardData["recentlyUpdatedContent"] }) {
  return (
    <section className="admin-card" aria-labelledby="recent-content-title">
      <div className="admin-card__header">
        <div className="admin-card__header-row">
          <div>
            <h3 id="recent-content-title">Recently Updated</h3>
            <p>Latest edits across experiences and posts.</p>
          </div>
        </div>
      </div>
      <div className="admin-card__body admin-card__body--flush">
        <div className="admin-table-wrap">
          <table className="admin-table" aria-label="Recently updated content">
            <thead>
              <tr>
                {["Title", "Type", "Status", "Updated", ""].map(h => <th key={h} scope="col" style={TH}>{h || <span className="sr-only">Actions</span>}</th>)}
              </tr>
            </thead>
            <tbody>
              {items.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ textAlign: "center", padding: "48px 24px", color: "var(--text-muted)" }}>
                    <Inbox size={32} style={{ margin: "0 auto var(--space-3)", opacity: 0.4 }} />
                    <p style={{ marginBottom: "var(--space-3)" }}>No content has been updated yet.</p>
                    <a href="/admin/blog/new" className="btn btn--primary btn--sm">Write your first post</a>
                  </td>
                </tr>
              ) : items.map(item => (
                <tr key={`${item.type}-${item.id}`}>
                  <td style={TD}>
                    <div style={{ display: "flex", alignItems: "center", gap: "var(--space-3)" }}>
                      <div style={{ width: 32, height: 32, borderRadius: "var(--radius-sm)", overflow: "hidden", flexShrink: 0, background: "var(--green-tint)", position: "relative" }}>
                        {item.imageUrl
                          ? <Image src={item.imageUrl} alt="" fill style={{ objectFit: "cover" }} sizes="32px" />
                          : null}
                      </div>
                      <div>
                        <span className="td-ref">{item.title}</span>
                        {item.type === "BlogPost" && item.category && <div className="td-sub">{item.category}</div>}
                      </div>
                    </div>
                  </td>
                  <td style={TD}><span className="chip chip--neutral">{TYPE_LABEL[item.type]}</span></td>
                  <td style={TD}><span className={`chip ${STATUS_CHIP[item.status] ?? "chip--neutral"}`}>{item.status}</span></td>
                  <td style={TD}>
                    <time dateTime={item.updatedAt.toISOString()} style={{ fontFamily: "var(--font-mono)", fontSize: "var(--text-caption)", color: "var(--text-muted)" }}>
                      {formatRelativeTime(item.updatedAt)}
                    </time>
                  </td>
                  <td style={TD}>
                    <a href={editHref(item)} className="btn btn--ghost btn--sm" aria-label={`Edit ${item.title}`} style={{ display: "inline-flex", alignItems: "center", gap: "var(--space-1)" }}>
                      <Pencil size={13} /> Edit
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  )
}
