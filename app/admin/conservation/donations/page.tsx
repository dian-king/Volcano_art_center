import { db } from "@/lib/db"
import { auth } from "@/lib/auth"
import { formatPrice } from "@/lib/utils"
import { redirect } from "next/navigation"
import { hasRole, ADMIN_ROLES, OPS_ROLES } from "@/lib/permissions"
import { AdminPageHeader } from "@/components/admin/AdminPageChrome"
import { ReverseDonationButton } from "@/components/admin/ReverseDonationButton"
import { ApproveDonationButton } from "@/components/admin/ApproveDonationButton"

export const dynamic = "force-dynamic"

const STATUS_CHIP: Record<string, string> = {
  PENDING: "chip--warning",
  COMPLETED: "chip--success",
  CANCELLED: "chip--neutral",
  FAILED: "chip--neutral",
  REFUNDED: "chip--neutral",
}

function fmtDate(d: Date) {
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })
}

export default async function AdminDonationsPage() {
  const session = await auth()
  const role = session?.user?.role as string | undefined
  if (!hasRole(role, ADMIN_ROLES)) redirect("/admin")
  const canManage = hasRole(role, OPS_ROLES) // OPS_MANAGER + SUPER_ADMIN can approve/reverse

  const donations = await db.donation.findMany({
    orderBy: { createdAt: "desc" },
    include: { campaign: { select: { name: true } } },
    take: 200,
  })

  return (
    <div>
      <AdminPageHeader
        eyebrow="Conservation"
        title="Donations"
        description="Every donation counts toward its campaign total immediately. Approve a donation once you've confirmed the MoMo/bank payment arrived, or reverse one that never paid (it's subtracted back out)."
        actionHref="/admin/conservation"
        actionLabel="← Campaigns"
      />

      <div className="admin-results-bar"><span>{donations.length} donation{donations.length === 1 ? "" : "s"}</span><span>Most recent first</span></div>

      {donations.length === 0 ? (
        <p style={{ color: "var(--text-muted)" }}>No donations yet.</p>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table className="admin-table" style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ textAlign: "left", borderBottom: "1px solid var(--border-subtle)" }}>
                <th style={{ padding: "var(--space-3)" }}>Date</th>
                <th style={{ padding: "var(--space-3)" }}>Reference</th>
                <th style={{ padding: "var(--space-3)" }}>Donor</th>
                <th style={{ padding: "var(--space-3)" }}>Campaign</th>
                <th style={{ padding: "var(--space-3)" }}>Amount</th>
                <th style={{ padding: "var(--space-3)" }}>Status</th>
                <th style={{ padding: "var(--space-3)", textAlign: "right" }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {donations.map((d) => {
                const donorLabel = d.anonymous || !d.donorName ? "Anonymous" : d.donorName
                const isCounted = ["PENDING", "COMPLETED"].includes(d.status)
                return (
                  <tr key={d.id} style={{ borderBottom: "1px solid var(--border-subtle)", verticalAlign: "middle" }}>
                    <td style={{ padding: "var(--space-3)", fontSize: "var(--text-caption)", color: "var(--text-muted)", whiteSpace: "nowrap" }}>{fmtDate(d.createdAt)}</td>
                    <td style={{ padding: "var(--space-3)", fontFamily: "var(--font-mono)", fontSize: "var(--text-caption)" }}>{d.reference}</td>
                    <td style={{ padding: "var(--space-3)" }}>
                      <div style={{ fontWeight: 600 }}>{donorLabel}</div>
                      {!d.anonymous && <div style={{ fontSize: "var(--text-caption)", color: "var(--text-muted)" }}>{d.donorEmail}</div>}
                    </td>
                    <td style={{ padding: "var(--space-3)", fontSize: "var(--text-small)" }}>{d.campaign?.name ?? "—"}</td>
                    <td style={{ padding: "var(--space-3)", fontFamily: "var(--font-mono)", fontWeight: 700, color: "var(--green)", whiteSpace: "nowrap" }}>{formatPrice(Number(d.amount), d.currency as "USD" | "RWF")}</td>
                    <td style={{ padding: "var(--space-3)" }}><span className={`chip ${STATUS_CHIP[d.status] ?? "chip--neutral"}`}>{d.status}</span></td>
                    <td style={{ padding: "var(--space-3)" }}>
                      {canManage && isCounted ? (
                        <div style={{ display: "flex", gap: "var(--space-2)", justifyContent: "flex-end", alignItems: "flex-start" }}>
                          {d.status === "PENDING" && <ApproveDonationButton donationId={d.id} donorLabel={donorLabel} />}
                          <ReverseDonationButton donationId={d.id} donorLabel={donorLabel} />
                        </div>
                      ) : (
                        <div style={{ textAlign: "right", fontSize: "var(--text-caption)", color: "var(--text-muted)" }}>—</div>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
