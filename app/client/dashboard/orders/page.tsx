import { EmptyState } from "@/components/ui/EmptyState"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { formatPrice } from "@/lib/utils"
import { ShoppingBag } from "lucide-react"
import { redirect } from "next/navigation"
import { card, statusColor, td, th } from "../_styles"

export const dynamic = "force-dynamic"

export default async function ClientOrdersPage() {
  const session = await auth()
  if (!session?.user?.id) redirect("/login?next=/client/dashboard/orders")
  const orders = await db.order.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    include: { items: { include: { product: { select: { name: true } } } } },
  })

  return (
    <section style={card}>
      <h1 style={{ fontFamily: "var(--font-ui)", fontWeight: 700, fontSize: "var(--text-lead)", marginBottom: "var(--space-6)" }}>My Orders</h1>
      {orders.length === 0 ? (
        <EmptyState icon={ShoppingBag} title="No orders yet" description="Browse the shop and place your first order." action={{ label: "Browse Shop", href: "/art-store" }} />
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead><tr>{["Reference", "Date", "Items", "Total", "Status"].map(h => <th key={h} style={th}>{h}</th>)}</tr></thead>
            <tbody>{orders.map(o => (
              <tr key={o.id}>
                <td style={{ ...td, fontFamily: "var(--font-mono)", fontWeight: 700, color: "var(--green)" }}>{o.reference}</td>
                <td style={td}>{o.createdAt.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}</td>
                <td style={td}>{o.items.map(i => i.product.name).join(", ")}</td>
                <td style={{ ...td, fontFamily: "var(--font-mono)" }}>{formatPrice(o.total)}</td>
                <td style={td}><span style={{ color: statusColor[o.status] ?? "var(--text-muted)", fontWeight: 600 }}>{o.status}</span></td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      )}
    </section>
  )
}
