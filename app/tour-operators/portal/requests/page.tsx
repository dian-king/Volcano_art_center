import { deleteOwnOperatorRequestAction, updateOwnOperatorRequestAction } from "@/actions/tour-operators"
import { DeleteButton } from "@/components/admin/DeleteButton"
import { OperatorRequestEditor } from "@/components/operators/OperatorRequestEditor"
import { db } from "@/lib/db"
import { getPortalSession, getTourOperatorByUserId } from "@/lib/portal-session"
import { CalendarDays, FileText, PlusCircle, Search, Users } from "lucide-react"
import Link from "next/link"
import { redirect } from "next/navigation"

export const dynamic = "force-dynamic"
const PAGE_SIZE = 8

const statusColor: Record<string, string> = {
  SUBMITTED: "#d97706",
  UNDER_REVIEW: "#2563eb",
  INVOICE_PENDING: "#7c3aed",
  CONFIRMED: "#16a34a",
  DECLINED: "#dc2626",
}

function statusBadge(status: string) {
  const color = statusColor[status] ?? "var(--text-muted)"
  return (
    <span className="operator-status" style={{ ["--status-color" as string]: color }}>
      <span />
      {status.replaceAll("_", " ")}
    </span>
  )
}

export default async function OperatorRequestsPage({ searchParams }: { searchParams: Promise<Record<string, string>> }) {
  const session = await getPortalSession()
  if (!session?.user?.id) redirect("/login?next=/tour-operators/portal/requests")

  const operator = await getTourOperatorByUserId(session.user.id)
  if (!operator) redirect("/tour-operators/portal/profile")

  const sp = await searchParams
  const status = sp.status ?? ""
  const type = sp.type ?? ""
  const q = sp.q ?? ""
  const page = Math.max(1, Number(sp.page ?? 1))

  const where: any = { operatorId: operator.id }
  if (status) where.status = status
  if (type) where.requestType = type
  if (q) {
    where.OR = [
      { experienceSlug: { contains: q, mode: "insensitive" } },
      { specialRequests: { contains: q, mode: "insensitive" } },
      { adminNote: { contains: q, mode: "insensitive" } },
    ]
  }

  const [requests, total, allCounts, experiences] = await Promise.all([
    db.operatorRequest.findMany({ where, orderBy: { createdAt: "desc" }, skip: (page - 1) * PAGE_SIZE, take: PAGE_SIZE }),
    db.operatorRequest.count({ where }),
    db.operatorRequest.groupBy({ by: ["status"], where: { operatorId: operator.id }, _count: { _all: true } }),
    db.experience.findMany({ where: { status: "PUBLISHED" }, orderBy: { title: "asc" }, select: { slug: true, title: true } }),
  ])
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE))
  const queryBase = new URLSearchParams()
  if (status) queryBase.set("status", status)
  if (type) queryBase.set("type", type)
  if (q) queryBase.set("q", q)

  const counts = new Map(allCounts.map(item => [item.status, item._count._all]))
  const activeCount = (counts.get("SUBMITTED") ?? 0) + (counts.get("UNDER_REVIEW") ?? 0) + (counts.get("INVOICE_PENDING") ?? 0)
  const confirmedCount = counts.get("CONFIRMED") ?? 0
  const editableCount = (counts.get("SUBMITTED") ?? 0) + (counts.get("UNDER_REVIEW") ?? 0)
  const experienceTitles = new Map(experiences.map(experience => [experience.slug, experience.title]))

  return (
    <div className="operator-requests">
      <header className="operator-requests__hero">
        <div>
          <span className="eyebrow">Tour Operator</span>
          <h1>Company Requests</h1>
          <p>Track group bookings, custom itinerary requests, quotations, and operational follow-up in one workspace.</p>
        </div>
        <Link href="/tour-operators/portal/requests/new" className="btn btn--primary">
          <PlusCircle size={17} />
          New Request
        </Link>
      </header>

      <section className="operator-request-stats" aria-label="Request summary">
        <div>
          <span>Active requests</span>
          <strong>{activeCount}</strong>
        </div>
        <div>
          <span>Confirmed</span>
          <strong>{confirmedCount}</strong>
        </div>
        <div>
          <span>Editable</span>
          <strong>{editableCount}</strong>
        </div>
      </section>

      <section className="operator-request-panel">
        <form method="GET" className="operator-request-filters">
          <label>
            <Search size={16} />
            <input name="q" defaultValue={q} placeholder="Search requests, notes, or itinerary..." />
          </label>
          <select name="status" defaultValue={status}>
            <option value="">All statuses</option>
            {["SUBMITTED", "UNDER_REVIEW", "INVOICE_PENDING", "CONFIRMED", "DECLINED"].map(s => <option key={s} value={s}>{s.replaceAll("_", " ")}</option>)}
          </select>
          <select name="type" defaultValue={type}>
            <option value="">All types</option>
            <option value="GROUP_BOOKING">Group booking</option>
            <option value="CUSTOM_PACKAGE">Custom package</option>
          </select>
          <button type="submit" className="btn btn--primary btn--sm">Apply</button>
          {(q || status || type) && <Link href="/tour-operators/portal/requests" className="btn btn--ghost btn--sm">Clear</Link>}
        </form>

        {requests.length === 0 ? (
          <div className="operator-request-empty">
            <FileText size={34} />
            <h2>No requests match this view</h2>
            <p>Try clearing filters or submit a new request for the operations team.</p>
            <Link href="/tour-operators/portal/requests/new" className="btn btn--primary btn--sm">Create request</Link>
          </div>
        ) : (
          <div className="operator-request-list">
            {requests.map(request => {
              const editable = ["SUBMITTED", "UNDER_REVIEW"].includes(request.status)
              const update = updateOwnOperatorRequestAction.bind(null, request.id)
              const title = request.experienceSlug ? experienceTitles.get(request.experienceSlug) ?? request.experienceSlug : "Custom itinerary"
              return (
                <article key={request.id} className="operator-request-card">
                  <div className="operator-request-card__main">
                    <div className="operator-request-card__top">
                      <div>
                        <span className="operator-request-card__type">{request.requestType.replaceAll("_", " ")}</span>
                        <h2>{title}</h2>
                        <p className="operator-request-card__id">Request #{request.id.slice(0, 8).toUpperCase()}</p>
                      </div>
                      {statusBadge(request.status)}
                    </div>

                    <div className="operator-request-meta">
                      <span><Users size={15} /> {request.estimatedSize} guests</span>
                      <span><CalendarDays size={15} /> {request.estimatedDate ? request.estimatedDate.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : "Date flexible"}</span>
                      <span><FileText size={15} /> {request.invoiceRequired ? "Invoice required" : "Invoice optional"}</span>
                    </div>

                    {request.specialRequests && <p className="operator-request-card__notes">{request.specialRequests}</p>}
                    {request.adminNote && <p className="operator-request-card__ops">Ops note: {request.adminNote}</p>}
                  </div>

                  <div className="operator-request-card__actions">
                    {["INVOICE_PENDING", "CONFIRMED"].includes(request.status) && (
                      <Link href={`/tour-operators/portal/requests/${request.id}/quotation`} className="btn btn--ghost btn--sm" target="_blank">Quote</Link>
                    )}
                    {editable && (
                      <>
                        <OperatorRequestEditor
                          request={{
                            id: request.id,
                            requestType: request.requestType,
                            experienceSlug: request.experienceSlug ?? "",
                            estimatedSize: request.estimatedSize,
                            estimatedDate: request.estimatedDate?.toISOString().slice(0, 10) ?? "",
                            invoiceRequired: request.invoiceRequired,
                            specialRequests: request.specialRequests ?? "",
                          }}
                          experiences={experiences}
                          action={update}
                        />
                        <DeleteButton action={deleteOwnOperatorRequestAction} id={request.id} itemName={request.experienceSlug ?? "request"} />
                      </>
                    )}
                  </div>
                </article>
              )
            })}
          </div>
        )}

        <footer className="operator-request-pagination">
          <span>{total} result{total === 1 ? "" : "s"} - Page {page} of {pages}</span>
          <div>
            {page > 1 && <Link className="btn btn--ghost btn--sm" href={`/tour-operators/portal/requests?${new URLSearchParams([...queryBase.entries(), ["page", String(page - 1)]]).toString()}`}>Previous</Link>}
            {page < pages && <Link className="btn btn--ghost btn--sm" href={`/tour-operators/portal/requests?${new URLSearchParams([...queryBase.entries(), ["page", String(page + 1)]]).toString()}`}>Next</Link>}
          </div>
        </footer>
      </section>
    </div>
  )
}
