import { db } from "@/lib/db"
import Link from "next/link"
import { DeleteButton } from "@/components/admin/DeleteButton"

export const dynamic = "force-dynamic"

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
  const statusFilter = sp.status ?? ""

  const where: any = {}
  if (statusFilter) where.status = statusFilter
  if (q) where.name = { contains: q, mode: "insensitive" }

  const campaigns = await db.conservationCampaign.findMany({
    where,
    orderBy: { createdAt: "desc" },
  })

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "var(--space-6)" }}>
        <h1 style={{ fontFamily: "var(--font-display)", fontSize: "var(--text-headline)", fontWeight: 600 }}>Conservation Campaigns</h1>
        <Link href="/admin/conservation/new" className="btn btn--primary btn--sm">+ New Campaign</Link>
      </div>

      <form method="GET" style={{ display: "flex", gap: "var(--space-3)", marginBottom: "var(--space-6)", flexWrap: "wrap" }}>
        <input name="q" defaultValue={q} placeholder="Search campaigns…" style={{ height: 40, padding: "0 var(--space-3)", border: "1px solid var(--border-subtle)", borderRadius: "var(--radius-md)", background: "var(--surface-raised)", color: "var(--text-primary)", fontSize: "var(--text-small)", fontFamily: "var(--font-ui)", flex: 1, minWidth: 180 }} />
        <select name="status" defaultValue={statusFilter} style={{ height: 40, padding: "0 var(--space-3)", border: "1px solid var(--border-subtle)", borderRadius: "var(--radius-md)", background: "var(--surface-raised)", color: "var(--text-primary)", fontSize: "var(--text-small)", fontFamily: "var(--font-ui)" }}>
          <option value="">All Statuses</option>
          <option value="ACTIVE">Active</option>
          <option value="COMPLETED">Completed</option>
          <option value="PAUSED">Paused</option>
          <option value="DRAFT">Draft</option>
        </select>
        <button type="submit" className="btn btn--primary btn--sm">Search</button>
        {(q || statusFilter) && <a href="/admin/conservation" className="btn btn--ghost btn--sm">Clear</a>}
      </form>

      <p style={{ fontFamily: "var(--font-mono)", fontSize: "var(--text-caption)", color: "var(--text-muted)", marginBottom: "var(--space-4)" }}>{campaigns.length} campaigns</p>

      {campaigns.length === 0 ? (
        <p style={{ color: "var(--text-muted)" }}>No campaigns found. <Link href="/admin/conservation/new">Add your first campaign →</Link></p>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: "var(--space-4)" }}>
          {campaigns.map((c) => {
            const goal = Number(c.goalAmount)
            const raised = Number(c.raisedAmount)
            const pct = goal > 0 ? Math.min(100, Math.round(raised / goal * 100)) : 0
            return (
              <div key={c.id} className="card card--interactive" style={{ display: "flex", flexDirection: "column" }}>
                <div style={{ position: "relative", aspectRatio: "4/3", background: "var(--green-tint)" }}>
                  {c.imageUrl && <img src={c.imageUrl} alt={c.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />}
                  <span className={`chip ${c.status === "ACTIVE" ? "chip--success" : "chip--neutral"}`} style={{ position: "absolute", top: "var(--space-2)", left: "var(--space-2)" }}>{c.status}</span>
                  {c.featured && <span style={{ position: "absolute", top: "var(--space-2)", right: "var(--space-2)", fontSize: "1.1rem" }}>⭐</span>}
                </div>
                <div style={{ padding: "var(--space-4)", flex: 1, display: "flex", flexDirection: "column", gap: "var(--space-2)" }}>
                  <p style={{ fontFamily: "var(--font-ui)", fontWeight: 700, fontSize: "var(--text-small)", color: "var(--text-primary)" }}>{c.name}</p>
                  <div style={{ display: "flex", gap: "var(--space-3)" }}>
                    <p style={{ fontFamily: "var(--font-mono)", color: "var(--green)", fontWeight: 700, fontSize: "var(--text-caption)" }}>${raised.toLocaleString()}</p>
                    <p style={{ fontFamily: "var(--font-mono)", color: "var(--text-muted)", fontSize: "var(--text-caption)" }}>/ ${goal.toLocaleString()}</p>
                  </div>
                  <div style={{ width: "100%", height: 6, background: "var(--border-subtle)", borderRadius: "var(--radius-pill)" }}>
                    <div style={{ width: `${pct}%`, height: "100%", background: "var(--green)", borderRadius: "var(--radius-pill)" }} />
                  </div>
                  <p style={{ fontSize: "var(--text-caption)", color: "var(--text-muted)" }}>{pct}% · {c.donorCount ?? 0} donors</p>
                  <div style={{ display: "flex", gap: "var(--space-2)", marginTop: "auto", flexWrap: "wrap" }}>
                    <a href={`/admin/conservation/${c.id}/edit`} className="btn btn--ghost btn--sm">Edit</a>
                    <form action={c.featured ? unfeature : feature}>
                      <input type="hidden" name="id" value={c.id} />
                      <button type="submit" className="btn btn--ghost btn--sm" style={{ color: c.featured ? "#F59E0B" : "var(--text-muted)" }}>
                        {c.featured ? "★ Unfeature" : "☆ Feature"}
                      </button>
                    </form>
                    <DeleteButton action={del} id={c.id} itemName={c.name} />
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
