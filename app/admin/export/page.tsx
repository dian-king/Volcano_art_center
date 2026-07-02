import { db } from "@/lib/db"
import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { hasRole, SUPER_ROLES } from "@/lib/permissions"
import { AdminPageHeader } from "@/components/admin/AdminPageChrome"
import { Package, CalendarCheck, Heart, Download } from "lucide-react"

export const dynamic = "force-dynamic"

export default async function AdminExportPage() {
  const session = await auth()
  if (!hasRole(session?.user?.role as string | undefined, SUPER_ROLES)) redirect("/admin")

  const [orders, bookings, donations] = await Promise.all([
    db.order.count(),
    db.booking.count(),
    db.donation.count(),
  ])

  const EXPORTS = [
    { type: "orders", label: "Shipping Orders", count: orders, Icon: Package, desc: "Reference, customer, status, totals and destination for every order." },
    { type: "bookings", label: "Experience Bookings", count: bookings, Icon: CalendarCheck, desc: "Guest, experience, group size, preferred date and status." },
    { type: "donations", label: "Conservation Donations", count: donations, Icon: Heart, desc: "Donor, campaign, amount, currency and status." },
  ]

  return (
    <div>
      <AdminPageHeader
        eyebrow="Data"
        title="Export Data"
        description="Download your records as CSV files — open them in Excel, Google Sheets or Numbers. Exports reflect live data at the moment you download."
      />

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "var(--space-4)" }}>
        {EXPORTS.map(({ type, label, count, Icon, desc }) => (
          <div key={type} className="card" style={{ padding: "var(--space-5)", display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "var(--space-3)" }}>
              <div style={{ width: 40, height: 40, display: "grid", placeItems: "center", borderRadius: "var(--radius-md)", background: "var(--green-tint)", color: "var(--green)" }}>
                <Icon size={20} />
              </div>
              <div>
                <p style={{ fontFamily: "var(--font-ui)", fontWeight: 700 }}>{label}</p>
                <p style={{ fontSize: "var(--text-caption)", color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>{count} record{count === 1 ? "" : "s"}</p>
              </div>
            </div>
            <p style={{ fontSize: "var(--text-small)", color: "var(--text-secondary)", flex: 1 }}>{desc}</p>
            <a href={`/api/admin/export?type=${type}`} download className="btn btn--primary btn--sm" style={{ alignSelf: "flex-start", display: "inline-flex", alignItems: "center", gap: 6 }}>
              <Download size={14} /> Download CSV
            </a>
          </div>
        ))}
      </div>
    </div>
  )
}
