import Link from "next/link"
import { redirect } from "next/navigation"
import { db } from "@/lib/db"
import { updateUserRole, toggleUserActive } from "@/actions/admin-content"
import { F, TH, TD } from "@/components/admin/AdminForm"

export const dynamic = "force-dynamic"

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

export default async function UsersPage() {
  const users = await db.user.findMany({
    orderBy: { createdAt: "desc" },
    select: { id: true, email: true, firstName: true, lastName: true, role: true, isActive: true, createdAt: true },
  })

  return (
    <div>
      <h1 style={{ fontFamily: "var(--font-display)", fontSize: "var(--text-h2)", marginBottom: "var(--space-6)" }}>Users</h1>
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th style={TH}>Name</th>
              <th style={TH}>Email</th>
              <th style={TH}>Role</th>
              <th style={TH}>Active</th>
              <th style={TH}>Joined</th>
              <th style={TH}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id}>
                <td style={TD}>{[u.firstName, u.lastName].filter(Boolean).join(" ") || "—"}</td>
                <td style={TD}>{u.email}</td>
                <td style={TD}><span style={{ fontSize: "var(--text-small)", color: "var(--text-muted)" }}>{u.role}</span></td>
                <td style={TD}>{u.isActive ? "✓" : "✗"}</td>
                <td style={TD}>{u.createdAt.toLocaleDateString("en-GB")}</td>
                <td style={TD}>
                  <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-2)" }}>
                    {/* Role */}
                    <form action={saveRole} style={{ display: "flex", gap: "var(--space-2)", alignItems: "center" }}>
                      <input type="hidden" name="id" value={u.id} />
                      <select name="role" defaultValue={u.role} style={{ ...F.sel, width: "190px" }}>
                        {["REGISTERED_CLIENT", "TALENT_APPLICANT", "TOUR_OPERATOR", "CONTENT_MANAGER", "OPS_MANAGER", "SUPER_ADMIN"].map((r) => (
                          <option key={r} value={r}>{r}</option>
                        ))}
                      </select>
                      <button type="submit" style={{ padding: "0 var(--space-3)", height: "40px", background: "var(--surface-raised)", color: "var(--text-primary)", border: "1px solid var(--border-subtle)", borderRadius: "var(--radius-md)", cursor: "pointer", fontSize: "var(--text-small)", fontFamily: "var(--font-ui)", whiteSpace: "nowrap" }}>
                        Save
                      </button>
                    </form>
                    {/* Toggle active */}
                    <form action={saveActive}>
                      <input type="hidden" name="id" value={u.id} />
                      <input type="hidden" name="isActive" value={u.isActive ? "false" : "true"} />
                      <button type="submit" style={{ padding: "0 var(--space-3)", height: "36px", background: u.isActive ? "#fee2e2" : "#dcfce7", color: u.isActive ? "#b91c1c" : "#15803d", border: "none", borderRadius: "var(--radius-md)", cursor: "pointer", fontSize: "var(--text-small)", fontFamily: "var(--font-ui)", fontWeight: 600 }}>
                        {u.isActive ? "Deactivate" : "Activate"}
                      </button>
                    </form>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {users.length === 0 && (
          <p style={{ color: "var(--text-muted)", textAlign: "center", padding: "var(--space-8)" }}>No users yet.</p>
        )}
      </div>
    </div>
  )
}
