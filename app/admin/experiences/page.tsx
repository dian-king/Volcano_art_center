import { DeleteButton } from "@/components/admin/DeleteButton"
import { AdminFilters, AdminPageHeader, AdminPagination } from "@/components/admin/AdminPageChrome"
import { db } from "@/lib/db"
import { formatPrice } from "@/lib/utils"
import Link from "next/link"

export const dynamic = "force-dynamic"
const PAGE_SIZE = 12

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
  const categoryId = sp.categoryId ?? ""
  const status = sp.status ?? ""
  const page = Math.max(1, Number(sp.page ?? 1))

  const where: any = {}
  if (categoryId) where.categoryId = categoryId
  if (status) where.status = status
  if (q) where.title = { contains: q, mode: "insensitive" }

  const [items, total, categories] = await Promise.all([
    db.experience.findMany({ where, orderBy: { createdAt: "desc" }, skip: (page - 1) * PAGE_SIZE, take: PAGE_SIZE, include: { category: true } }),
    db.experience.count({ where }),
    db.experienceCategory.findMany({ orderBy: { name: "asc" } }),
  ])
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE))

  return (
    <div>
      <AdminPageHeader eyebrow="Content Studio" title="Experiences" description="Manage public experience pages, pricing, availability posture, and featured placement." actionHref="/admin/experiences/new" actionLabel="+ New Experience" />

      <AdminFilters clearHref="/admin/experiences" active={Boolean(q || categoryId || status)}>
        <input name="q" defaultValue={q} placeholder="Search experiences..." />
        <select name="categoryId" defaultValue={categoryId}>
          <option value="">All categories</option>
          {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <select name="status" defaultValue={status}>
          <option value="">All statuses</option>
          <option value="PUBLISHED">Published</option>
          <option value="DRAFT">Draft</option>
          <option value="ARCHIVED">Archived</option>
        </select>
      </AdminFilters>

      <div className="admin-results-bar"><span>{total} experience{total === 1 ? "" : "s"}</span><span>{q || categoryId || status ? "Filtered view" : "All records"}</span></div>

      {items.length === 0 ? (
        <p style={{ color: "var(--text-muted)" }}>No experiences found. <Link href="/admin/experiences/new">Add your first experience</Link></p>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: "var(--space-4)" }}>
          {items.map((e) => (
            <div key={e.id} className="card card--interactive" style={{ display: "flex", flexDirection: "column", overflow: "hidden" }}>
              <div style={{ position: "relative", aspectRatio: "4/3", background: "var(--green-tint)" }}>
                {e.primaryImageUrl && <img src={e.primaryImageUrl} alt={e.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />}
                <span className={`chip ${e.status === "PUBLISHED" ? "chip--success" : "chip--neutral"}`} style={{ position: "absolute", top: "var(--space-2)", left: "var(--space-2)" }}>{e.status}</span>
                {e.featured && <span className="chip chip--warning" style={{ position: "absolute", top: "var(--space-2)", right: "var(--space-2)" }}>Featured</span>}
              </div>
              <div style={{ padding: "var(--space-4)", flex: 1, display: "flex", flexDirection: "column", gap: "var(--space-2)" }}>
                <p style={{ fontFamily: "var(--font-ui)", fontWeight: 700, color: "var(--text-primary)" }}>{e.title}</p>
                {e.location && <p style={{ fontSize: "var(--text-caption)", color: "var(--text-muted)" }}>{e.location}</p>}
                {e.category && <span className="chip chip--neutral" style={{ alignSelf: "flex-start", fontSize: "10px" }}>{e.category.name}</span>}
                <div style={{ display: "flex", gap: "var(--space-3)", alignItems: "center" }}>
                  {e.pricePerPerson && <p style={{ fontFamily: "var(--font-mono)", color: "var(--green)", fontWeight: 700 }}>{formatPrice(e.pricePerPerson.toString(), e.currency as "USD" | "RWF")}/person</p>}
                  {e.durationHours && <p style={{ fontSize: "var(--text-caption)", color: "var(--text-muted)" }}>{Number(e.durationHours)}h</p>}
                </div>
                <div style={{ display: "flex", gap: "var(--space-2)", marginTop: "auto", flexWrap: "wrap" }}>
                  <Link href={`/admin/experiences/${e.id}/edit`} className="btn btn--ghost btn--sm">Edit</Link>
                  <form action={e.featured ? unfeature : feature}>
                    <input type="hidden" name="id" value={e.id} />
                    <button type="submit" className="btn btn--ghost btn--sm">{e.featured ? "Unfeature" : "Feature"}</button>
                  </form>
                  <DeleteButton action={del} id={e.id} itemName={e.title} />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <AdminPagination page={page} pages={pages} total={total} basePath="/admin/experiences" query={{ q, categoryId, status }} />
    </div>
  )
}
