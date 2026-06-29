import { redirect } from "next/navigation"
import { db } from "@/lib/db"
import { updateInquiryStatus } from "@/actions/admin-content"
import { F, TH, TD, STATUS_COLORS, statusBadge } from "@/components/admin/AdminForm"

export const dynamic = "force-dynamic"

async function saveInquiry(fd: FormData) {
  "use server"
  await updateInquiryStatus(
    fd.get("id") as string,
    fd.get("status") as string,
    (fd.get("staffNote") as string) || undefined,
  )
  redirect("/admin/inquiries")
}

export default async function InquiriesPage() {
  const inquiries = await db.contactInquiry.findMany({
    orderBy: { createdAt: "desc" },
  })

  return (
    <div>
      <div className="admin-page-header" style={{ marginBottom: "var(--space-6)" }}>
        <h1 className="admin-page-title">Contact Inquiries</h1>
      </div>
      <div className="admin-table-wrap">
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              {["Name", "Email", "Subject", "Message", "Status", "Date", "Action"].map(h => (
                <th key={h} style={TH}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {inquiries.map((i) => (
              <tr key={i.id}>
                <td style={{ ...TD, fontWeight: 600, color: "var(--text-primary)" }}>{i.name}</td>
                <td style={TD}>{i.email}</td>
                <td style={TD}>{i.subject ?? "—"}</td>
                <td style={{ ...TD, maxWidth: 220 }}>
                  <span title={i.message} style={{ display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden", fontSize: "var(--text-caption)", color: "var(--text-secondary)" }}>
                    {i.message}
                  </span>
                  {i.staffNote && <span style={{ display: "block", marginTop: 4, fontSize: "var(--text-caption)", color: "var(--green)", fontStyle: "italic" }}>Note: {i.staffNote}</span>}
                </td>
                <td style={TD}>{statusBadge(i.status, STATUS_COLORS)}</td>
                <td style={TD}>{new Date(i.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}</td>
                <td style={TD}>
                  <form action={saveInquiry} style={{ display: "flex", gap: "var(--space-2)", alignItems: "center", flexWrap: "wrap", minWidth: "280px" }}>
                    <input type="hidden" name="id" value={i.id} />
                    <select name="status" defaultValue={i.status} style={{ ...F.sel, width: "130px" }}>
                      {["NEW", "IN_PROGRESS", "CLOSED"].map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                    <input name="staffNote" defaultValue={i.staffNote ?? ""} placeholder="Staff note…" style={{ ...F.inp, width: "160px" }} />
                    <button type="submit" className="btn btn--primary btn--sm">Save</button>
                  </form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {inquiries.length === 0 && (
          <p style={{ color: "var(--text-muted)", textAlign: "center", padding: "var(--space-8)" }}>No inquiries yet.</p>
        )}
      </div>
    </div>
  )
}
