import { redirect } from "next/navigation"
import { updateOrderStatus } from "@/actions/admin-content"
import { F, STATUS_COLORS, statusBadge } from "@/components/admin/AdminForm"
import { AdminFilters, AdminPageHeader, AdminPagination } from "@/components/admin/AdminPageChrome"
import { db } from "@/lib/db"

export const dynamic = "force-dynamic"
const PAGE_SIZE = 12

async function saveOrder(fd: FormData) {
  "use server"
  await updateOrderStatus(fd.get("id") as string, fd)
  redirect("/admin/orders")
}

export default async function OrdersPage({ searchParams }: { searchParams: Promise<Record<string, string>> }) {
  const sp = await searchParams
  const q = sp.q ?? ""
  const status = sp.status ?? ""
  const page = Math.max(1, Number(sp.page ?? 1))

  const where: any = {}
  if (status) where.status = status
  if (q) {
    where.OR = [
      { reference: { contains: q, mode: "insensitive" } },
      { recipientName: { contains: q, mode: "insensitive" } },
      { trackingNumber: { contains: q, mode: "insensitive" } },
      { user: { is: { email: { contains: q, mode: "insensitive" } } } },
    ]
  }

  const [orders, total] = await Promise.all([
    db.order.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      include: { user: { select: { email: true } }, items: { include: { product: { select: { name: true } } } } },
    }),
    db.order.count({ where }),
  ])
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE))

  return (
    <div>
      <AdminPageHeader eyebrow="Operations" title="Shipping Orders" description="Process customer orders, update tracking, and manage fulfillment state." actionHref="/api/admin/export?type=orders" actionLabel="Export CSV" />

      <AdminFilters clearHref="/admin/orders" active={Boolean(q || status)}>
        <input name="q" defaultValue={q} placeholder="Search reference, customer, email, tracking..." />
        <select name="status" defaultValue={status}>
          <option value="">All statuses</option>
          <option value="PENDING">Pending</option>
          <option value="PROCESSING">Processing</option>
          <option value="SHIPPED">Shipped</option>
          <option value="DELIVERED">Delivered</option>
          <option value="CANCELLED">Cancelled</option>
          <option value="REFUNDED">Refunded</option>
        </select>
      </AdminFilters>

      <div className="admin-card">
        <div className="admin-card__header"><h3>Fulfillment Queue</h3><p>{total} order{total === 1 ? "" : "s"} found</p></div>
        <div className="admin-card__body admin-card__body--flush">
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead><tr><th>Reference</th><th>Customer</th><th>Items</th><th>Total</th><th>Status</th><th>Tracking</th><th>Action</th></tr></thead>
              <tbody>
                {orders.map((o) => (
                  <tr key={o.id}>
                    <td><span className="td-ref">{o.reference}</span></td>
                    <td><strong>{o.recipientName}</strong><div className="td-sub">{o.user.email}</div></td>
                    <td>{o.items.map(i => i.product?.name ?? "Unknown").join(", ") || "—"}</td>
                    <td><strong>${Number(o.total ?? 0).toFixed(2)}</strong></td>
                    <td>{statusBadge(o.status, STATUS_COLORS)}</td>
                    <td>{o.trackingNumber ?? "—"}{o.carrier ? <div className="td-sub">{o.carrier}</div> : null}</td>
                    <td>
                      <form action={saveOrder} style={{ display: "grid", gridTemplateColumns: "145px 120px 105px auto", gap: "var(--space-2)", minWidth: 520 }}>
                        <input type="hidden" name="id" value={o.id} />
                        <select name="status" defaultValue={o.status} style={F.sel}>
                          {["PENDING", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED", "REFUNDED"].map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                        <input name="trackingNumber" defaultValue={o.trackingNumber ?? ""} placeholder="Tracking" style={F.inp} />
                        <input name="carrier" defaultValue={o.carrier ?? ""} placeholder="Carrier" style={F.inp} />
                        <button type="submit" className="btn btn--primary btn--sm">Save</button>
                      </form>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {orders.length === 0 && <p style={{ color: "var(--text-muted)", textAlign: "center", padding: "var(--space-8)" }}>No orders match this filter.</p>}
          </div>
        </div>
      </div>

      <AdminPagination page={page} pages={pages} total={total} basePath="/admin/orders" query={{ q, status }} />
    </div>
  )
}
