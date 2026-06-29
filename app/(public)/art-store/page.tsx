import { db } from "@/lib/db"
import { ProductCard } from "@/components/public/ProductCard"
import { SortSelect } from "@/components/public/SortSelect"
import { StockFilter } from "@/components/public/StockFilter"
import { EmptyState } from "@/components/ui/EmptyState"
import Link from "next/link"
import { Package } from "lucide-react"
import type { Metadata } from "next"

export const revalidate = 3600
export const metadata: Metadata = {
  title: "Art Store",
  description: "Browse authentic Rwandan fine art — paintings, sculpture, textiles, and photography.",
}

export default async function ArtStorePage({ searchParams }: { searchParams: Promise<Record<string, string>> }) {
  const params = await searchParams
  const page = Number(params.page ?? 1)
  const perPage = 12
  const skip = (page - 1) * perPage

  const where: Record<string, unknown> = { status: "PUBLISHED" }
  if (params.category) where.category = { slug: params.category }
  if (params.inStock === "true") where.stockQuantity = { gt: 0 }

  const orderBy = params.sort === "price_asc" ? { price: "asc" as const }
    : params.sort === "price_desc" ? { price: "desc" as const }
    : params.sort === "newest" ? { createdAt: "desc" as const }
    : { featured: "desc" as const }

  const [products, total, categories] = await Promise.all([
    db.product.findMany({ where, orderBy, skip, take: perPage, include: { category: true } })
      .then(ps => ps.map(p => ({ ...p, price: Number(p.price), compareAtPrice: p.compareAtPrice ? Number(p.compareAtPrice) : null, weight: p.weight ? Number(p.weight) : null }))),
    db.product.count({ where }),
    db.category.findMany({ orderBy: { name: "asc" } }),
  ])

  const totalPages = Math.ceil(total / perPage)

  const activeLinkStyle = {
    color: "var(--green)",
    fontWeight: 600,
    background: "var(--green-tint)",
    borderRadius: "var(--radius-sm)",
  }
  const linkStyle = {
    display: "block",
    padding: "var(--space-2) var(--space-3)",
    fontSize: "var(--text-small)",
    color: "var(--text-secondary)",
    borderRadius: "var(--radius-sm)",
    transition: "background 0.15s",
  }

  return (
    <div style={{ paddingTop: "var(--nav-height)" }}>
      {/* Page header */}
      <div style={{ background: "var(--green-deep)", color: "#fff", padding: "var(--space-8) 0 var(--space-7)" }}>
        <div className="container">
          <span className="eyebrow" style={{ color: "rgba(255,255,255,0.65)" }}>Our Collection</span>
          <h1 style={{ fontFamily: "var(--font-display)", fontSize: "var(--text-headline)", fontWeight: 600, marginTop: "var(--space-2)", color: "#fff" }}>
            Art Store
          </h1>
          <p style={{ color: "rgba(255,255,255,0.75)", fontSize: "var(--text-lead)", marginTop: "var(--space-3)" }}>
            Authentic Rwandan fine art, direct from the artist
          </p>
        </div>
      </div>

      {/* Main content: sidebar + grid */}
      <div className="container store-layout">

        {/* Filter Sidebar */}
        <aside>
          <div style={{ background: "var(--surface-raised)", border: "1px solid var(--border-subtle)", borderRadius: "var(--radius-lg)", padding: "var(--space-5)", position: "sticky", top: "calc(var(--nav-height) + var(--space-5))" }}>
            <h3 style={{ fontFamily: "var(--font-ui)", fontWeight: 700, fontSize: "var(--text-caption)", letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--text-muted)", marginBottom: "var(--space-3)" }}>
              Category
            </h3>
            <nav style={{ display: "flex", flexDirection: "column", gap: "var(--space-1)" }}>
              <Link href="/art-store" style={{ ...linkStyle, ...((!params.category) ? activeLinkStyle : {}) }}>
                All Artworks
              </Link>
              {categories.map((c) => (
                <Link
                  key={c.id}
                  href={`/art-store?category=${c.slug}${params.sort ? "&sort=" + params.sort : ""}`}
                  style={{ ...linkStyle, ...(params.category === c.slug ? activeLinkStyle : {}) }}
                >
                  {c.name}
                </Link>
              ))}
            </nav>

            <div style={{ borderTop: "1px solid var(--border-subtle)", marginTop: "var(--space-5)", paddingTop: "var(--space-5)" }}>
              <h3 style={{ fontFamily: "var(--font-ui)", fontWeight: 700, fontSize: "var(--text-caption)", letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--text-muted)", marginBottom: "var(--space-3)" }}>
                Availability
              </h3>
              <StockFilter checked={params.inStock === "true"} />
            </div>
          </div>
        </aside>

        {/* Products area */}
        <div>
          {/* Toolbar */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "var(--space-6)", flexWrap: "wrap", gap: "var(--space-3)" }}>
            <p style={{ fontFamily: "var(--font-ui)", fontSize: "var(--text-small)", color: "var(--text-muted)" }}>
              <strong style={{ color: "var(--text-primary)", fontFamily: "var(--font-mono)" }}>{total}</strong> artwork{total !== 1 ? "s" : ""}
              {params.category && <span> in <strong style={{ color: "var(--green)" }}>{categories.find(c => c.slug === params.category)?.name}</strong></span>}
            </p>
            <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)" }}>
              <label style={{ fontSize: "var(--text-small)", color: "var(--text-muted)", fontFamily: "var(--font-ui)" }}>Sort:</label>
              <SortSelect value={params.sort ?? "featured"} />
            </div>
          </div>

          {/* Product grid */}
          {products.length === 0 ? (
            <EmptyState icon={Package} title="No artworks found" description="Try a different category or remove filters." action={{ label: "Clear filters", href: "/art-store" }} />
          ) : (
            <div className="art-grid">
              {products.map((p) => <ProductCard key={p.id} product={p} />)}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <nav aria-label="Pagination" style={{ display: "flex", gap: "var(--space-2)", marginTop: "var(--space-8)", justifyContent: "center", flexWrap: "wrap" }}>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
                <Link
                  key={n}
                  href={`/art-store?page=${n}${params.category ? "&category=" + params.category : ""}`}
                  style={{
                    width: "40px", height: "40px", display: "grid", placeItems: "center",
                    borderRadius: "var(--radius-pill)", fontFamily: "var(--font-ui)",
                    fontWeight: 600, fontSize: "var(--text-small)",
                    background: n === page ? "var(--green)" : "var(--surface-raised)",
                    color: n === page ? "#fff" : "var(--text-secondary)",
                    border: "1px solid",
                    borderColor: n === page ? "var(--green)" : "var(--border-subtle)",
                  }}
                >
                  {n}
                </Link>
              ))}
            </nav>
          )}
        </div>
      </div>
    </div>
  )
}