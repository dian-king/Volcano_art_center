"use client"
import Image from "next/image"
import Link from "next/link"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { formatPrice } from "@/lib/utils"
import { AddToCartButton } from "./AddToCartButton"
import { toggleSavedItem } from "@/actions/wishlist"
import { motion } from "framer-motion"

interface ProductCardProps {
  product: {
    id: string
    name: string
    slug: string
    artistName: string | null
    price: string | number | { toNumber: () => number }
    compareAtPrice?: string | number | { toNumber: () => number } | null
    primaryImageUrl: string | null
    inventoryType: string
    stockQuantity: number
    featured: boolean
    category: { name: string } | null
  }
}

export function ProductCard({ product }: ProductCardProps) {
  const inStock = product.stockQuantity > 0 || product.inventoryType === "UNIQUE"
  const { data: session } = useSession()
  const router = useRouter()
  const [saved, setSaved] = useState(false)

  async function handleSave(e: React.MouseEvent) {
    e.preventDefault()
    if (!session?.user) {
      router.push(`/login?next=${encodeURIComponent(window.location.pathname)}`)
      return
    }
    setSaved(s => !s)
    const result = await toggleSavedItem(product.id)
    if ("saved" in result) setSaved(result.saved)
  }

  return (
    <motion.article className="product-card card card--interactive" whileHover={{ y: -3 }} whileTap={{ y: 0 }} transition={{ duration: 0.12 }}>
      {/* Image / media area */}
      <Link href={`/art-store/${product.slug}`} className="product-card__media media media--4x3" style={{ display: "block" }}>
        {product.primaryImageUrl ? (
          <Image
            src={product.primaryImageUrl}
            alt={product.name}
            fill
            unoptimized
            sizes="(max-width: 768px) 50vw, 25vw"
            style={{ objectFit: "cover" }}
          />
        ) : (
          <div style={{
            position: "absolute", inset: 0,
            background: "var(--green-tint)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontFamily: "var(--font-ui)", fontSize: "var(--text-caption)",
            letterSpacing: "0.08em", textTransform: "uppercase",
            color: "var(--green-hover)",
          }}>
            {product.name}
          </div>
        )}
        {product.inventoryType === "UNIQUE" && (
          <span className="chip chip--accent" style={{ position: "absolute", bottom: "var(--space-3)", left: "var(--space-3)", zIndex: 2 }}>
            1 of 1
          </span>
        )}
        <button
          onClick={handleSave}
          aria-label={saved ? "Remove from wishlist" : "Save to wishlist"}
          title={session?.user ? (saved ? "Remove from wishlist" : "Save to wishlist") : "Sign in to save"}
          style={{ position: "absolute", top: "var(--space-3)", right: "var(--space-3)", zIndex: 2, width: 32, height: 32, borderRadius: "50%", background: "rgba(0,0,0,0.45)", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1rem", lineHeight: 1 }}
        >
          {saved ? "❤️" : "🤍"}
        </button>
        {product.featured && !product.primaryImageUrl && (
          <span className="chip chip--success" style={{ position: "absolute", bottom: "var(--space-3)", right: "var(--space-3)", zIndex: 2 }}>
            Featured
          </span>
        )}
      </Link>

      {/* Card body */}
      <div className="product-card__body">
        {product.category && <p className="product-card__cat">{product.category.name}</p>}
        <h3 className="product-card__title">
          <Link href={`/art-store/${product.slug}`}>{product.name}</Link>
        </h3>
        {product.artistName && <p className="product-card__artist">by {product.artistName}</p>}
        <div className="product-card__foot">
          <strong className="product-card__price">{formatPrice(product.price)}</strong>
          <AddToCartButton productId={product.id} inStock={inStock} />
        </div>
      </div>
    </motion.article>
  )
}