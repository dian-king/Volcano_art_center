import { db } from "@/lib/db"
import { getPortalSession, getTourOperatorByUserId } from "@/lib/portal-session"
import { redirect } from "next/navigation"
import Link from "next/link"
import { CheckCircle, Clock, FileDown, Filter, PlusCircle } from "lucide-react"

export const dynamic = "force-dynamic"

const card: React.CSSProperties = {
  background: "var(--surface-raised)",
  border: "1px solid var(--border-subtle)",
  borderRadius: "var(--radius-lg)",
  padding: "var(--space-5)",
}

const statusColor: Record<string, string> = {
  SUBMITTED: "#d97706",
  UNDER_REVIEW: "#2563eb",
  INVOICE_PENDING: "#7c3aed",
  CONFIRMED: "#16a34a",
  DECLINED: "#dc2626",
}

function statusBadge(status: string) {
  const color = statusColor[status] ?? "var(--text-muted)"
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 6, color, background: `${color}18`, border: `1px solid ${color}33`, padding: "4px 8px", borderRadius: "999px", fontSize: "var(--text-caption)", fontWeight: 700 }}>
      <span style={{ width: 7, height: 7, borderRadius: "50%", background: color }} />
      {status.replaceAll("_", " ")}
    </span>
  )
}

export default async function OperatorPortalPage() {
  const session = await getPortalSession()
  if (!session?.user?.id) redirect("/login?next=/tour-operators/portal")

  const operator = await getTourOperatorByUserId(session.user.id)
  if (!operator) redirect("/tour-operators/portal/profile")

  const [counts, recentRequests] = await Promise.all([
    db.operatorRequest.groupBy({ by: ["status"], where: { operatorId: operator.id }, _count: { _all: true } }),
    db.operatorRequest.findMany({
      where: { operatorId: operator.id },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
  ])
  const countMap = Object.fromEntries(counts.map(c => [c.status, c._count._all]))
  const metrics = [
    { title: "Submitted", value: countMap.SUBMITTED ?? 0, Icon: Clock },
    { title: "Under Review", value: countMap.UNDER_REVIEW ?? 0, Icon: Filter },
    { title: "Invoice Pending", value: countMap.INVOICE_PENDING ?? 0, Icon: FileDown },
    { title: "Confirmed", value: countMap.CONFIRMED ?? 0, Icon: CheckCircle },
  ]

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-6)" }}>
      <section style={{ display: "flex", justifyContent: "space-between", gap: "var(--space-4)", alignItems: "flex-start" }}>
        <div>
          <span className="eyebrow">Dashboard</span>
          <h1 style={{ fontFamily: "var(--font-display)", fontSize: "var(--text-headline)", fontWeight: 600 }}>{operator.companyName}</h1>
          <p style={{ color: "var(--text-secondary)", marginTop: "var(--space-2)" }}>Track company requests, quotation status, and operations progress.</p>
        </div>
        <Link href="/tour-operators/portal/requests/new" className="btn btn--primary" style={{ display: "inline-flex", gap: "var(--space-2)" }}>
          <PlusCircle size={18} />
          New Request
        </Link>
      </section>

      <section style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0, 1fr))", gap: "var(--space-4)" }}>
        {metrics.map(({ title, value, Icon }) => (
          <div key={title} style={card}>
            <Icon size={20} color="var(--green)" />
            <p style={{ marginTop: "var(--space-3)", fontSize: "var(--text-caption)", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 700 }}>{title}</p>
            <strong style={{ fontFamily: "var(--font-display)", fontSize: "2rem" }}>{value}</strong>
          </div>
        ))}
      </section>

      <section style={card}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "var(--space-4)", marginBottom: "var(--space-4)" }}>
          <h2 style={{ fontFamily: "var(--font-ui)", fontSize: "var(--text-lead)", fontWeight: 700 }}>Recent Requests</h2>
          <Link href="/tour-operators/portal/requests" className="btn btn--ghost btn--sm">View all</Link>
        </div>
        {recentRequests.length === 0 ? (
          <p style={{ color: "var(--text-muted)", textAlign: "center", padding: "var(--space-8)" }}>No requests yet. Start by creating a group booking or custom package request.</p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
            {recentRequests.map(request => (
              <article key={request.id} style={{ display: "flex", justifyContent: "space-between", gap: "var(--space-4)", border: "1px solid var(--border-subtle)", borderRadius: "var(--radius-md)", padding: "var(--space-4)", background: "var(--surface-base)" }}>
                <div>
                  <p style={{ fontFamily: "var(--font-ui)", fontWeight: 700 }}>{request.requestType.replaceAll("_", " ")}</p>
                  <p style={{ color: "var(--text-muted)", fontSize: "var(--text-small)", marginTop: 3 }}>{request.experienceSlug ?? "Custom itinerary"} - {request.estimatedSize} guests</p>
                </div>
                {statusBadge(request.status)}
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
