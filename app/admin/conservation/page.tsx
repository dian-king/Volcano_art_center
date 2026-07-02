import { DeleteButton } from "@/components/admin/DeleteButton"
import { AdminFilters, AdminPageHeader, AdminPagination } from "@/components/admin/AdminPageChrome"
import { db } from "@/lib/db"
import Link from "next/link"

export const dynamic = "force-dynamic"
const PAGE_SIZE = 12

async function feature(fd: FormData) {
  "use server"
  const { toggleCampaignFeatured } = await import("@/actions/admin-content")
  await toggleCampaignFeatured(fd.get("id") as string, true)
  const { redirect } = await import("next/navigation")
  redirect("/admin/conservation")
}

async function unfeature(fd: FormData) {
  "use server"
  const { toggleCampaignFeatured } = await import("@/actions/admin-content")
  await toggleCampaignFeatured(fd.get("id") as string, false)
  const { redirect } = await import("next/navigation")
  redirect("/admin/conservation")
}

async function del(fd: FormData) {
  "use server"
  const { deleteCampaign } = await import("@/actions/admin-content")
  await deleteCampaign(fd.get("id") as string)
}

export default async function AdminConservationPage({ searchParams }: { searchParams: Promise<Record<string, string>> }) {
  const sp = await searchParams
  const q = sp.q ?? ""
  const status = sp.status ?? ""
  const page = Math.max(1, Number(sp.page ?? 1))

  const where: any = {}
  if (status) where.status = status
  if (q) where.name = { contains: q, mode: "insensitive" }

  const [campaigns, total] = await Promise.all([
    db.conservationCampaign.findMany({ where, orderBy: { createdAt: "desc" }, skip: (page - 1) * PAGE_SIZE, take: PAGE_SIZE }),
    db.conservationCampaign.count({ where }),
  ])
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE))

  return (
    <div>
      <AdminPageHeader eyebrow="Conservation" title="Campaigns" description="Manage fundraising campaigns, impact statements, progress, and featured placement." actionHref="/admin/conservation/new" actionLabel="+ New Campaign" />

      <div style={{ marginBottom: "var(--space-4)" }}>
        <Link href="/admin/conservation/donations" className="btn btn--ghost btn--sm">View Donations</Link>
      </div>

      <AdminFilters clearHref="/admin/conservation" active={Boolean(q || status)}>
        <input name="q" defaultValue={q} placeholder="Search campaigns..." />
        <select name="status" defaultValue={status}>
          <option value="">All statuses</option>
          <option value="ACTIVE">Active</option>
          <option value="COMPLETED">Completed</option>
          <option value="PAUSED">Paused</option>
          <option value="DRAFT">Draft</option>
          <option value="ARCHIVED">Archived</option>
        </select>
      </AdminFilters>

      <div className="admin-results-bar"><span>{total} campaign{total === 1 ? "" : "s"}</span><span>{q || status ? "Filtered view" : "All records"}</span></div>

      {campaigns.length === 0 ? (
        <p style={{ color: "var(--text-muted)" }}>No campaigns found. <Link href="/admin/conservation/new">Add your first campaign</Link></p>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: "var(--space-4)" }}>
          {campaigns.map((c) => {
            const goal = Number(c.goalAmount)
            const raised = Number(c.raisedAmount)
            const pct = goal > 0 ? Math.min(100, Math.round((raised / goal) * 100)) : 0
            return (
              <div key={c.id} className="card card--interactive" style={{ display: "flex", flexDirection: "column", overflow: "hidden" }}>
                <div style={{ position: "relative", aspectRatio: "4/3", background: "var(--green-tint)" }}>
                  {c.imageUrl && <img src={c.imageUrl} alt={c.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />}
                  <span className={`chip ${c.status === "ACTIVE" ? "chip--success" : "chip--neutral"}`} style={{ position: "absolute", top: "var(--space-2)", left: "var(--space-2)" }}>{c.status}</span>
                  {c.featured && <span className="chip chip--warning" style={{ position: "absolute", top: "var(--space-2)", right: "var(--space-2)" }}>Featured</span>}
                </div>
                <div style={{ padding: "var(--space-4)", flex: 1, display: "flex", flexDirection: "column", gap: "var(--space-2)" }}>
                  <p style={{ fontFamily: "var(--font-ui)", fontWeight: 700, color: "var(--text-primary)" }}>{c.name}</p>
                  <p style={{ fontFamily: "var(--font-mono)", color: "var(--green)", fontWeight: 700 }}>${raised.toLocaleString()} <span style={{ color: "var(--text-muted)", fontWeight: 400 }}>/ ${goal.toLocaleString()}</span></p>
                  <div style={{ width: "100%", height: 7, background: "var(--border-subtle)", borderRadius: "999px", overflow: "hidden" }}><div style={{ width: `${pct}%`, height: "100%", background: "var(--green)" }} /></div>
                  <p style={{ fontSize: "var(--text-caption)", color: "var(--text-muted)" }}>{pct}% funded - {c.donorCount ?? 0} donors</p>
                  <div style={{ display: "flex", gap: "var(--space-2)", marginTop: "auto", flexWrap: "wrap" }}>
                    <Link href={`/admin/conservation/${c.id}/edit`} className="btn btn--ghost btn--sm">Edit</Link>
                    <form action={c.featured ? unfeature : feature}>
                      <input type="hidden" name="id" value={c.id} />
                      <button type="submit" className="btn btn--ghost btn--sm">{c.featured ? "Unfeature" : "Feature"}</button>
                    </form>
                    <DeleteButton action={del} id={c.id} itemName={c.name} />
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      <AdminPagination page={page} pages={pages} total={total} basePath="/admin/conservation" query={{ q, status }} />
    </div>
  )
}
