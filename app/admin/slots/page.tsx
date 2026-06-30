import { redirect } from "next/navigation"
import { updateSlotStatus } from "@/actions/admin-content"
import { F, STATUS_COLORS, statusBadge } from "@/components/admin/AdminForm"
import { AdminFilters, AdminPageHeader, AdminPagination } from "@/components/admin/AdminPageChrome"
import { db } from "@/lib/db"

export const dynamic = "force-dynamic"
const PAGE_SIZE = 12

async function saveSlot(fd: FormData) {
  "use server"
  await updateSlotStatus(fd.get("id") as string, fd.get("status") as string)
  redirect("/admin/slots")
}

export default async function SlotsPage({ searchParams }: { searchParams: Promise<Record<string, string>> }) {
  const sp = await searchParams
  const q = sp.q ?? ""
  const status = sp.status ?? ""
  const page = Math.max(1, Number(sp.page ?? 1))

  const where: any = {}
  if (status) where.status = status
  if (q) {
    where.OR = [
      { guideName: { contains: q, mode: "insensitive" } },
      { guideEmail: { contains: q, mode: "insensitive" } },
      { experience: { is: { title: { contains: q, mode: "insensitive" } } } },
    ]
  }

  const [slots, total] = await Promise.all([
    db.availabilitySlot.findMany({
      where,
      orderBy: { date: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      include: { experience: { select: { title: true } } },
    }),
    db.availabilitySlot.count({ where }),
  ])
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE))

  return (
    <div>
      <AdminPageHeader
        eyebrow="Operations"
        title="Availability Slots"
        description="Manage capacity, guide assignments, and date availability for bookable experiences."
        actionHref="/admin/slots/new"
        actionLabel="New Slot"
      />

      <AdminFilters clearHref="/admin/slots" active={Boolean(q || status)}>
        <input name="q" defaultValue={q} placeholder="Search experience, guide, or email..." />
        <select name="status" defaultValue={status}>
          <option value="">All statuses</option>
          <option value="AVAILABLE">Available</option>
          <option value="LIMITED">Limited</option>
          <option value="FULLY_BOOKED">Fully booked</option>
          <option value="REQUEST_ONLY">Request only</option>
          <option value="BLACKOUT">Blackout</option>
        </select>
      </AdminFilters>

      <section className="admin-card">
        <div className="admin-card__header">
          <div className="admin-card__header-row">
            <div>
              <h3>Calendar Inventory</h3>
              <p>{total} slot{total === 1 ? "" : "s"} found</p>
            </div>
          </div>
        </div>
        <div className="admin-card__body admin-card__body--flush">
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Experience</th>
                  <th>Date</th>
                  <th>Capacity</th>
                  <th>Booked</th>
                  <th>Status</th>
                  <th>Guide</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {slots.map((s) => {
                  const remaining = Math.max(0, s.capacity - s.booked)
                  return (
                    <tr key={s.id}>
                      <td><strong>{s.experience?.title ?? "Untitled experience"}</strong></td>
                      <td>{s.date.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}</td>
                      <td>{s.capacity}</td>
                      <td>{s.booked}<div className="td-sub">{remaining} remaining</div></td>
                      <td>{statusBadge(s.status, STATUS_COLORS)}</td>
                      <td>
                        {s.guideName ?? "Unassigned"}
                        {s.guideEmail && <div className="td-sub">{s.guideEmail}</div>}
                      </td>
                      <td>
                        <form action={saveSlot} style={{ display: "grid", gridTemplateColumns: "160px auto", gap: "var(--space-2)", minWidth: 260 }}>
                          <input type="hidden" name="id" value={s.id} />
                          <select name="status" defaultValue={s.status} style={F.sel}>
                            {["AVAILABLE", "LIMITED", "FULLY_BOOKED", "REQUEST_ONLY", "BLACKOUT"].map((st) => <option key={st} value={st}>{st}</option>)}
                          </select>
                          <button type="submit" className="btn btn--primary btn--sm">Save</button>
                        </form>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
            {slots.length === 0 && (
              <p style={{ color: "var(--text-muted)", textAlign: "center", padding: "var(--space-8)" }}>No slots match this filter.</p>
            )}
          </div>
        </div>
      </section>

      <AdminPagination page={page} pages={pages} total={total} basePath="/admin/slots" query={{ q, status }} />
    </div>
  )
}
