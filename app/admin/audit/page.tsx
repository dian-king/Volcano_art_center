import { redirect } from "next/navigation"
import { AdminFilters, AdminPageHeader, AdminPagination } from "@/components/admin/AdminPageChrome"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"

export const dynamic = "force-dynamic"
const PAGE_SIZE = 25

export default async function AuditLogPage({ searchParams }: { searchParams: Promise<Record<string, string>> }) {
  const session = await auth()
  if (session?.user?.role !== "SUPER_ADMIN") redirect("/admin")

  const sp = await searchParams
  const actor = sp.actor ?? ""
  const entity = sp.entity ?? ""
  const event = sp.event ?? ""
  const page = Math.max(1, Number(sp.page ?? 1))

  const where: any = {}
  if (actor) where.actorEmail = { contains: actor, mode: "insensitive" }
  if (entity) where.entityType = { contains: entity, mode: "insensitive" }
  if (event) where.eventType = { contains: event, mode: "insensitive" }

  const [logs, total] = await Promise.all([
    db.auditLog.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      include: { actor: { select: { email: true } } },
    }),
    db.auditLog.count({ where }),
  ])
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE))

  return (
    <div>
      <AdminPageHeader
        eyebrow="Administration"
        title="Audit Log"
        description="Trace important administrative changes by actor, entity, event type, and timestamp."
      />

      <AdminFilters clearHref="/admin/audit" active={Boolean(actor || entity || event)}>
        <input name="actor" defaultValue={actor} placeholder="Actor email..." />
        <input name="entity" defaultValue={entity} placeholder="Entity type..." />
        <input name="event" defaultValue={event} placeholder="Event type..." />
      </AdminFilters>

      <section className="admin-card">
        <div className="admin-card__header">
          <div className="admin-card__header-row">
            <div>
              <h3>System Activity</h3>
              <p>{total.toLocaleString()} entr{total === 1 ? "y" : "ies"} found</p>
            </div>
          </div>
        </div>
        <div className="admin-card__body admin-card__body--flush">
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Time</th>
                  <th>Actor</th>
                  <th>Event</th>
                  <th>Entity</th>
                  <th>Entity ID</th>
                  <th>Details</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr key={log.id}>
                    <td>
                      <span className="td-ref">{new Date(log.createdAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short" })}</span>
                      <div className="td-sub">{new Date(log.createdAt).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}</div>
                    </td>
                    <td>{log.actorEmail ?? log.actor?.email ?? "system"}</td>
                    <td><span className="td-ref">{log.eventType}</span></td>
                    <td>{log.entityType}</td>
                    <td><code style={{ fontSize: "11px" }}>{log.entityId ?? "-"}</code></td>
                    <td style={{ maxWidth: 360 }}>
                      {log.details ? (
                        <span title={log.details} style={{ display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                          {log.details}
                        </span>
                      ) : "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {logs.length === 0 && (
              <p style={{ color: "var(--text-muted)", textAlign: "center", padding: "var(--space-8)" }}>No audit log entries match this filter.</p>
            )}
          </div>
        </div>
      </section>

      <AdminPagination page={page} pages={pages} total={total} basePath="/admin/audit" query={{ actor, entity, event }} />
    </div>
  )
}
