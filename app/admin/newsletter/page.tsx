import { db } from "@/lib/db"
import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { hasRole, CONTENT_ROLES } from "@/lib/permissions"
import { AdminPageHeader } from "@/components/admin/AdminPageChrome"
import { NewsletterComposer } from "@/components/admin/NewsletterComposer"

export const dynamic = "force-dynamic"

function fmtDate(d: Date) {
  return new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })
}

export default async function AdminNewsletterPage() {
  const session = await auth()
  if (!hasRole(session?.user?.role as string | undefined, CONTENT_ROLES)) redirect("/admin")

  const subscribers = await db.contactInquiry.findMany({
    where: { subject: "Newsletter Subscription" },
    orderBy: { createdAt: "desc" },
    distinct: ["email"],
    select: { email: true, createdAt: true },
  })

  return (
    <div>
      <AdminPageHeader
        eyebrow="Content"
        title="Newsletter"
        description="Everyone who subscribed via the 'Join our journal' footer form. Compose a message below to email all of them at once."
      />

      <div className="vac-dashboard-panels-grid">
        <section className="admin-card">
          <div className="admin-card__header">
            <h3>Compose Broadcast</h3>
            <p>Sent as a branded email to every subscriber below.</p>
          </div>
          <div className="admin-card__body">
            <NewsletterComposer subscriberCount={subscribers.length} />
          </div>
        </section>

        <section className="admin-card">
          <div className="admin-card__header">
            <h3>Subscribers</h3>
            <p>{subscribers.length} total</p>
          </div>
          <div className="admin-card__body admin-card__body--flush">
            {subscribers.length === 0 ? (
              <p style={{ color: "var(--text-muted)", textAlign: "center", padding: "var(--space-8)" }}>No subscribers yet.</p>
            ) : (
              <div className="admin-table-wrap" style={{ maxHeight: 480, overflowY: "auto" }}>
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Email</th>
                      <th>Joined</th>
                    </tr>
                  </thead>
                  <tbody>
                    {subscribers.map((s) => (
                      <tr key={s.email}>
                        <td>{s.email}</td>
                        <td style={{ color: "var(--text-muted)", fontSize: "var(--text-caption)" }}>{fmtDate(s.createdAt)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  )
}
