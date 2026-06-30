import { DeleteButton } from "@/components/admin/DeleteButton"
import { AdminFilters, AdminPageHeader, AdminPagination } from "@/components/admin/AdminPageChrome"
import { db } from "@/lib/db"
import Link from "next/link"

export const dynamic = "force-dynamic"
const PAGE_SIZE = 12

async function feature(fd: FormData) {
  "use server"
  const { toggleTalentFeatured } = await import("@/actions/admin-content")
  await toggleTalentFeatured(fd.get("id") as string, true)
  const { redirect } = await import("next/navigation")
  redirect("/admin/talent")
}

async function unfeature(fd: FormData) {
  "use server"
  const { toggleTalentFeatured } = await import("@/actions/admin-content")
  await toggleTalentFeatured(fd.get("id") as string, false)
  const { redirect } = await import("next/navigation")
  redirect("/admin/talent")
}

async function del(fd: FormData) {
  "use server"
  const { deleteTalentProfile } = await import("@/actions/admin-content")
  await deleteTalentProfile(fd.get("id") as string)
}

export default async function AdminTalentPage({ searchParams }: { searchParams: Promise<Record<string, string>> }) {
  const sp = await searchParams
  const q = sp.q ?? ""
  const talentArea = sp.talentArea ?? ""
  const status = sp.status ?? ""
  const page = Math.max(1, Number(sp.page ?? 1))

  const where: any = {}
  if (talentArea) where.talentArea = talentArea
  if (status === "PUBLISHED") where.published = true
  if (status === "DRAFT") where.published = false
  if (q) where.displayName = { contains: q, mode: "insensitive" }

  const [profiles, total] = await Promise.all([
    db.talentProfile.findMany({ where, orderBy: { createdAt: "desc" }, skip: (page - 1) * PAGE_SIZE, take: PAGE_SIZE, include: { user: { select: { email: true } } } }),
    db.talentProfile.count({ where }),
  ])
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE))

  return (
    <div>
      <AdminPageHeader eyebrow="Community" title="Talent Profiles" description="Curate public talent profiles, featured artists, bios, and portfolio visibility." actionHref="/admin/talent/new" actionLabel="+ New Profile" />

      <AdminFilters clearHref="/admin/talent" active={Boolean(q || talentArea || status)}>
        <input name="q" defaultValue={q} placeholder="Search talent..." />
        <select name="talentArea" defaultValue={talentArea}>
          <option value="">All areas</option>
          <option value="TRADITIONAL_DANCE">Traditional Dance</option>
          <option value="STORYTELLING">Storytelling</option>
          <option value="CULTURAL_PERFORMANCE">Cultural Performance</option>
          <option value="MUSIC">Music</option>
          <option value="VISUAL_ARTS">Visual Arts</option>
          <option value="CRAFTS">Crafts</option>
          <option value="OTHER">Other</option>
        </select>
        <select name="status" defaultValue={status}>
          <option value="">All statuses</option>
          <option value="PUBLISHED">Published</option>
          <option value="DRAFT">Draft</option>
        </select>
      </AdminFilters>

      <div className="admin-results-bar"><span>{total} profile{total === 1 ? "" : "s"}</span><span>{q || talentArea || status ? "Filtered view" : "All records"}</span></div>

      {profiles.length === 0 ? (
        <p style={{ color: "var(--text-muted)" }}>No profiles found. <Link href="/admin/talent/new">Add your first profile</Link></p>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: "var(--space-4)" }}>
          {profiles.map((p) => (
            <div key={p.id} className="card card--interactive" style={{ display: "flex", flexDirection: "column" }}>
              <div style={{ padding: "var(--space-4)", display: "flex", flexDirection: "column", gap: "var(--space-3)", flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: "var(--space-3)" }}>
                  <div style={{ width: 72, height: 72, borderRadius: "50%", overflow: "hidden", flexShrink: 0, background: "var(--green-tint)", display: "grid", placeItems: "center" }}>
                    {p.imageUrl ? <img src={p.imageUrl} alt={p.displayName} style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <span style={{ fontFamily: "var(--font-display)", color: "var(--green)", fontSize: "1.7rem" }}>{p.displayName.charAt(0)}</span>}
                  </div>
                  <div>
                    <p style={{ fontFamily: "var(--font-ui)", fontWeight: 700, color: "var(--text-primary)" }}>{p.displayName}</p>
                    <p style={{ fontSize: "var(--text-caption)", color: "var(--text-muted)" }}>{p.user.email}</p>
                  </div>
                </div>
                <div style={{ display: "flex", gap: "var(--space-2)", flexWrap: "wrap" }}>
                  <span className="chip chip--neutral" style={{ fontSize: "10px" }}>{p.talentArea.replaceAll("_", " ")}</span>
                  <span className={`chip ${p.published ? "chip--success" : "chip--neutral"}`} style={{ fontSize: "10px" }}>{p.published ? "Published" : "Draft"}</span>
                  {p.featured && <span className="chip chip--warning" style={{ fontSize: "10px" }}>Featured</span>}
                </div>
                {p.bio && <p style={{ fontSize: "var(--text-caption)", color: "var(--text-muted)" }}>{p.bio.slice(0, 80)}{p.bio.length > 80 ? "..." : ""}</p>}
                <div style={{ display: "flex", gap: "var(--space-2)", marginTop: "auto", flexWrap: "wrap" }}>
                  <Link href={`/admin/talent/${p.id}/edit`} className="btn btn--ghost btn--sm">Edit</Link>
                  <form action={p.featured ? unfeature : feature}>
                    <input type="hidden" name="id" value={p.id} />
                    <button type="submit" className="btn btn--ghost btn--sm">{p.featured ? "Unfeature" : "Feature"}</button>
                  </form>
                  <DeleteButton action={del} id={p.id} itemName={p.displayName} />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <AdminPagination page={page} pages={pages} total={total} basePath="/admin/talent" query={{ q, talentArea, status }} />
    </div>
  )
}
