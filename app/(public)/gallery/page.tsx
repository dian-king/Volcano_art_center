import { db } from "@/lib/db"
import { GalleryGrid } from "@/components/public/GalleryGrid"
import type { Metadata } from "next"

export const revalidate = 3600
export const metadata: Metadata = {
  title: "Gallery",
  description: "Photos of life, art, and culture at Volcano Arts Center Inc Rwanda.",
}

export default async function GalleryPage() {
  const images = await db.galleryImage.findMany({
    where: { published: true },
    orderBy: { sortOrder: "asc" },
    select: { id: true, imageUrl: true, caption: true },
  })

  return (
    <div style={{ paddingTop: "var(--nav-height)" }}>
      <div style={{ background: "var(--surface-raised)", padding: "var(--space-10) 0 var(--space-8)" }}>
        <div className="container">
          <span className="eyebrow">Behind the Scenes</span>
          <h1 style={{ fontFamily: "var(--font-display)", fontSize: "var(--text-headline)", fontWeight: 700, marginTop: "var(--space-2)" }}>
            Gallery
          </h1>
          <p style={{ color: "var(--text-secondary)", fontSize: "var(--text-lead)", marginTop: "var(--space-3)", maxWidth: "52ch" }}>
            Moments from our artisans, students, and the community around Volcano Arts Center.
          </p>
        </div>
      </div>

      <div className="container" style={{ paddingBlock: "var(--space-8)" }}>
        {images.length === 0 ? (
          <p style={{ color: "var(--text-muted)", textAlign: "center", padding: "var(--space-10) 0" }}>
            No photos yet — check back soon.
          </p>
        ) : (
          <GalleryGrid images={images} />
        )}
      </div>
    </div>
  )
}
