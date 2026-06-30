import { DeleteButton } from "@/components/admin/DeleteButton"
import { AdminFilters, AdminPageHeader, AdminPagination } from "@/components/admin/AdminPageChrome"
import { db } from "@/lib/db"
import Link from "next/link"

export const dynamic = "force-dynamic"
const PAGE_SIZE = 12

async function feature(fd: FormData) {
  "use server"
  const { toggleProductFeatured } = await import("@/actions/admin-content")
  await toggleProductFeatured(fd.get("id") as string, true)
  const { redirect } = await import("next/navigation")
  redirect("/admin/products")
}

async function unfeature(fd: FormData) {
  "use server"
  const { toggleProductFeatured } = await import("@/actions/admin-content")
  await toggleProductFeatured(fd.get("id") as string, false)
  const { redirect } = await import("next/navigation")
  redirect("/admin/products")
}

async function del(fd: FormData) {
  "use server"
  const { deleteProduct } = await import("@/actions/admin-content")
  await deleteProduct(fd.get("id") as string)
}

export default async function AdminProductsPage({ searchParams }: { searchParams: Promise<Record<string, string>> }) {
  const sp = await searchParams
  const q = sp.q ?? ""
  const status = sp.status ?? ""
  const categoryId = sp.categoryId ?? ""
  const page = Math.max(1, Number(sp.page ?? 1))

  const where: any = {}
  if (status) where.status = status
  if (categoryId) where.categoryId = categoryId
  if (q) where.name = { contains: q, mode: "insensitive" }

  const [products, total, categories] = await Promise.all([
    db.product.findMany({ where, orderBy: { createdAt: "desc" }, skip: (page - 1) * PAGE_SIZE, take: PAGE_SIZE, include: { category: true } }),
    db.product.count({ where }),
    db.category.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }),
  ])
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE))

  return (
    <div>
      <AdminPageHeader eyebrow="Operations" title="Art Catalog" description="Manage products, inventory status, pricing, categories, and featured artwork." actionHref="/admin/products/new" actionLabel="+ Add Product" />

      <AdminFilters clearHref="/admin/products" active={Boolean(q || status || categoryId)}>
        <input name="q" defaultValue={q} placeholder="Search products..." />
        <select name="status" defaultValue={status}>
          <option value="">All statuses</option>
          <option value="PUBLISHED">Published</option>
          <option value="DRAFT">Draft</option>
          <option value="ARCHIVED">Archived</option>
          <option value="SOLD">Sold</option>
        </select>
        <select name="categoryId" defaultValue={categoryId}>
          <option value="">All categories</option>
          {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </AdminFilters>

      <div className="admin-results-bar"><span>{total} product{total === 1 ? "" : "s"}</span><span>{q || status || categoryId ? "Filtered view" : "All records"}</span></div>

      {products.length === 0 ? (
        <p style={{ color: "var(--text-muted)" }}>No products found. <Link href="/admin/products/new">Add your first product</Link></p>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: "var(--space-4)" }}>
          {products.map((p) => (
            <div key={p.id} className="card card--interactive" style={{ display: "flex", flexDirection: "column", overflow: "hidden" }}>
              <div style={{ position: "relative", aspectRatio: "4/3", background: "var(--green-tint)" }}>
                {p.primaryImageUrl && <img src={p.primaryImageUrl} alt={p.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />}
                <span className={`chip ${p.status === "PUBLISHED" ? "chip--success" : "chip--neutral"}`} style={{ position: "absolute", top: "var(--space-2)", left: "var(--space-2)" }}>{p.status}</span>
                {p.featured && <span className="chip chip--warning" style={{ position: "absolute", top: "var(--space-2)", right: "var(--space-2)" }}>Featured</span>}
              </div>
              <div style={{ padding: "var(--space-4)", flex: 1, display: "flex", flexDirection: "column", gap: "var(--space-2)" }}>
                <p style={{ fontFamily: "var(--font-ui)", fontWeight: 700, color: "var(--text-primary)" }}>{p.name}</p>
                <p style={{ fontSize: "var(--text-caption)", color: "var(--text-muted)" }}>{p.category?.name ?? "Uncategorized"}</p>
                <p style={{ fontFamily: "var(--font-mono)", color: "var(--green)", fontWeight: 700 }}>${Number(p.price).toFixed(0)}</p>
                <div style={{ display: "flex", gap: "var(--space-2)", marginTop: "auto", flexWrap: "wrap" }}>
                  <Link href={`/admin/products/${p.id}/edit`} className="btn btn--ghost btn--sm">Edit</Link>
                  <form action={p.featured ? unfeature : feature}>
                    <input type="hidden" name="id" value={p.id} />
                    <button type="submit" className="btn btn--ghost btn--sm">{p.featured ? "Unfeature" : "Feature"}</button>
                  </form>
                  <DeleteButton action={del} id={p.id} itemName={p.name} />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <AdminPagination page={page} pages={pages} total={total} basePath="/admin/products" query={{ q, status, categoryId }} />
    </div>
  )
}
