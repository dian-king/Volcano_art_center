import { db } from "@/lib/db"
import { AdminPageHeader } from "@/components/admin/AdminPageChrome"
import { DeleteButton } from "@/components/admin/DeleteButton"
import { createExperienceCategoryAction, updateExperienceCategoryAction, deleteExperienceCategoryAction } from "@/actions/categories"

export const dynamic = "force-dynamic"

export default async function AdminExperienceCategoriesPage() {
  const categories = await db.experienceCategory.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { experiences: true } } },
  })

  async function update(fd: FormData) {
    "use server"
    await updateExperienceCategoryAction(fd.get("id") as string, fd)
  }

  return (
    <div>
      <AdminPageHeader
        eyebrow="Experiences"
        title="Experience Categories"
        description="Categories used to organize and filter Experiences. Deleting a category leaves its experiences uncategorized rather than deleting them."
      />

      <section className="card" style={{ padding: "var(--space-5)", marginBottom: "var(--space-7)" }}>
        <h2 style={{ fontFamily: "var(--font-ui)", fontWeight: 700, fontSize: "var(--text-body)", marginBottom: "var(--space-4)" }}>Add Category</h2>
        <form action={createExperienceCategoryAction} style={{ display: "flex", gap: "var(--space-3)", flexWrap: "wrap", alignItems: "flex-end" }}>
          <div className="field" style={{ flex: "1 1 200px" }}>
            <label className="field__label" htmlFor="name">Name</label>
            <input id="name" name="name" type="text" className="input" required placeholder="e.g. Outdoor & Adventure Activities" />
          </div>
          <div className="field" style={{ flex: "2 1 280px" }}>
            <label className="field__label" htmlFor="description">Description (optional)</label>
            <input id="description" name="description" type="text" className="input" />
          </div>
          <button type="submit" className="btn btn--primary btn--sm">Add</button>
        </form>
      </section>

      <div className="admin-results-bar"><span>{categories.length} categor{categories.length === 1 ? "y" : "ies"}</span></div>

      {categories.length === 0 ? (
        <p style={{ color: "var(--text-muted)" }}>No categories yet — add your first one above.</p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
          {categories.map(c => (
            <form key={c.id} action={update} className="card" style={{ padding: "var(--space-4)", display: "flex", gap: "var(--space-3)", flexWrap: "wrap", alignItems: "flex-end" }}>
              <input type="hidden" name="id" value={c.id} />
              <div className="field" style={{ flex: "1 1 200px" }}>
                <label className="field__label" htmlFor={`name-${c.id}`}>Name</label>
                <input id={`name-${c.id}`} name="name" type="text" className="input" defaultValue={c.name} required />
              </div>
              <div className="field" style={{ flex: "2 1 280px" }}>
                <label className="field__label" htmlFor={`description-${c.id}`}>Description</label>
                <input id={`description-${c.id}`} name="description" type="text" className="input" defaultValue={c.description ?? ""} />
              </div>
              <span className="chip chip--neutral" style={{ marginBottom: "var(--space-1)" }}>{c._count.experiences} experience{c._count.experiences === 1 ? "" : "s"}</span>
              <div style={{ display: "flex", gap: "var(--space-2)" }}>
                <button type="submit" className="btn btn--ghost btn--sm">Save</button>
                <DeleteButton action={deleteExperienceCategoryAction} id={c.id} itemName={c.name} />
              </div>
            </form>
          ))}
        </div>
      )}
    </div>
  )
}
