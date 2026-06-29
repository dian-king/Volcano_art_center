import { db } from "@/lib/db"
import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { TH, TD } from "@/components/admin/AdminForm"

export const dynamic = "force-dynamic"

export default async function AuditLogPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>
}) {
  const session = await auth()
  if (session?.user?.role !== "SUPER_ADMIN") redirect("/admin")

  const sp = await searchParams
  const actorFilter = sp.actor ?? ""
  const entityFilter = sp.entity ?? ""
  const page = Number(sp.page ?? 1)
  const perPage = 50

  const where = {
    ...(actorFilter ? { actorEmail: { contains: actorFilter } } : {}),
    ...(entityFilter ? { entityType: { contains: entityFilter } } : {}),
  }

  const [logs, total] = await Promise.all([
    db.auditLog.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: perPage,
      skip: (page - 1) * perPage,
      include: { actor: { select: { email: true } } },
    }),
    db.auditLog.count({ where }),
  ])

  const totalPages = Math.ceil(total / perPage)

  const inp: React.CSSProperties = { height: "36px", padding: "0 var(--space-3)", border: "1px solid var(--border-subtle)", borderRadius: "var(--radius-md)", background: "var(--surface-base)", color: "var(--text-primary)", fontSize: "var(--text-small)", fontFamily: "var(--font-ui)" }

  return (
    <div>
      <h1 style={{ fontFamily: "var(--font-display)", fontSize: "var(--text-headline)", fontWeight: 600, marginBottom: "var(--space-6)" }}>
        Audit Log
      </h1>

      {/* Filters */}
      <form style={{ display: "flex", gap: "var(--space-3)", marginBottom: "var(--space-5)", flexWrap: "wrap" }}>
        <input name="actor" defaultValue={actorFilter} placeholder="Filter by actor email" style={{ ...inp, width: 220 }} />
        <input name="entity" defaultValue={entityFilter} placeholder="Filter by entity type" style={{ ...inp, width: 180 }} />
        <button type="submit" className="btn btn--primary btn--sm">Filter</button>
        <a href="/admin/audit" className="btn btn--ghost btn--sm">Clear</a>
        <span style={{ marginLeft: "auto", fontSize: "var(--text-small)", color: "var(--text-muted)", fontFamily: "var(--font-ui)", alignSelf: "center" }}>
          {total.toLocaleString()} entries
        </span>
      </form>

      {logs.length === 0 ? (
        <p style={{ color: "var(--text-muted)", fontFamily: "var(--font-ui)" }}>No audit log entries yet.</p>
      ) : (
        <>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                {["Time", "Actor", "Event", "Entity", "ID", "Details"].map(h => <th key={h} style={TH}>{h}</th>)}
              </tr>
            </thead>
            <tbody>
              {logs.map(log => (
                <tr key={log.id}>
                  <td style={{ ...TD, fontFamily: "var(--font-mono)", fontSize: "11px", whiteSpace: "nowrap" }}>
                    {new Date(log.createdAt).toLocaleString("en-GB", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}
                  </td>
                  <td style={{ ...TD, fontSize: "var(--text-caption)" }}>{log.actorEmail ?? "system"}</td>
                  <td style={{ ...TD, fontFamily: "var(--font-mono)", fontSize: "var(--text-caption)", color: "var(--green)" }}>
                    {log.eventType}
                  </td>
                  <td style={{ ...TD, fontSize: "var(--text-caption)" }}>{log.entityType}</td>
                  <td style={{ ...TD, fontFamily: "var(--font-mono)", fontSize: "10px", color: "var(--text-muted)", maxWidth: 100, overflow: "hidden", textOverflow: "ellipsis" }}>
                    {log.entityId ?? "—"}
                  </td>
                  <td style={{ ...TD, fontSize: "var(--text-caption)", maxWidth: 200 }}>
                    {log.details ? (
                      <span style={{ color: "var(--text-secondary)" }}>{log.details.slice(0, 80)}{log.details.length > 80 ? "…" : ""}</span>
                    ) : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination */}
          {totalPages > 1 && (
            <div style={{ display: "flex", gap: "var(--space-2)", marginTop: "var(--space-5)", justifyContent: "center" }}>
              {Array.from({ length: Math.min(totalPages, 10) }, (_, i) => i + 1).map(n => (
                <a
                  key={n}
                  href={`/admin/audit?page=${n}${actorFilter ? `&actor=${actorFilter}` : ""}${entityFilter ? `&entity=${entityFilter}` : ""}`}
                  style={{
                    width: 36, height: 36, display: "grid", placeItems: "center",
                    borderRadius: "var(--radius-pill)", fontFamily: "var(--font-mono)", fontSize: "var(--text-caption)",
                    background: n === page ? "var(--green)" : "var(--surface-raised)",
                    color: n === page ? "#fff" : "var(--text-secondary)",
                    border: "1px solid var(--border-subtle)",
                    textDecoration: "none",
                  }}
                >{n}</a>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}
