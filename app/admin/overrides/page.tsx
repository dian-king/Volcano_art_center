import { db } from "@/lib/db"
import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { hasRole, SUPER_ROLES } from "@/lib/permissions"
import { AdminPageHeader } from "@/components/admin/AdminPageChrome"
import { StatusOverrideControl } from "@/components/admin/StatusOverrideControl"

export const dynamic = "force-dynamic"

const ORDER_STATUSES = ["PENDING", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED", "REFUNDED"]
const DONATION_STATUSES = ["PENDING", "COMPLETED", "FAILED", "REFUNDED", "CANCELLED"]

function fmtDate(d: Date) {
  return new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })
}

const th = { padding: "var(--space-3)", textAlign: "left" as const, fontSize: "var(--text-caption)", color: "var(--text-muted)" }
const td = { padding: "var(--space-3)", verticalAlign: "middle" as const }

export default async function AdminOverridesPage() {
  const session = await auth()
  if (!hasRole(session?.user?.role as string | undefined, SUPER_ROLES)) redirect("/admin")

  const [orders, donations] = await Promise.all([
    db.order.findMany({ orderBy: { createdAt: "desc" }, take: 50, include: { user: { select: { email: true } } } }),
    db.donation.findMany({ orderBy: { createdAt: "desc" }, take: 50, include: { campaign: { select: { name: true } } } }),
  ])

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-8)" }}>
      <AdminPageHeader
        eyebrow="Super Admin"
        title="Overrides & Refunds"
        description="Manually correct records when something goes wrong — mark an order refunded, confirm or cancel a donation. Donation changes automatically reconcile the campaign total."
      />

      {/* ── ORDERS ── */}
      <section>
        <h2 style={{ fontFamily: "var(--font-ui)", fontWeight: 700, fontSize: "var(--text-title)", marginBottom: "var(--space-4)" }}>Orders</h2>
        {orders.length === 0 ? <p style={{ color: "var(--text-muted)" }}>No orders yet.</p> : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead><tr style={{ borderBottom: "1px solid var(--border-subtle)" }}>
                <th style={th}>Date</th><th style={th}>Reference</th><th style={th}>Customer</th><th style={th}>Total</th><th style={th}>Status</th><th style={{ ...th, textAlign: "right" }}>Override</th>
              </tr></thead>
              <tbody>
                {orders.map((o) => (
                  <tr key={o.id} style={{ borderBottom: "1px solid var(--border-subtle)" }}>
                    <td style={{ ...td, whiteSpace: "nowrap", fontSize: "var(--text-caption)", color: "var(--text-muted)" }}>{fmtDate(o.createdAt)}</td>
                    <td style={{ ...td, fontFamily: "var(--font-mono)", fontSize: "var(--text-caption)" }}>{o.reference}</td>
                    <td style={{ ...td, fontSize: "var(--text-small)" }}>{o.user?.email ?? "—"}</td>
                    <td style={{ ...td, fontFamily: "var(--font-mono)", fontWeight: 700 }}>${Number(o.total).toLocaleString()}</td>
                    <td style={td}><span className="chip chip--neutral">{o.status}</span></td>
                    <td style={{ ...td, textAlign: "right" }}><StatusOverrideControl kind="order" id={o.id} current={o.status} options={ORDER_STATUSES} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* ── DONATIONS ── */}
      <section>
        <h2 style={{ fontFamily: "var(--font-ui)", fontWeight: 700, fontSize: "var(--text-title)", marginBottom: "var(--space-4)" }}>Donations</h2>
        {donations.length === 0 ? <p style={{ color: "var(--text-muted)" }}>No donations yet.</p> : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead><tr style={{ borderBottom: "1px solid var(--border-subtle)" }}>
                <th style={th}>Date</th><th style={th}>Reference</th><th style={th}>Donor</th><th style={th}>Campaign</th><th style={th}>Amount</th><th style={th}>Status</th><th style={{ ...th, textAlign: "right" }}>Override</th>
              </tr></thead>
              <tbody>
                {donations.map((d) => (
                  <tr key={d.id} style={{ borderBottom: "1px solid var(--border-subtle)" }}>
                    <td style={{ ...td, whiteSpace: "nowrap", fontSize: "var(--text-caption)", color: "var(--text-muted)" }}>{fmtDate(d.createdAt)}</td>
                    <td style={{ ...td, fontFamily: "var(--font-mono)", fontSize: "var(--text-caption)" }}>{d.reference}</td>
                    <td style={{ ...td, fontSize: "var(--text-small)" }}>{d.anonymous || !d.donorName ? "Anonymous" : d.donorName}</td>
                    <td style={{ ...td, fontSize: "var(--text-small)" }}>{d.campaign?.name ?? "—"}</td>
                    <td style={{ ...td, fontFamily: "var(--font-mono)", fontWeight: 700, color: "var(--green)" }}>{Number(d.amount).toLocaleString()}</td>
                    <td style={td}><span className="chip chip--neutral">{d.status}</span></td>
                    <td style={{ ...td, textAlign: "right" }}><StatusOverrideControl kind="donation" id={d.id} current={d.status} options={DONATION_STATUSES} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  )
}
