import { db } from "@/lib/db"
import Link from "next/link"
import { DeleteButton } from "@/components/admin/DeleteButton"

export const dynamic = "force-dynamic"

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
  const statusFilter = sp.status ?? ""

  const where: any = {}
  if (statusFilter) where.status = statusFilter
  if (q) where.name = { contains: q, mode: "insensitive" }

  const products = await db.product.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: { category: true },
  })

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "var(--space-6)" }}>
        <h1 style={{ fontFamily: "var(--font-display)", fontSize: "var(--text-headline)", fontWeight: 600 }}>Products</h1>
        <Link href="/admin/products/new" className="btn btn--primary btn--sm">+ Add Product</Link>
      </div>

      <form method="GET" style={{ display: "flex", gap: "var(--space-3)", marginBottom: "var(--space-6)", flexWrap: "wrap" }}>
        <input name="q" defaultValue={q} placeholder="Search products…" style={{ height: 40, padding: "0 var(--space-3)", border: "1px solid var(--border-subtle)", borderRadius: "var(--radius-md)", background: "var(--surface-raised)", color: "var(--text-primary)", fontSize: "var(--text-small)", fontFamily: "var(--font-ui)", flex: 1, minWidth: 180 }} />
        <select name="status" defaultValue={statusFilter} style={{ height: 40, padding: "0 var(--space-3)", border: "1px solid var(--border-subtle)", borderRadius: "var(--radius-md)", background: "var(--surface-raised)", color: "var(--text-primary)", fontSize: "var(--text-small)", fontFamily: "var(--font-ui)" }}>
          <option value="">All Statuses</option>
          <option value="PUBLISHED">Published</option>
          <option value="DRAFT">Draft</option>
          <option value="ARCHIVED">Archived</option>
          <option value="SOLD">Sold</option>
        </select>
        <button type="submit" className="btn btn--primary btn--sm">Search</button>
        {(q || statusFilter) && <a href="/admin/products" className="btn btn--ghost btn--sm">Clear</a>}
      </form>

      <p style={{ fontFamily: "var(--font-mono)", fontSize: "var(--text-caption)", color: "var(--text-muted)", marginBottom: "var(--space-4)" }}>{products.length} products</p>

      {products.length === 0 ? (
        <p style={{ color: "var(--text-muted)" }}>No products found. <Link href="/admin/products/new">Add your first product →</Link></p>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: "var(--space-4)" }}>
          {products.map((p) => (
            <div key={p.id} className="card card--interactive" style={{ display: "flex", flexDirection: "column" }}>
              <div style={{ position: "relative", aspectRatio: "4/3", background: "var(--green-tint)" }}>
                {p.primaryImageUrl && <img src={p.primaryImageUrl} alt={p.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />}
                <span className={`chip ${p.status === "PUBLISHED" ? "chip--success" : "chip--neutral"}`} style={{ position: "absolute", top: "var(--space-2)", left: "var(--space-2)" }}>{p.status}</span>
                {p.featured && <span style={{ position: "absolute", top: "var(--space-2)", right: "var(--space-2)", fontSize: "1.1rem" }}>⭐</span>}
              </div>
              <div style={{ padding: "var(--space-4)", flex: 1, display: "flex", flexDirection: "column", gap: "var(--space-2)" }}>
                <p style={{ fontFamily: "var(--font-ui)", fontWeight: 700, fontSize: "var(--text-small)", color: "var(--text-primary)" }}>{p.name}</p>
                <p style={{ fontSize: "var(--text-caption)", color: "var(--text-muted)" }}>{p.category?.name}</p>
                <p style={{ fontFamily: "var(--font-mono)", color: "var(--green)", fontWeight: 700 }}>${Number(p.price).toFixed(0)}</p>
                <div style={{ display: "flex", gap: "var(--space-2)", marginTop: "auto", flexWrap: "wrap" }}>
                  <a href={`/admin/products/${p.id}/edit`} className="btn btn--ghost btn--sm">Edit</a>
                  <form action={p.featured ? unfeature : feature}>
                    <input type="hidden" name="id" value={p.id} />
                    <button type="submit" className="btn btn--ghost btn--sm" style={{ color: p.featured ? "#F59E0B" : "var(--text-muted)" }}>
                      {p.featured ? "★ Unfeature" : "☆ Feature"}
                    </button>
                  </form>
                  <DeleteButton action={del} id={p.id} itemName={p.name} />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
