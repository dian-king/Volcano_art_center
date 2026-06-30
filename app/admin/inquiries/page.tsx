import { redirect } from "next/navigation"
import { updateInquiryStatus } from "@/actions/admin-content"
import { F, STATUS_COLORS, statusBadge } from "@/components/admin/AdminForm"
import { AdminFilters, AdminPageHeader, AdminPagination } from "@/components/admin/AdminPageChrome"
import { db } from "@/lib/db"

export const dynamic = "force-dynamic"
const PAGE_SIZE = 12

async function saveInquiry(fd: FormData) {
  "use server"
  await updateInquiryStatus(
    fd.get("id") as string,
    fd.get("status") as string,
    (fd.get("staffNote") as string) || undefined,
  )
  redirect("/admin/inquiries")
}

export default async function InquiriesPage({ searchParams }: { searchParams: Promise<Record<string, string>> }) {
  const sp = await searchParams
  const q = sp.q ?? ""
  const status = sp.status ?? ""
  const page = Math.max(1, Number(sp.page ?? 1))

  const where: any = {}
  if (status) where.status = status
  if (q) {
    where.OR = [
      { name: { contains: q, mode: "insensitive" } },
      { email: { contains: q, mode: "insensitive" } },
      { subject: { contains: q, mode: "insensitive" } },
      { message: { contains: q, mode: "insensitive" } },
    ]
  }

  const [inquiries, total] = await Promise.all([
    db.contactInquiry.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    db.contactInquiry.count({ where }),
  ])
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE))

  return (
    <div>
      <AdminPageHeader
        eyebrow="Operations"
        title="Contact Inquiries"
        description="Triage public messages, keep staff notes visible, and close inquiries once resolved."
      />

      <AdminFilters clearHref="/admin/inquiries" active={Boolean(q || status)}>
        <input name="q" defaultValue={q} placeholder="Search name, email, subject, or message..." />
        <select name="status" defaultValue={status}>
          <option value="">All statuses</option>
          <option value="NEW">New</option>
          <option value="IN_PROGRESS">In progress</option>
          <option value="CLOSED">Closed</option>
        </select>
      </AdminFilters>

      <section className="admin-card">
        <div className="admin-card__header">
          <div className="admin-card__header-row">
            <div>
              <h3>Message Inbox</h3>
              <p>{total} inquir{total === 1 ? "y" : "ies"} found</p>
            </div>
          </div>
        </div>
        <div className="admin-card__body admin-card__body--flush">
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Sender</th>
                  <th>Subject</th>
                  <th>Message</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {inquiries.map((i) => (
                  <tr key={i.id}>
                    <td>
                      <strong>{i.name}</strong>
                      <div className="td-sub">{i.email}</div>
                      {i.phone && <div className="td-sub">{i.phone}</div>}
                    </td>
                    <td>{i.subject}</td>
                    <td style={{ maxWidth: 280 }}>
                      <span title={i.message} style={{ display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden", color: "var(--text-secondary)" }}>
                        {i.message}
                      </span>
                      {i.staffNote && <div className="td-sub" style={{ color: "var(--green)" }}>Note: {i.staffNote}</div>}
                    </td>
                    <td>{statusBadge(i.status, STATUS_COLORS)}</td>
                    <td>{new Date(i.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}</td>
                    <td>
                      <form action={saveInquiry} style={{ display: "grid", gridTemplateColumns: "130px minmax(170px, 1fr) auto", gap: "var(--space-2)", minWidth: 460 }}>
                        <input type="hidden" name="id" value={i.id} />
                        <select name="status" defaultValue={i.status} style={F.sel}>
                          {["NEW", "IN_PROGRESS", "CLOSED"].map((s) => <option key={s} value={s}>{s}</option>)}
                        </select>
                        <input name="staffNote" defaultValue={i.staffNote ?? ""} placeholder="Staff note" style={F.inp} />
                        <button type="submit" className="btn btn--primary btn--sm">Save</button>
                      </form>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {inquiries.length === 0 && (
              <p style={{ color: "var(--text-muted)", textAlign: "center", padding: "var(--space-8)" }}>No inquiries match this filter.</p>
            )}
          </div>
        </div>
      </section>

      <AdminPagination page={page} pages={pages} total={total} basePath="/admin/inquiries" query={{ q, status }} />
    </div>
  )
}
