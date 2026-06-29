import Link from "next/link"
import { redirect } from "next/navigation"
import { db } from "@/lib/db"
import { updateOrderStatus } from "@/actions/admin-content"
import { F, TH, TD, STATUS_COLORS, statusBadge } from "@/components/admin/AdminForm"

export const dynamic = "force-dynamic"

async function saveOrder(fd: FormData) {
  "use server"
  await updateOrderStatus(fd.get("id") as string, fd)
  redirect("/admin/orders")
}

export default async function OrdersPage() {
  const orders = await db.order.findMany({
    orderBy: { createdAt: "desc" },
    include: { items: { include: { product: { select: { name: true } } } } },
  })

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "var(--space-6)" }}>
        <h1 style={{ fontFamily: "var(--font-display)", fontSize: "var(--text-h2)" }}>Orders</h1>
        <a href="/api/admin/export?type=orders" className="btn btn--ghost btn--sm" download>↓ Export CSV</a>
      </div>
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th style={TH}>Reference</th>
              <th style={TH}>Items</th>
              <th style={TH}>Total</th>
              <th style={TH}>Status</th>
              <th style={TH}>Tracking</th>
              <th style={TH}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((o) => (
              <tr key={o.id}>
                <td style={TD}><code style={{ fontFamily: "var(--font-mono)", fontSize: "11px", color: "var(--green)" }}>{o.id.slice(0, 8)}</code></td>
                <td style={TD}>{o.items.map((i) => i.product?.name ?? "—").join(", ") || "—"}</td>
                <td style={{ ...TD, fontFamily: "var(--font-mono)" }}>£{(o.totalAmount ?? 0).toFixed(2)}</td>
                <td style={TD}>{statusBadge(o.status, STATUS_COLORS)}</td>
                <td style={TD}>{o.trackingNumber ?? "—"}{o.carrier ? ` (${o.carrier})` : ""}</td>
                <td style={TD}>
                  <form action={saveOrder} style={{ display: "flex", gap: "var(--space-2)", alignItems: "center", flexWrap: "wrap" }}>
                    <input type="hidden" name="id" value={o.id} />
                    <select name="status" defaultValue={o.status} style={{ ...F.sel, width: "150px" }}>
                      {["PENDING", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED", "REFUNDED"].map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                    <input name="trackingNumber" defaultValue={o.trackingNumber ?? ""} placeholder="Tracking #" style={{ ...F.inp, width: "120px" }} />
                    <input name="carrier" defaultValue={o.carrier ?? ""} placeholder="Carrier" style={{ ...F.inp, width: "100px" }} />
                    <button type="submit" style={{ padding: "0 var(--space-3)", height: "40px", background: "var(--green)", color: "#fff", border: "none", borderRadius: "var(--radius-md)", cursor: "pointer", fontSize: "var(--text-small)", fontFamily: "var(--font-ui)", whiteSpace: "nowrap" }}>
                      Save
                    </button>
                  </form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {orders.length === 0 && (
          <p style={{ color: "var(--text-muted)", textAlign: "center", padding: "var(--space-8)" }}>No orders yet.</p>
        )}
      </div>
    </div>
  )
}
