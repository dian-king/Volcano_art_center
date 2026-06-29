import { redirect } from "next/navigation"
import { db } from "@/lib/db"
import { updateApplicationStatus } from "@/actions/admin-content"
import { F, TH, TD, STATUS_COLORS, statusBadge } from "@/components/admin/AdminForm"

export const dynamic = "force-dynamic"

async function saveApp(fd: FormData) {
  "use server"
  await updateApplicationStatus(
    fd.get("id") as string,
    fd.get("status") as string,
    (fd.get("staffFeedback") as string) || undefined,
  )
  redirect("/admin/applications")
}

export default async function ApplicationsPage() {
  const applications = await db.talentApplication.findMany({
    orderBy: { createdAt: "desc" },
    include: { user: { select: { email: true } } },
  })

  return (
    <div>
      <h1 style={{ fontFamily: "var(--font-display)", fontSize: "var(--text-headline)", fontWeight: 600, marginBottom: "var(--space-6)" }}>Talent Applications</h1>
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              {["Reference", "Name", "Area", "Status", "Email", "Action"].map(h => (
                <th key={h} style={TH}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {applications.map((a) => (
              <tr key={a.id}>
                <td style={TD}><code style={{ fontFamily: "var(--font-mono)", fontSize: "11px", color: "var(--green)" }}>{a.id.slice(0, 8)}</code></td>
                <td style={{ ...TD, fontWeight: 600, color: "var(--text-primary)" }}>{a.firstName} {a.lastName}</td>
                <td style={TD}>{a.talentArea}</td>
                <td style={TD}>{statusBadge(a.status, STATUS_COLORS)}</td>
                <td style={TD}>{a.user?.email ?? "—"}</td>
                <td style={TD}>
                  <form action={saveApp} style={{ display: "flex", flexDirection: "column", gap: "var(--space-2)", minWidth: "220px" }}>
                    <input type="hidden" name="id" value={a.id} />
                    <select name="status" defaultValue={a.status} style={F.sel}>
                      {["PENDING", "APPROVED", "REJECTED", "AWAITING_INFO", "ARCHIVED"].map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                    <textarea
                      name="staffFeedback"
                      rows={2}
                      defaultValue={a.staffFeedback ?? ""}
                      placeholder="Staff feedback…"
                      style={{ ...F.ta, minHeight: "unset" }}
                    />
                    <button type="submit" className="btn btn--primary btn--sm">Save</button>
                  </form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {applications.length === 0 && (
          <p style={{ color: "var(--text-muted)", textAlign: "center", padding: "var(--space-8)" }}>No applications yet.</p>
        )}
      </div>
    </div>
  )
}
