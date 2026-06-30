import { markOperatorNotificationsReadAction } from "@/actions/tour-operators"
import { db } from "@/lib/db"
import { getPortalSession } from "@/lib/portal-session"
import { Bell, CheckCircle2 } from "lucide-react"
import Link from "next/link"
import { redirect } from "next/navigation"

export const dynamic = "force-dynamic"

const card: React.CSSProperties = {
  background: "var(--surface-raised)",
  border: "1px solid var(--border-subtle)",
  borderRadius: "var(--radius-lg)",
  padding: "var(--space-5)",
}

export default async function OperatorNotificationsPage() {
  const session = await getPortalSession()
  if (!session?.user?.id) redirect("/login?next=/tour-operators/portal/notifications")

  const notifications = await db.notification.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    take: 50,
  })
  const unread = notifications.filter(item => !item.read).length

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-6)" }}>
      <header style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "var(--space-4)" }}>
        <div>
          <span className="eyebrow">Operator Portal</span>
          <h1 style={{ fontFamily: "var(--font-display)", fontSize: "var(--text-headline)", fontWeight: 600 }}>Notifications</h1>
          <p style={{ color: "var(--text-secondary)", marginTop: "var(--space-2)" }}>Status updates, quotation notes, and operational alerts for your company requests.</p>
        </div>
        {unread > 0 && (
          <form action={markOperatorNotificationsReadAction}>
            <button type="submit" className="btn btn--primary btn--sm" style={{ display: "inline-flex", gap: "var(--space-2)" }}>
              <CheckCircle2 size={16} />
              Mark read
            </button>
          </form>
        )}
      </header>

      <section style={card}>
        {notifications.length === 0 ? (
          <div style={{ textAlign: "center", padding: "var(--space-8)", color: "var(--text-muted)" }}>
            <Bell size={28} />
            <p style={{ marginTop: "var(--space-3)" }}>No notifications yet.</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
            {notifications.map(item => (
              <article key={item.id} style={{ border: "1px solid var(--border-subtle)", borderRadius: "var(--radius-md)", padding: "var(--space-4)", background: item.read ? "var(--surface-base)" : "rgba(0, 166, 81, 0.08)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: "var(--space-3)", alignItems: "flex-start" }}>
                  <div>
                    <p style={{ fontFamily: "var(--font-ui)", fontWeight: 700 }}>{item.title}</p>
                    <p style={{ color: "var(--text-secondary)", fontSize: "var(--text-small)", lineHeight: 1.6, marginTop: 4 }}>{item.body}</p>
                    <p style={{ color: "var(--text-muted)", fontSize: "var(--text-caption)", marginTop: "var(--space-2)" }}>
                      {item.createdAt.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                    </p>
                  </div>
                  {!item.read && <span className="nav-badge">New</span>}
                </div>
                {item.ctaUrl && (
                  <Link href={item.ctaUrl} className="btn btn--ghost btn--sm" style={{ marginTop: "var(--space-3)" }}>
                    Open
                  </Link>
                )}
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
