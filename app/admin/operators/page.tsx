import { redirect } from "next/navigation"
import { db } from "@/lib/db"
import { updateOperatorRequestStatus } from "@/actions/admin-content"
import { F, TH, TD, STATUS_COLORS, statusBadge } from "@/components/admin/AdminForm"

export const dynamic = "force-dynamic"

async function saveOp(fd: FormData) {
  "use server"
  await updateOperatorRequestStatus(
    fd.get("id") as string,
    fd.get("status") as string,
    (fd.get("adminNote") as string) || undefined,
  )
  redirect("/admin/operators")
}

export default async function OperatorsPage() {
  const requests = await db.operatorRequest.findMany({
    orderBy: { createdAt: "desc" },
    include: { operator: { select: { companyName: true, contactName: true } } },
  })

  return (
    <div>
      <h1 style={{ fontFamily: "var(--font-display)", fontSize: "var(--text-headline)", fontWeight: 600, marginBottom: "var(--space-6)" }}>Tour Operator Requests</h1>
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              {["Company", "Contact", "Type", "Size", "Status", "Action"].map(h => (
                <th key={h} style={TH}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {requests.map((r) => (
              <tr key={r.id}>
                <td style={{ ...TD, fontWeight: 600, color: "var(--text-primary)" }}>{r.operator?.companyName ?? "—"}</td>
                <td style={TD}>{r.operator?.contactName ?? "—"}</td>
                <td style={TD}>{r.requestType ?? "—"}</td>
                <td style={TD}>{r.groupSize ?? "—"}</td>
                <td style={TD}>{statusBadge(r.status, STATUS_COLORS)}</td>
                <td style={TD}>
                  <form action={saveOp} style={{ display: "flex", gap: "var(--space-2)", alignItems: "center", flexWrap: "wrap", minWidth: "300px" }}>
                    <input type="hidden" name="id" value={r.id} />
                    <select name="status" defaultValue={r.status} style={{ ...F.sel, width: "160px" }}>
                      {["SUBMITTED", "UNDER_REVIEW", "INVOICE_PENDING", "CONFIRMED", "DECLINED"].map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                    <input name="adminNote" defaultValue={r.adminNote ?? ""} placeholder="Admin note…" style={{ ...F.inp, width: "160px" }} />
                    <button type="submit" className="btn btn--primary btn--sm">Save</button>
                  </form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {requests.length === 0 && (
          <p style={{ color: "var(--text-muted)", textAlign: "center", padding: "var(--space-8)" }}>No operator requests yet.</p>
        )}
      </div>
    </div>
  )
}
