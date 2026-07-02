"use client"
import { useState } from "react"
import { X, ChevronLeft, ChevronRight } from "lucide-react"

type GalleryImage = { id: string; imageUrl: string; caption: string | null }

export function GalleryGrid({ images }: { images: GalleryImage[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  function close() { setOpenIndex(null) }
  function prev() { setOpenIndex((i) => (i === null ? null : (i - 1 + images.length) % images.length)) }
  function next() { setOpenIndex((i) => (i === null ? null : (i + 1) % images.length)) }

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Escape") close()
    if (e.key === "ArrowLeft") prev()
    if (e.key === "ArrowRight") next()
  }

  const active = openIndex !== null ? images[openIndex] : null

  return (
    <>
      <div className="gallery-grid">
        {images.map((img, i) => (
          <button key={img.id} type="button" className="gallery-grid__item" onClick={() => setOpenIndex(i)}>
            <img src={img.imageUrl} alt={img.caption ?? ""} loading="lazy" />
            {img.caption && <span className="gallery-grid__caption">{img.caption}</span>}
          </button>
        ))}
      </div>

      {active && (
        <div className="gallery-lightbox" role="dialog" aria-modal="true" tabIndex={-1} onKeyDown={onKeyDown} ref={(el) => el?.focus()}>
          <button type="button" className="gallery-lightbox__scrim" aria-label="Close" onClick={close} />
          <button type="button" className="gallery-lightbox__close" aria-label="Close" onClick={close}><X size={22} /></button>
          {images.length > 1 && (
            <>
              <button type="button" className="gallery-lightbox__nav gallery-lightbox__nav--prev" aria-label="Previous photo" onClick={prev}><ChevronLeft size={26} /></button>
              <button type="button" className="gallery-lightbox__nav gallery-lightbox__nav--next" aria-label="Next photo" onClick={next}><ChevronRight size={26} /></button>
            </>
          )}
          <figure className="gallery-lightbox__figure">
            <img src={active.imageUrl} alt={active.caption ?? ""} />
            {active.caption && <figcaption>{active.caption}</figcaption>}
          </figure>
        </div>
      )}
    </>
  )
}
