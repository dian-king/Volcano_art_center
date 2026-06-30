import { EmptyState } from "@/components/ui/EmptyState"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { formatPrice } from "@/lib/utils"
import { Heart } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { redirect } from "next/navigation"
import { RemoveSavedButton } from "../RemoveSavedButton"
import { card } from "../_styles"

export const dynamic = "force-dynamic"

export default async function ClientSavedPage() {
  const session = await auth()
  if (!session?.user?.id) redirect("/login?next=/client/dashboard/saved")
  const savedItems = await db.savedItem.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    include: { product: { include: { category: true } } },
  })

  return (
    <section style={card}>
      <h1 style={{ fontFamily: "var(--font-ui)", fontWeight: 700, fontSize: "var(--text-lead)", marginBottom: "var(--space-6)" }}>Saved Items</h1>
      {savedItems.length === 0 ? (
        <EmptyState icon={Heart} title="Nothing saved yet" description="Save artworks you love for later." action={{ label: "Browse Shop", href: "/art-store" }} />
      ) : (
        <div className="talent-grid">
          {savedItems.map(({ product }) => (
            <div key={product.id} className="card card--interactive" style={{ position: "relative" }}>
              <Link href={`/art-store/${product.slug}`} className="media media--4x3" style={{ display: "block" }}>
                {product.primaryImageUrl ? (
                  <Image src={product.primaryImageUrl} alt={product.name} fill unoptimized sizes="33vw" style={{ objectFit: "cover" }} />
                ) : (
                  <div style={{ position: "absolute", inset: 0, background: "var(--green-tint)", display: "grid", placeItems: "center", color: "var(--green-hover)", fontSize: "var(--text-caption)" }}>{product.name}</div>
                )}
              </Link>
              <RemoveSavedButton productId={product.id} />
              <div style={{ padding: "var(--space-3)" }}>
                <p style={{ fontSize: "var(--text-caption)", color: "var(--text-muted)" }}>{product.category?.name}</p>
                <p style={{ fontFamily: "var(--font-ui)", fontWeight: 600, fontSize: "var(--text-small)", color: "var(--text-primary)" }}>{product.name}</p>
                <p style={{ fontFamily: "var(--font-mono)", fontSize: "var(--text-small)", color: "var(--green)", marginTop: "var(--space-1)" }}>{formatPrice(product.price)}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}
