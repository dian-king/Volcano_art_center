import { redirect } from "next/navigation"
import { db } from "@/lib/db"
import { updateOperatorRequestStatus } from "@/actions/admin-content"
import { F, TH, TD, STATUS_COLORS, statusBadge } from "@/components/admin/AdminForm"

export const dynamic = "force-dynamic"
const PAGE_SIZE = 12

async function saveOp(fd: FormData) {
  "use server"
  await updateOperatorRequestStatus(
    fd.get("id") as string,
    fd.get("status") as string,
    (fd.get("adminNote") as string) || undefined,
  )
  redirect("/admin/operators")
}

export default async function OperatorsPage({ searchParams }: { searchParams: Promise<Record<string, string>> }) {
  const sp = await searchParams
  const status = sp.status ?? ""
  const type = sp.type ?? ""
  const q = sp.q ?? ""
  const page = Math.max(1, Number(sp.page ?? 1))

  const where: any = {}
  if (status) where.status = status
  if (type) where.requestType = type
  if (q) {
    where.OR = [
      { specialRequests: { contains: q, mode: "insensitive" } },
      { adminNote: { contains: q, mode: "insensitive" } },
      { operator: { is: { companyName: { contains: q, mode: "insensitive" } } } },
      { operator: { is: { contactName: { contains: q, mode: "insensitive" } } } },
    ]
  }

  const [requests, total] = await Promise.all([
    db.operatorRequest.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      include: { operator: { select: { companyName: true, contactName: true } } },
    }),
    db.operatorRequest.count({ where }),
  ])
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE))
  const base = new URLSearchParams()
  if (status) base.set("status", status)
  if (type) base.set("type", type)
  if (q) base.set("q", q)

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "var(--space-5)" }}>
        <div>
          <h1 style={{ fontFamily: "var(--font-display)", fontSize: "var(--text-headline)", fontWeight: 600 }}>Tour Operator Requests</h1>
          <p style={{ color: "var(--text-muted)", fontSize: "var(--text-small)" }}>{total} result{total === 1 ? "" : "s"}</p>
        </div>
      </div>
      <form method="GET" style={{ display: "grid", gridTemplateColumns: "1fr 180px 180px auto", gap: "var(--space-3)", marginBottom: "var(--space-5)" }}>
        <input name="q" defaultValue={q} placeholder="Search company, contact, note..." style={F.inp} />
        <select name="status" defaultValue={status} style={F.sel}>
          <option value="">All statuses</option>
          {["SUBMITTED", "UNDER_REVIEW", "INVOICE_PENDING", "CONFIRMED", "DECLINED"].map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <select name="type" defaultValue={type} style={F.sel}>
          <option value="">All types</option>
          <option value="GROUP_BOOKING">GROUP_BOOKING</option>
          <option value="CUSTOM_PACKAGE">CUSTOM_PACKAGE</option>
        </select>
        <button type="submit" className="btn btn--primary btn--sm">Filter</button>
      </form>
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
                <td style={TD}>{r.estimatedSize ?? "—"}</td>
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
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "var(--space-5)" }}>
        <span style={{ color: "var(--text-muted)", fontSize: "var(--text-small)" }}>Page {page} of {pages}</span>
        <div style={{ display: "flex", gap: "var(--space-2)" }}>
          {page > 1 && <a className="btn btn--ghost btn--sm" href={`/admin/operators?${new URLSearchParams([...base.entries(), ["page", String(page - 1)]]).toString()}`}>Previous</a>}
          {page < pages && <a className="btn btn--ghost btn--sm" href={`/admin/operators?${new URLSearchParams([...base.entries(), ["page", String(page + 1)]]).toString()}`}>Next</a>}
        </div>
      </div>
    </div>
  )
}
