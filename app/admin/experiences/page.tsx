import { db } from "@/lib/db"
import Link from "next/link"
import { DeleteButton } from "@/components/admin/DeleteButton"

export const dynamic = "force-dynamic"

async function feature(fd: FormData) {
  "use server"
  const { toggleExperienceFeatured } = await import("@/actions/admin-content")
  await toggleExperienceFeatured(fd.get("id") as string, true)
  const { redirect } = await import("next/navigation")
  redirect("/admin/experiences")
}

async function unfeature(fd: FormData) {
  "use server"
  const { toggleExperienceFeatured } = await import("@/actions/admin-content")
  await toggleExperienceFeatured(fd.get("id") as string, false)
  const { redirect } = await import("next/navigation")
  redirect("/admin/experiences")
}

async function del(fd: FormData) {
  "use server"
  const { deleteExperience } = await import("@/actions/admin-content")
  await deleteExperience(fd.get("id") as string)
}

export default async function AdminExperiencesPage({ searchParams }: { searchParams: Promise<Record<string, string>> }) {
  const sp = await searchParams
  const q = sp.q ?? ""
  const typeFilter = sp.experienceType ?? ""

  const where: any = {}
  if (typeFilter) where.experienceType = typeFilter
  if (q) where.title = { contains: q, mode: "insensitive" }

  const items = await db.experience.findMany({
    where,
    orderBy: { createdAt: "desc" },
  })

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "var(--space-6)" }}>
        <h1 style={{ fontFamily: "var(--font-display)", fontSize: "var(--text-headline)", fontWeight: 600 }}>Experiences</h1>
        <Link href="/admin/experiences/new" className="btn btn--primary btn--sm">+ New Experience</Link>
      </div>

      <form method="GET" style={{ display: "flex", gap: "var(--space-3)", marginBottom: "var(--space-6)", flexWrap: "wrap" }}>
        <input name="q" defaultValue={q} placeholder="Search experiences…" style={{ height: 40, padding: "0 var(--space-3)", border: "1px solid var(--border-subtle)", borderRadius: "var(--radius-md)", background: "var(--surface-raised)", color: "var(--text-primary)", fontSize: "var(--text-small)", fontFamily: "var(--font-ui)", flex: 1, minWidth: 180 }} />
        <select name="experienceType" defaultValue={typeFilter} style={{ height: 40, padding: "0 var(--space-3)", border: "1px solid var(--border-subtle)", borderRadius: "var(--radius-md)", background: "var(--surface-raised)", color: "var(--text-primary)", fontSize: "var(--text-small)", fontFamily: "var(--font-ui)" }}>
          <option value="">All Types</option>
          <option value="CULTURAL">Cultural</option>
          <option value="VILLAGE">Village</option>
          <option value="CONSERVATION">Conservation</option>
          <option value="CUSTOM">Custom</option>
        </select>
        <button type="submit" className="btn btn--primary btn--sm">Search</button>
        {(q || typeFilter) && <a href="/admin/experiences" className="btn btn--ghost btn--sm">Clear</a>}
      </form>

      <p style={{ fontFamily: "var(--font-mono)", fontSize: "var(--text-caption)", color: "var(--text-muted)", marginBottom: "var(--space-4)" }}>{items.length} experiences</p>

      {items.length === 0 ? (
        <p style={{ color: "var(--text-muted)" }}>No experiences found. <Link href="/admin/experiences/new">Add your first experience →</Link></p>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: "var(--space-4)" }}>
          {items.map((e) => (
            <div key={e.id} className="card card--interactive" style={{ display: "flex", flexDirection: "column" }}>
              <div style={{ position: "relative", aspectRatio: "4/3", background: "var(--green-tint)" }}>
                {e.primaryImageUrl && <img src={e.primaryImageUrl} alt={e.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />}
                <span className={`chip ${e.status === "PUBLISHED" ? "chip--success" : "chip--neutral"}`} style={{ position: "absolute", top: "var(--space-2)", left: "var(--space-2)" }}>{e.status}</span>
                {e.featured && <span style={{ position: "absolute", top: "var(--space-2)", right: "var(--space-2)", fontSize: "1.1rem" }}>⭐</span>}
              </div>
              <div style={{ padding: "var(--space-4)", flex: 1, display: "flex", flexDirection: "column", gap: "var(--space-2)" }}>
                <p style={{ fontFamily: "var(--font-ui)", fontWeight: 700, fontSize: "var(--text-small)", color: "var(--text-primary)" }}>{e.title}</p>
                {e.location && <p style={{ fontSize: "var(--text-caption)", color: "var(--text-muted)" }}>{e.location}</p>}
                <span className="chip chip--neutral" style={{ alignSelf: "flex-start", fontSize: "10px" }}>{e.experienceType}</span>
                <div style={{ display: "flex", gap: "var(--space-3)" }}>
                  {e.pricePerPerson && <p style={{ fontFamily: "var(--font-mono)", color: "var(--green)", fontWeight: 700 }}>${Number(e.pricePerPerson).toFixed(0)}/person</p>}
                  {e.durationHours && <p style={{ fontSize: "var(--text-caption)", color: "var(--text-muted)" }}>{Number(e.durationHours)}h</p>}
                </div>
                <div style={{ display: "flex", gap: "var(--space-2)", marginTop: "auto", flexWrap: "wrap" }}>
                  <a href={`/admin/experiences/${e.id}/edit`} className="btn btn--ghost btn--sm">Edit</a>
                  <form action={e.featured ? unfeature : feature}>
                    <input type="hidden" name="id" value={e.id} />
                    <button type="submit" className="btn btn--ghost btn--sm" style={{ color: e.featured ? "#F59E0B" : "var(--text-muted)" }}>
                      {e.featured ? "★ Unfeature" : "☆ Feature"}
                    </button>
                  </form>
                  <DeleteButton action={del} id={e.id} itemName={e.title} />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
