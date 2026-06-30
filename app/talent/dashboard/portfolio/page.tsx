"use client"

import { useEffect, useRef, useState } from "react"
import Image from "next/image"
import { ImagePlus, Trash2, Upload } from "lucide-react"
import { useToastStore } from "@/store/toast-store"

export default function PortfolioPage() {
  const { addToast } = useToastStore()
  const [images, setImages] = useState<string[]>([])
  const [loaded, setLoaded] = useState(false)
  const [uploading, setUploading] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    let active = true
    fetch("/api/talent/portfolio")
      .then(response => response.json())
      .then(data => {
        if (active) setImages(data.items ?? [])
      })
      .catch(() => addToast("Could not load portfolio", "error"))
      .finally(() => {
        if (active) setLoaded(true)
      })
    return () => {
      active = false
    }
  }, [addToast])

  async function savePortfolio(items: string[]) {
    await fetch("/api/talent/portfolio", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ items }),
    })
  }

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? [])
    if (!files.length) return
    setUploading(true)

    const newUrls: string[] = []
    for (const file of files) {
      if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
        addToast(`${file.name}: only JPEG, PNG, WebP`, "error")
        continue
      }
      if (file.size > 5 * 1024 * 1024) {
        addToast(`${file.name}: max 5 MB`, "error")
        continue
      }
      const fd = new FormData()
      fd.append("file", file)
      fd.append("folder", "portfolio")
      const res = await fetch("/api/upload", { method: "POST", body: fd })
      const json = await res.json()
      if (json.url) newUrls.push(json.url)
      else addToast(json.error ?? "Upload failed", "error")
    }

    if (newUrls.length) {
      const updated = [...images, ...newUrls]
      setImages(updated)
      await savePortfolio(updated)
      addToast(`${newUrls.length} image${newUrls.length > 1 ? "s" : ""} uploaded`, "success")
    }
    setUploading(false)
    if (fileRef.current) fileRef.current.value = ""
  }

  async function handleRemove(url: string) {
    const updated = images.filter(image => image !== url)
    setImages(updated)
    await savePortfolio(updated)
    addToast("Image removed", "success")
  }

  return (
    <div className="talent-dashboard-page">
      <header className="talent-dashboard-hero">
        <div>
          <span className="eyebrow">Portfolio</span>
          <h1>Portfolio</h1>
          <p>Upload selected work for the VAC content team to review and feature on your public profile once approved.</p>
        </div>
        <div className="talent-dashboard-hero__actions">
          <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" multiple hidden onChange={handleFile} />
          <button onClick={() => fileRef.current?.click()} disabled={uploading} className="btn btn--primary">
            <Upload size={17} />
            {uploading ? "Uploading..." : "Add Images"}
          </button>
        </div>
      </header>

      {!loaded ? (
        <section className="talent-dashboard-card talent-portfolio-loading" />
      ) : images.length === 0 ? (
        <section className="talent-dashboard-card talent-portfolio-empty" onClick={() => fileRef.current?.click()}>
          <div className="talent-dashboard-icon"><ImagePlus size={26} /></div>
          <h2>Add your first portfolio image</h2>
          <p>JPEG, PNG, or WebP. Maximum 5 MB per image.</p>
          <button type="button" className="btn btn--ghost btn--sm">
            <Upload size={15} />
            Choose Images
          </button>
        </section>
      ) : (
        <section className="talent-portfolio-grid">
          {images.map((url, index) => (
            <article key={url} className="talent-portfolio-item">
              <Image src={url} alt={`Portfolio ${index + 1}`} fill unoptimized style={{ objectFit: "cover" }} />
              <button onClick={() => handleRemove(url)} aria-label="Remove image">
                <Trash2 size={14} />
              </button>
            </article>
          ))}
        </section>
      )}

      <section className="talent-dashboard-card talent-dashboard-profile-strip">
        <div>
          <p>Portfolio visibility</p>
          <span>Your portfolio is visible to the VAC content team and can be featured after approval.</span>
        </div>
      </section>
    </div>
  )
}
