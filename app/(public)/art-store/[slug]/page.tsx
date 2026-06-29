import { db } from "@/lib/db"
import { ProductCard } from "@/components/public/ProductCard"
import { ReviewCard } from "@/components/public/ReviewCard"
import { AddToCartButton } from "@/components/public/AddToCartButton"
import { ProductGallery } from "@/components/public/ProductGallery"
import { formatPrice } from "@/lib/utils"
import { notFound } from "next/navigation"
import Link from "next/link"
import type { Metadata } from "next"

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const product = await db.product.findUnique({ where: { slug } })
  if (!product) return {}
  return {
    title: product.name,
    description: product.description ?? `${product.name} by ${product.artistName}`,
    openGraph: { title: product.name, description: product.description ?? "", images: product.primaryImageUrl ? [product.primaryImageUrl] : [] },
  }
}

export default async function ProductDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const product = await db.product.findUnique({
    where: { slug },
    include: { category: true, images: { orderBy: { position: "asc" } }, reviews: { where: { approved: true } } },
  })
  if (!product || product.status !== "PUBLISHED") notFound()

  const related = await db.product.findMany({
    where: { categoryId: product.categoryId, status: "PUBLISHED", NOT: { id: product.id } },
    take: 4, include: { category: true },
  }).then(ps => ps.map(p => ({ ...p, price: Number(p.price), compareAtPrice: p.compareAtPrice ? Number(p.compareAtPrice) : null, weight: p.weight ? Number(p.weight) : null })))

  const inStock = product.stockQuantity > 0
  const price = Number(product.price)

  return (
    <div style={{ paddingTop: "var(--nav-height)" }}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Product",
            name: product.name,
            description: product.description ?? undefined,
            image: product.primaryImageUrl ?? undefined,
            offers: {
              "@type": "Offer",
              price: Number(product.price),
              priceCurrency: "USD",
              availability: product.stockQuantity > 0
                ? "https://schema.org/InStock"
                : "https://schema.org/OutOfStock",
              seller: { "@type": "Organization", name: "Volcano Arts Center Inc Rwanda" }
            },
            brand: { "@type": "Brand", name: product.artistName ?? "Volcano Arts Center" },
          })
        }}
      />

      {/* Breadcrumb */}
      <div className="container" style={{ paddingTop: "var(--space-5)", paddingBottom: "var(--space-4)" }}>
        <nav style={{ display: "flex", gap: "var(--space-2)", fontSize: "var(--text-caption)", color: "var(--text-muted)", fontFamily: "var(--font-ui)", alignItems: "center" }}>
          <Link href="/art-store" style={{ color: "var(--text-muted)" }}>Art Store</Link>
          <span>›</span>
          {product.category && <><Link href={`/art-store?category=${product.category.slug}`} style={{ color: "var(--text-muted)" }}>{product.category.name}</Link><span>›</span></>}
          <span style={{ color: "var(--text-primary)" }}>{product.name}</span>
        </nav>
      </div>

      {/* Main content: image + info */}
      <div className="container split-2 split-2--start" style={{ paddingBottom: "var(--space-8)" }}>

        {/* Gallery */}
        <ProductGallery primaryImageUrl={product.primaryImageUrl} images={product.images} productName={product.name} />

        {/* Info panel */}
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-5)", position: "sticky", top: "calc(var(--nav-height) + var(--space-5))" }}>
          {product.category && (
            <p style={{ fontFamily: "var(--font-ui)", fontSize: "var(--text-caption)", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--green)" }}>
              {product.category.name}
            </p>
          )}

          <div>
            <h1 style={{ fontFamily: "var(--font-display)", fontSize: "var(--text-headline)", fontWeight: 600, lineHeight: 1.1, color: "var(--text-primary)" }}>
              {product.name}
            </h1>
            {product.artistName && (
              <p style={{ fontFamily: "var(--font-ui)", color: "var(--text-secondary)", marginTop: "var(--space-2)", fontSize: "var(--text-body)" }}>
                by <strong>{product.artistName}</strong>
              </p>
            )}
          </div>

          {/* Price */}
          <div style={{ display: "flex", alignItems: "baseline", gap: "var(--space-3)" }}>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: "var(--text-title)", fontWeight: 700, color: "var(--green)" }}>
              {formatPrice(price)}
            </span>
            {!inStock && <span className="chip chip--neutral">Sold Out</span>}
          </div>

          {/* Meta */}
          {(product.medium || product.dimensions) && (
            <div style={{ background: "var(--surface-raised)", border: "1px solid var(--border-subtle)", borderRadius: "var(--radius-md)", padding: "var(--space-4)", display: "flex", flexDirection: "column", gap: "var(--space-2)" }}>
              {product.medium && (
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "var(--text-small)" }}>
                  <span style={{ color: "var(--text-muted)", fontFamily: "var(--font-ui)" }}>Medium</span>
                  <span style={{ color: "var(--text-primary)" }}>{product.medium}</span>
                </div>
              )}
              {product.dimensions && (
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "var(--text-small)" }}>
                  <span style={{ color: "var(--text-muted)", fontFamily: "var(--font-ui)" }}>Dimensions</span>
                  <span style={{ color: "var(--text-primary)" }}>{product.dimensions}</span>
                </div>
              )}
              {product.inventoryType === "UNIQUE" && (
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "var(--text-small)" }}>
                  <span style={{ color: "var(--text-muted)", fontFamily: "var(--font-ui)" }}>Edition</span>
                  <span style={{ color: "var(--green)", fontWeight: 600 }}>Original — 1 of 1</span>
                </div>
              )}
            </div>
          )}

          {/* Description */}
          {product.description && (
            <p style={{ color: "var(--text-secondary)", fontSize: "var(--text-body)", lineHeight: 1.8 }}>
              {product.description}
            </p>
          )}

          {/* Add to cart */}
          <div style={{ display: "flex", alignItems: "center", gap: "var(--space-3)", paddingTop: "var(--space-2)" }}>
            <AddToCartButton productId={product.id} inStock={inStock} />
            {inStock && (
              <span style={{ fontSize: "var(--text-caption)", color: "var(--text-muted)", fontFamily: "var(--font-ui)" }}>
                {product.stockQuantity > 0 ? `${product.stockQuantity} in stock` : ""}
              </span>
            )}
          </div>

          {/* Assurances */}
          <div style={{ borderTop: "1px solid var(--border-subtle)", paddingTop: "var(--space-4)", display: "flex", flexDirection: "column", gap: "var(--space-2)" }}>
            {["Authenticity certificate included", "Worldwide FedEx shipping", "Secure checkout"].map(item => (
              <p key={item} style={{ fontSize: "var(--text-caption)", color: "var(--text-muted)", display: "flex", alignItems: "center", gap: "var(--space-2)" }}>
                <span style={{ color: "var(--green)" }}>✓</span> {item}
              </p>
            ))}
          </div>
        </div>
      </div>

      {/* Reviews */}
      {product.reviews.length > 0 && (
        <div className="container" style={{ paddingBottom: "var(--space-8)", borderTop: "1px solid var(--border-subtle)", paddingTop: "var(--space-8)" }}>
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: "var(--text-title)", fontWeight: 600, marginBottom: "var(--space-6)" }}>
            Customer Reviews
          </h2>
          <div className="review-grid">
            {product.reviews.map((r) => <ReviewCard key={r.id} review={r} />)}
          </div>
        </div>
      )}

      {/* Related products */}
      {related.length > 0 && (
        <div style={{ background: "var(--surface)", paddingBlock: "var(--space-8)" }}>
          <div className="container">
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "var(--space-6)" }}>
              <h2 style={{ fontFamily: "var(--font-display)", fontSize: "var(--text-title)", fontWeight: 600 }}>You May Also Like</h2>
              <Link href="/art-store" className="btn btn--ghost btn--sm">View All</Link>
            </div>
            <div className="art-grid">
              {related.map((p) => <ProductCard key={p.id} product={p} />)}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
