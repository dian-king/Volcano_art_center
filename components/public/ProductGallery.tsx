"use client"
import { useState } from "react"
import Image from "next/image"

interface ProductGalleryProps {
  primaryImageUrl: string | null
  images: { id: string; url: string; altText: string | null }[]
  productName: string
}

export function ProductGallery({ primaryImageUrl, images, productName }: ProductGalleryProps) {
  const allImages = [
    ...(primaryImageUrl ? [{ id: "primary", url: primaryImageUrl, altText: productName }] : []),
    ...images,
  ]
  const [active, setActive] = useState(allImages[0]?.url ?? null)

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
      {/* Main image */}
      <div style={{ position: "relative", aspectRatio: "4/3", borderRadius: "var(--radius-lg)", overflow: "hidden", background: "var(--green-tint)" }}>
        {active ? (
          <Image src={active} alt={productName} fill style={{ objectFit: "cover" }} sizes="50vw" />
        ) : (
          <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--font-display)", color: "var(--green-hover)", fontStyle: "italic" }}>
            {productName}
          </div>
        )}
      </div>
      {/* Thumbnails */}
      {allImages.length > 1 && (
        <div style={{ display: "grid", gridTemplateColumns: `repeat(${Math.min(allImages.length, 4)}, 1fr)`, gap: "var(--space-2)" }}>
          {allImages.map(img => (
            <button key={img.id} onClick={() => setActive(img.url)} style={{ padding: 0, border: active === img.url ? "2px solid var(--green)" : "2px solid transparent", borderRadius: "var(--radius-md)", overflow: "hidden", cursor: "pointer", aspectRatio: "1", background: "var(--green-tint)", position: "relative" }}>
              <Image src={img.url} alt={img.altText ?? productName} fill style={{ objectFit: "cover" }} sizes="12vw" />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
