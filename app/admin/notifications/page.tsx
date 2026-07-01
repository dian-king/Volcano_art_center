import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { redirect } from "next/navigation"
import { markNotificationsRead } from "@/actions/admin-notifications"
import Link from "next/link"
import { Bell, Package, CalendarCheck, Heart, Mail, Info, CheckCheck } from "lucide-react"

const TYPE_META: Record<string, { icon: typeof Bell; color: string; label: string }> = {
  ORDER:   { icon: Package,       color: "#00A651", label: "Order"    },
  BOOKING: { icon: CalendarCheck, color: "#1B6CA8", label: "Booking"  },
  DONATION:{ icon: Heart,         color: "#C0392B", label: "Donation" },
  INQUIRY: { icon: Mail,          color: "#8E44AD", label: "Inquiry"  },
  INFO:    { icon: Info,          color: "#7F8C8D", label: "Info"     },
}

function timeAgo(date: Date) {
  const diff = (Date.now() - date.getTime()) / 1000
  if (diff < 60)    return "just now"
  if (diff < 3600)  return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  return date.toLocaleDateString("en-GB", { day: "numeric", month: "short" })
}

export default async function NotificationsPage() {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")

  const notifications = await db.notification.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    take: 100,
  })

  const unreadIds = notifications.filter(n => !n.read).map(n => n.id)

  return (
    <div style={{ maxWidth: 720 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "var(--space-6)" }}>
        <div>
          <h1 style={{ fontFamily: "var(--font-display)", fontSize: "var(--text-headline)", fontWeight: 600 }}>Notifications</h1>
          {unreadIds.length > 0 && (
            <p style={{ color: "var(--text-muted)", fontSize: "var(--text-small)", marginTop: 4 }}>
              {unreadIds.length} unread
            </p>
          )}
        </div>
        {unreadIds.length > 0 && (
          <form action={markNotificationsRead}>
            <input type="hidden" name="ids" value={unreadIds.join(",")} />
            <button type="submit" className="btn btn--ghost btn--sm" style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <CheckCheck size={14} /> Mark all read
            </button>
          </form>
        )}
      </div>

      {notifications.length === 0 ? (
        <div style={{ textAlign: "center", padding: "var(--space-10) 0", color: "var(--text-muted)" }}>
          <Bell size={40} style={{ marginBottom: "var(--space-3)", opacity: 0.3 }} />
          <p>No notifications yet</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-2)" }}>
          {notifications.map(n => {
            const meta = TYPE_META[n.type] ?? TYPE_META.INFO
            const Icon = meta.icon
            return (
              <Link
                key={n.id}
                href={n.ctaUrl ?? "/admin"}
                style={{ textDecoration: "none" }}
              >
                <div style={{
                  display: "flex", gap: "var(--space-4)", alignItems: "flex-start",
                  background: n.read ? "var(--surface)" : "var(--surface-raised)",
                  border: `1px solid ${n.read ? "var(--border-subtle)" : "var(--green-mid)"}`,
                  borderLeft: `4px solid ${n.read ? "var(--border-subtle)" : meta.color}`,
                  borderRadius: "var(--radius-md)",
                  padding: "var(--space-4) var(--space-5)",
                  transition: "background 0.15s",
                }}>
                  <div style={{ marginTop: 2, color: meta.color, flexShrink: 0 }}>
                    <Icon size={18} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: "var(--space-4)" }}>
                      <span style={{ fontWeight: n.read ? 400 : 700, fontSize: "var(--text-body)", color: "var(--text-primary)" }}>
                        {n.title}
                      </span>
                      <span style={{ fontSize: "var(--text-caption)", color: "var(--text-muted)", flexShrink: 0 }}>
                        {timeAgo(new Date(n.createdAt))}
                      </span>
                    </div>
                    <p style={{ margin: "2px 0 0", fontSize: "var(--text-small)", color: "var(--text-secondary)", lineHeight: 1.5 }}>
                      {n.body}
                    </p>
                    <span style={{ display: "inline-block", marginTop: 6, fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: meta.color }}>
                      {meta.label}
                    </span>
                  </div>
                  {!n.read && (
                    <div style={{ width: 8, height: 8, borderRadius: "50%", background: meta.color, flexShrink: 0, marginTop: 6 }} />
                  )}
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
