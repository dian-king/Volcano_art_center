import { redirect } from "next/navigation"
import { updateUserRole, toggleUserActive } from "@/actions/admin-content"
import { F } from "@/components/admin/AdminForm"
import { AdminFilters, AdminPageHeader, AdminPagination } from "@/components/admin/AdminPageChrome"
import { db } from "@/lib/db"

export const dynamic = "force-dynamic"
const PAGE_SIZE = 15

async function saveRole(fd: FormData) {
  "use server"
  await updateUserRole(fd.get("id") as string, fd.get("role") as string)
  redirect("/admin/users")
}

async function saveActive(fd: FormData) {
  "use server"
  await toggleUserActive(fd.get("id") as string, fd.get("isActive") === "true")
  redirect("/admin/users")
}

export default async function UsersPage({ searchParams }: { searchParams: Promise<Record<string, string>> }) {
  const sp = await searchParams
  const q = sp.q ?? ""
  const role = sp.role ?? ""
  const active = sp.active ?? ""
  const page = Math.max(1, Number(sp.page ?? 1))

  const where: any = {}
  if (role) where.role = role
  if (active === "true") where.isActive = true
  if (active === "false") where.isActive = false
  if (q) {
    where.OR = [
      { email: { contains: q, mode: "insensitive" } },
      { firstName: { contains: q, mode: "insensitive" } },
      { lastName: { contains: q, mode: "insensitive" } },
    ]
  }

  const [users, total] = await Promise.all([
    db.user.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      select: { id: true, email: true, firstName: true, lastName: true, role: true, isActive: true, createdAt: true },
    }),
    db.user.count({ where }),
  ])
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE))

  return (
    <div>
      <AdminPageHeader eyebrow="Administration" title="Staff & Accounts" description="Manage platform roles, user access, and account activation state." />

      <AdminFilters clearHref="/admin/users" active={Boolean(q || role || active)}>
        <input name="q" defaultValue={q} placeholder="Search name or email..." />
        <select name="role" defaultValue={role}>
          <option value="">All roles</option>
          {["REGISTERED_CLIENT", "TALENT_APPLICANT", "TOUR_OPERATOR", "CONTENT_MANAGER", "OPS_MANAGER", "SUPER_ADMIN"].map(r => <option key={r} value={r}>{r.replaceAll("_", " ")}</option>)}
        </select>
        <select name="active" defaultValue={active}>
          <option value="">Any status</option>
          <option value="true">Active</option>
          <option value="false">Inactive</option>
        </select>
      </AdminFilters>

      <div className="admin-card">
        <div className="admin-card__header"><h3>Account Directory</h3><p>{total} account{total === 1 ? "" : "s"} found</p></div>
        <div className="admin-card__body admin-card__body--flush">
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead><tr><th>User</th><th>Role</th><th>Status</th><th>Joined</th><th>Actions</th></tr></thead>
              <tbody>
                {users.map((u) => {
                  const name = [u.firstName, u.lastName].filter(Boolean).join(" ") || "Unnamed user"
                  return (
                    <tr key={u.id}>
                      <td><strong>{name}</strong><div className="td-sub">{u.email}</div></td>
                      <td><span className="chip chip--neutral">{u.role.replaceAll("_", " ")}</span></td>
                      <td><span className={`chip ${u.isActive ? "chip--success" : "chip--danger"}`}>{u.isActive ? "Active" : "Inactive"}</span></td>
                      <td>{u.createdAt.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}</td>
                      <td>
                        <div style={{ display: "flex", gap: "var(--space-2)", flexWrap: "wrap" }}>
                          <form action={saveRole} style={{ display: "flex", gap: "var(--space-2)" }}>
                            <input type="hidden" name="id" value={u.id} />
                            <select name="role" defaultValue={u.role} style={{ ...F.sel, width: 190 }}>
                              {["REGISTERED_CLIENT", "TALENT_APPLICANT", "TOUR_OPERATOR", "CONTENT_MANAGER", "OPS_MANAGER", "SUPER_ADMIN"].map(r => <option key={r} value={r}>{r}</option>)}
                            </select>
                            <button type="submit" className="btn btn--ghost btn--sm">Save Role</button>
                          </form>
                          <form action={saveActive}>
                            <input type="hidden" name="id" value={u.id} />
                            <input type="hidden" name="isActive" value={u.isActive ? "false" : "true"} />
                            <button type="submit" className="btn btn--ghost btn--sm" style={{ color: u.isActive ? "#b91c1c" : "var(--green)" }}>{u.isActive ? "Deactivate" : "Activate"}</button>
                          </form>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
            {users.length === 0 && <p style={{ color: "var(--text-muted)", textAlign: "center", padding: "var(--space-8)" }}>No users match this filter.</p>}
          </div>
        </div>
      </div>

      <AdminPagination page={page} pages={pages} total={total} basePath="/admin/users" query={{ q, role, active }} />
    </div>
  )
}
