import { db } from "@/lib/db"
import Link from "next/link"
import { DeleteButton } from "@/components/admin/DeleteButton"

export const dynamic = "force-dynamic"

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
  const areaFilter = sp.talentArea ?? ""

  const where: any = {}
  if (areaFilter) where.talentArea = areaFilter
  if (q) where.displayName = { contains: q, mode: "insensitive" }

  const profiles = await db.talentProfile.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: { user: { select: { email: true } } },
  })

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "var(--space-6)" }}>
        <h1 style={{ fontFamily: "var(--font-display)", fontSize: "var(--text-headline)", fontWeight: 600 }}>Talent Profiles</h1>
        <Link href="/admin/talent/new" className="btn btn--primary btn--sm">+ New Profile</Link>
      </div>

      <form method="GET" style={{ display: "flex", gap: "var(--space-3)", marginBottom: "var(--space-6)", flexWrap: "wrap" }}>
        <input name="q" defaultValue={q} placeholder="Search talent…" style={{ height: 40, padding: "0 var(--space-3)", border: "1px solid var(--border-subtle)", borderRadius: "var(--radius-md)", background: "var(--surface-raised)", color: "var(--text-primary)", fontSize: "var(--text-small)", fontFamily: "var(--font-ui)", flex: 1, minWidth: 180 }} />
        <select name="talentArea" defaultValue={areaFilter} style={{ height: 40, padding: "0 var(--space-3)", border: "1px solid var(--border-subtle)", borderRadius: "var(--radius-md)", background: "var(--surface-raised)", color: "var(--text-primary)", fontSize: "var(--text-small)", fontFamily: "var(--font-ui)" }}>
          <option value="">All Areas</option>
          <option value="VISUAL_ARTS">Visual Arts</option>
          <option value="PERFORMING_ARTS">Performing Arts</option>
          <option value="MUSIC">Music</option>
          <option value="CRAFT">Craft</option>
          <option value="CULINARY">Culinary</option>
          <option value="STORYTELLING">Storytelling</option>
          <option value="OTHER">Other</option>
        </select>
        <button type="submit" className="btn btn--primary btn--sm">Search</button>
        {(q || areaFilter) && <a href="/admin/talent" className="btn btn--ghost btn--sm">Clear</a>}
      </form>

      <p style={{ fontFamily: "var(--font-mono)", fontSize: "var(--text-caption)", color: "var(--text-muted)", marginBottom: "var(--space-4)" }}>{profiles.length} profiles</p>

      {profiles.length === 0 ? (
        <p style={{ color: "var(--text-muted)" }}>No profiles found. <Link href="/admin/talent/new">Add your first profile →</Link></p>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: "var(--space-4)" }}>
          {profiles.map((p) => (
            <div key={p.id} className="card card--interactive" style={{ display: "flex", flexDirection: "column" }}>
              <div style={{ padding: "var(--space-4)", display: "flex", flexDirection: "column", gap: "var(--space-3)", flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: "var(--space-3)" }}>
                  <div style={{ width: 80, height: 80, borderRadius: "50%", overflow: "hidden", flexShrink: 0, background: "var(--green-tint)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    {p.imageUrl
                      ? <img src={p.imageUrl} alt={p.displayName} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      : <span style={{ fontFamily: "var(--font-display)", color: "var(--green)", fontSize: "1.8rem" }}>{p.displayName.charAt(0)}</span>
                    }
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-1)" }}>
                    <p style={{ fontFamily: "var(--font-ui)", fontWeight: 700, fontSize: "var(--text-small)", color: "var(--text-primary)" }}>{p.displayName}</p>
                    {p.featured && <span style={{ fontSize: "1rem" }}>⭐</span>}
                  </div>
                </div>
                <div style={{ display: "flex", gap: "var(--space-2)", flexWrap: "wrap" }}>
                  <span className="chip chip--neutral" style={{ fontSize: "10px" }}>{p.talentArea.replace(/_/g, " ")}</span>
                  <span className="chip chip--neutral" style={{ fontSize: "10px" }}>{p.category}</span>
                </div>
                {p.bio && <p style={{ fontSize: "var(--text-caption)", color: "var(--text-muted)" }}>{p.bio.slice(0, 60)}{p.bio.length > 60 ? "…" : ""}</p>}
                <span className={`chip ${p.published ? "chip--success" : "chip--neutral"}`} style={{ alignSelf: "flex-start", fontSize: "10px" }}>{p.published ? "Published" : "Draft"}</span>
                <div style={{ display: "flex", gap: "var(--space-2)", marginTop: "auto", flexWrap: "wrap" }}>
                  <a href={`/admin/talent/${p.id}/edit`} className="btn btn--ghost btn--sm">Edit</a>
                  <form action={p.featured ? unfeature : feature}>
                    <input type="hidden" name="id" value={p.id} />
                    <button type="submit" className="btn btn--ghost btn--sm" style={{ color: p.featured ? "#F59E0B" : "var(--text-muted)" }}>
                      {p.featured ? "★ Unfeature" : "☆ Feature"}
                    </button>
                  </form>
                  <DeleteButton action={del} id={p.id} itemName={p.displayName} />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
