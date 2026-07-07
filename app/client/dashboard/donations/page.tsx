import { EmptyState } from "@/components/ui/EmptyState"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { formatPrice } from "@/lib/utils"
import { HeartHandshake } from "lucide-react"
import { redirect } from "next/navigation"
import { card, statusColor, td, th } from "../_styles"

export const dynamic = "force-dynamic"

export default async function ClientDonationsPage() {
  const session = await auth()
  if (!session?.user?.id) redirect("/login?next=/client/dashboard/donations")
  const donations = await db.donation.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    include: { campaign: { select: { name: true } } },
  })

  return (
    <section style={card}>
      <h1 style={{ fontFamily: "var(--font-ui)", fontWeight: 700, fontSize: "var(--text-lead)", marginBottom: "var(--space-6)" }}>My Donations</h1>
      {donations.length === 0 ? (
        <EmptyState icon={HeartHandshake} title="No donations yet" description="Support a conservation campaign." action={{ label: "Support Now", href: "/conservation" }} />
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead><tr>{["Reference", "Campaign", "Amount", "Date", "Status"].map(h => <th key={h} style={th}>{h}</th>)}</tr></thead>
            <tbody>{donations.map(d => (
              <tr key={d.id}>
                <td style={{ ...td, fontFamily: "var(--font-mono)", fontWeight: 700, color: "var(--green)" }}>{d.reference}</td>
                <td style={td}>{d.campaign?.name ?? "General"}</td>
                <td style={{ ...td, fontFamily: "var(--font-mono)" }}>{formatPrice(d.amount, d.currency as "USD" | "RWF")}</td>
                <td style={td}>{d.createdAt.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}</td>
                <td style={td}><span style={{ color: statusColor[d.status] ?? "var(--text-muted)", fontWeight: 600 }}>{d.status}</span></td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      )}
    </section>
  )
}
