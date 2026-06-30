import { cancelOwnBookingAction } from "@/actions/bookings"
import { EmptyState } from "@/components/ui/EmptyState"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { CalendarDays } from "lucide-react"
import { redirect } from "next/navigation"
import { card, statusColor, td, th } from "../_styles"

export const dynamic = "force-dynamic"

export default async function ClientBookingsPage({ searchParams }: { searchParams: Promise<Record<string, string>> }) {
  const session = await auth()
  if (!session?.user?.id) redirect("/login?next=/client/dashboard/bookings")
  const sp = await searchParams
  const bookings = await db.booking.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    include: { experience: { select: { title: true } } },
  })

  return (
    <section style={card}>
      <h1 style={{ fontFamily: "var(--font-ui)", fontWeight: 700, fontSize: "var(--text-lead)", marginBottom: "var(--space-6)" }}>My Bookings</h1>
      {sp.booking && <div style={{ marginBottom: "var(--space-5)", padding: "var(--space-4)", border: "1px solid var(--green)", borderRadius: "var(--radius-md)", background: "var(--green-tint)", color: "var(--green)", fontWeight: 700 }}>Booking request {sp.booking} was submitted.</div>}
      {bookings.length === 0 ? (
        <EmptyState icon={CalendarDays} title="No bookings yet" description="Explore our experiences and book one." action={{ label: "Browse Experiences", href: "/experiences" }} />
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead><tr>{["Reference", "Experience", "Date", "Group", "Status", "Action"].map(h => <th key={h} style={th}>{h}</th>)}</tr></thead>
            <tbody>{bookings.map(b => (
              <tr key={b.id}>
                <td style={{ ...td, fontFamily: "var(--font-mono)", fontWeight: 700, color: "var(--green)" }}>{b.reference}</td>
                <td style={td}>{b.experience.title}</td>
                <td style={td}>{b.preferredDate.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}</td>
                <td style={td}>{b.groupSize} {b.groupSize === 1 ? "person" : "people"}</td>
                <td style={td}><span style={{ color: statusColor[b.status] ?? "var(--text-muted)", fontWeight: 600 }}>{b.status}</span></td>
                <td style={td}>{b.status === "PENDING" ? <form action={cancelOwnBookingAction.bind(null, b.id)}><button type="submit" className="btn btn--ghost btn--sm" style={{ color: "#e53e3e" }}>Cancel</button></form> : "—"}</td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      )}
    </section>
  )
}
