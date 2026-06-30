import { redirect } from "next/navigation"
import { updateApplicationStatus } from "@/actions/admin-content"
import { F, STATUS_COLORS, statusBadge } from "@/components/admin/AdminForm"
import { AdminFilters, AdminPageHeader, AdminPagination } from "@/components/admin/AdminPageChrome"
import { db } from "@/lib/db"

export const dynamic = "force-dynamic"
const PAGE_SIZE = 12

async function saveApp(fd: FormData) {
  "use server"
  await updateApplicationStatus(
    fd.get("id") as string,
    fd.get("status") as string,
    (fd.get("staffFeedback") as string) || undefined,
  )
  redirect("/admin/applications")
}

export default async function ApplicationsPage({ searchParams }: { searchParams: Promise<Record<string, string>> }) {
  const sp = await searchParams
  const q = sp.q ?? ""
  const status = sp.status ?? ""
  const area = sp.area ?? ""
  const page = Math.max(1, Number(sp.page ?? 1))

  const where: any = {}
  if (status) where.status = status
  if (area) where.talentArea = area
  if (q) {
    where.OR = [
      { reference: { contains: q, mode: "insensitive" } },
      { firstName: { contains: q, mode: "insensitive" } },
      { lastName: { contains: q, mode: "insensitive" } },
      { email: { contains: q, mode: "insensitive" } },
      { user: { is: { email: { contains: q, mode: "insensitive" } } } },
    ]
  }

  const [applications, total] = await Promise.all([
    db.talentApplication.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      include: { user: { select: { email: true } } },
    }),
    db.talentApplication.count({ where }),
  ])
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE))

  return (
    <div>
      <AdminPageHeader
        eyebrow="Operations"
        title="Talent Applications"
        description="Review applicant details, record staff feedback, and move talent applications through approval."
      />

      <AdminFilters clearHref="/admin/applications" active={Boolean(q || status || area)}>
        <input name="q" defaultValue={q} placeholder="Search reference, applicant, or email..." />
        <select name="status" defaultValue={status}>
          <option value="">All statuses</option>
          <option value="PENDING">Pending</option>
          <option value="APPROVED">Approved</option>
          <option value="REJECTED">Rejected</option>
          <option value="AWAITING_INFO">Awaiting info</option>
          <option value="ARCHIVED">Archived</option>
        </select>
        <select name="area" defaultValue={area}>
          <option value="">All talent areas</option>
          <option value="TRADITIONAL_DANCE">Traditional dance</option>
          <option value="STORYTELLING">Storytelling</option>
          <option value="CULTURAL_PERFORMANCE">Cultural performance</option>
          <option value="MUSIC">Music</option>
          <option value="VISUAL_ARTS">Visual arts</option>
          <option value="CRAFTS">Crafts</option>
          <option value="OTHER">Other</option>
        </select>
      </AdminFilters>

      <section className="admin-card">
        <div className="admin-card__header">
          <div className="admin-card__header-row">
            <div>
              <h3>Application Review Queue</h3>
              <p>{total} application{total === 1 ? "" : "s"} found</p>
            </div>
          </div>
        </div>
        <div className="admin-card__body admin-card__body--flush">
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Reference</th>
                  <th>Applicant</th>
                  <th>Talent</th>
                  <th>Status</th>
                  <th>Submitted</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {applications.map((a) => (
                  <tr key={a.id}>
                    <td><span className="td-ref">{a.reference ?? a.id.slice(0, 8)}</span></td>
                    <td>
                      <strong>{a.firstName} {a.lastName}</strong>
                      <div className="td-sub">{a.email || a.user?.email}</div>
                    </td>
                    <td>
                      {a.talentArea.replaceAll("_", " ")}
                      <div className="td-sub">{a.applicantCategory.replaceAll("_", " ")}</div>
                    </td>
                    <td>{statusBadge(a.status, STATUS_COLORS)}</td>
                    <td>{new Date(a.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}</td>
                    <td>
                      <form action={saveApp} style={{ display: "grid", gridTemplateColumns: "150px minmax(180px, 1fr) auto", gap: "var(--space-2)", minWidth: 520 }}>
                        <input type="hidden" name="id" value={a.id} />
                        <select name="status" defaultValue={a.status} style={F.sel}>
                          {["PENDING", "APPROVED", "REJECTED", "AWAITING_INFO", "ARCHIVED"].map((s) => <option key={s} value={s}>{s}</option>)}
                        </select>
                        <input name="staffFeedback" defaultValue={a.staffFeedback ?? ""} placeholder="Staff feedback" style={F.inp} />
                        <button type="submit" className="btn btn--primary btn--sm">Save</button>
                      </form>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {applications.length === 0 && (
              <p style={{ color: "var(--text-muted)", textAlign: "center", padding: "var(--space-8)" }}>No applications match this filter.</p>
            )}
          </div>
        </div>
      </section>

      <AdminPagination page={page} pages={pages} total={total} basePath="/admin/applications" query={{ q, status, area }} />
    </div>
  )
}
