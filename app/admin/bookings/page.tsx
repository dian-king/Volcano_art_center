import { redirect } from "next/navigation"
import { updateBookingStatus } from "@/actions/admin-content"
import { F, STATUS_COLORS, statusBadge } from "@/components/admin/AdminForm"
import { AdminFilters, AdminPageHeader, AdminPagination } from "@/components/admin/AdminPageChrome"
import { db } from "@/lib/db"

export const dynamic = "force-dynamic"
const PAGE_SIZE = 12

async function setStatus(fd: FormData) {
  "use server"
  await updateBookingStatus(fd.get("id") as string, fd.get("status") as string, (fd.get("adminNote") as string) || undefined)
  redirect("/admin/bookings")
}

export default async function BookingsPage({ searchParams }: { searchParams: Promise<Record<string, string>> }) {
  const sp = await searchParams
  const q = sp.q ?? ""
  const status = sp.status ?? ""
  const page = Math.max(1, Number(sp.page ?? 1))

  const where: any = {}
  if (status) where.status = status
  if (q) {
    where.OR = [
      { reference: { contains: q, mode: "insensitive" } },
      { guestName: { contains: q, mode: "insensitive" } },
      { guestEmail: { contains: q, mode: "insensitive" } },
      { experience: { is: { title: { contains: q, mode: "insensitive" } } } },
    ]
  }

  const [bookings, total] = await Promise.all([
    db.booking.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      include: { experience: { select: { title: true } } },
    }),
    db.booking.count({ where }),
  ])
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE))

  return (
    <div>
      <AdminPageHeader eyebrow="Operations" title="Bookings" description="Review booking requests, approve or reject dates, and keep guest-facing status accurate." actionHref="/api/admin/export?type=bookings" actionLabel="Export CSV" />

      <AdminFilters clearHref="/admin/bookings" active={Boolean(q || status)}>
        <input name="q" defaultValue={q} placeholder="Search reference, guest, email, experience..." />
        <select name="status" defaultValue={status}>
          <option value="">All statuses</option>
          <option value="PENDING">Pending</option>
          <option value="CONFIRMED">Confirmed</option>
          <option value="COMPLETED">Completed</option>
          <option value="CANCELLED">Cancelled</option>
          <option value="REJECTED">Rejected</option>
        </select>
      </AdminFilters>

      <div className="admin-card">
        <div className="admin-card__header">
          <div className="admin-card__header-row">
            <div><h3>Booking Queue</h3><p>{total} booking{total === 1 ? "" : "s"} found</p></div>
          </div>
        </div>
        <div className="admin-card__body admin-card__body--flush">
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead><tr><th>Reference</th><th>Guest</th><th>Experience</th><th>Date</th><th>Group</th><th>Status</th><th>Action</th></tr></thead>
              <tbody>
                {bookings.map((b) => (
                  <tr key={b.id}>
                    <td><span className="td-ref">{b.reference}</span></td>
                    <td>
                      <strong>{b.guestName ?? "No name"}</strong>
                      <div className="td-sub">{b.guestEmail}</div>
                      {b.guestPhone && <div className="td-sub">{b.guestPhone}</div>}
                    </td>
                    <td>{b.experience?.title ?? "Custom"}</td>
                    <td>{b.preferredDate.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}</td>
                    <td>{b.groupSize}</td>
                    <td>{statusBadge(b.status, STATUS_COLORS)}</td>
                    <td>
                      <form action={setStatus} style={{ display: "grid", gridTemplateColumns: "150px 180px auto", gap: "var(--space-2)", minWidth: 430 }}>
                        <input type="hidden" name="id" value={b.id} />
                        <select name="status" defaultValue={b.status} style={F.sel}>
                          {["PENDING", "CONFIRMED", "CANCELLED", "COMPLETED", "REJECTED"].map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                        <input name="adminNote" defaultValue={b.adminNote ?? b.cancelReason ?? ""} placeholder="Staff note" style={F.inp} />
                        <button type="submit" className="btn btn--primary btn--sm">Save</button>
                      </form>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {bookings.length === 0 && <p style={{ color: "var(--text-muted)", textAlign: "center", padding: "var(--space-8)" }}>No bookings match this filter.</p>}
          </div>
        </div>
      </div>

      <AdminPagination page={page} pages={pages} total={total} basePath="/admin/bookings" query={{ q, status }} />
    </div>
  )
}
