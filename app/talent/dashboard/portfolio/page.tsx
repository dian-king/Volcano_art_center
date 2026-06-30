"use client"

import { useEffect, useRef, useState } from "react"
import Image from "next/image"
import { ImagePlus, Trash2, Upload, Play, Film } from "lucide-react"
import { useToastStore } from "@/store/toast-store"

const VIDEO_EXTS = [".mp4", ".webm", ".mov"]

function isVideo(url: string) {
  return VIDEO_EXTS.some(ext => url.toLowerCase().endsWith(ext))
}

export default function PortfolioPage() {
  const { addToast } = useToastStore()
  const [items, setItems]     = useState<string[]>([])
  const [loaded, setLoaded]   = useState(false)
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress]   = useState("")
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    let active = true
    fetch("/api/talent/portfolio")
      .then(r => r.json())
      .then(d => { if (active) setItems(d.items ?? []) })
      .catch(() => addToast("Could not load portfolio", "error"))
      .finally(() => { if (active) setLoaded(true) })
    return () => { active = false }
  }, [addToast])

  async function save(next: string[]) {
    await fetch("/api/talent/portfolio", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ items: next }),
    })
  }

  async function handleFiles(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? [])
    if (!files.length) return
    setUploading(true)

    const uploaded: string[] = []
    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      setProgress(`Uploading ${i + 1} of ${files.length}…`)
      const fd = new FormData()
      fd.append("file", file)
      const res  = await fetch("/api/talent/portfolio/upload", { method: "POST", body: fd })
      const json = await res.json()
      if (json.url) uploaded.push(json.url)
      else addToast(`${file.name}: ${json.error ?? "upload failed"}`, "error")
    }

    if (uploaded.length) {
      const next = [...items, ...uploaded]
      setItems(next)
      await save(next)
      addToast(`${uploaded.length} file${uploaded.length > 1 ? "s" : ""} uploaded`, "success")
    }
    setUploading(false)
    setProgress("")
    if (fileRef.current) fileRef.current.value = ""
  }

  async function handleRemove(url: string) {
    const next = items.filter(i => i !== url)
    setItems(next)
    await save(next)
    addToast("Removed", "success")
  }

  const photos = items.filter(u => !isVideo(u))
  const videos = items.filter(isVideo)

  return (
    <div className="talent-dashboard-page">
      <header className="talent-dashboard-hero">
        <div>
          <span className="eyebrow">Portfolio</span>
          <h1>Portfolio</h1>
          <p>Upload photos and videos showcasing your talent. The VAC content team will review and feature approved work on your public profile.</p>
        </div>
        <div className="talent-dashboard-hero__actions">
          <input
            ref={fileRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,video/mp4,video/webm,video/quicktime"
            multiple
            hidden
            onChange={handleFiles}
          />
          <button onClick={() => fileRef.current?.click()} disabled={uploading} className="btn btn--primary">
            <Upload size={17} />
            {uploading ? progress || "Uploading…" : "Add Photos & Videos"}
          </button>
        </div>
      </header>

      {!loaded ? (
        <section className="talent-dashboard-card talent-portfolio-loading" />
      ) : items.length === 0 ? (
        <section className="talent-dashboard-card talent-portfolio-empty" onClick={() => fileRef.current?.click()}>
          <div className="talent-dashboard-icon"><ImagePlus size={26} /></div>
          <h2>Add your first portfolio item</h2>
          <p>Photos: JPEG, PNG, WebP · max 5 MB<br />Videos: MP4, WebM, MOV · max 100 MB</p>
          <button type="button" className="btn btn--ghost btn--sm">
            <Upload size={15} />
            Choose Photos or Videos
          </button>
        </section>
      ) : (
        <>
          {/* Photos */}
          {photos.length > 0 && (
            <section className="talent-portfolio-section">
              <h3 className="talent-portfolio-section__label">
                <ImagePlus size={15} /> Photos ({photos.length})
              </h3>
              <div className="talent-portfolio-grid">
                {photos.map((url, i) => (
                  <article key={url} className="talent-portfolio-item">
                    <Image src={url} alt={`Photo ${i + 1}`} fill unoptimized style={{ objectFit: "cover" }} />
                    <button className="talent-portfolio-item__remove" onClick={() => handleRemove(url)} aria-label="Remove">
                      <Trash2 size={14} />
                    </button>
                  </article>
                ))}
              </div>
            </section>
          )}

          {/* Videos */}
          {videos.length > 0 && (
            <section className="talent-portfolio-section">
              <h3 className="talent-portfolio-section__label">
                <Film size={15} /> Videos ({videos.length})
              </h3>
              <div className="talent-portfolio-grid talent-portfolio-grid--video">
                {videos.map((url, i) => (
                  <article key={url} className="talent-portfolio-item talent-portfolio-item--video">
                    <video
                      src={url}
                      controls
                      playsInline
                      preload="metadata"
                      style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                    />
                    <button className="talent-portfolio-item__remove" onClick={() => handleRemove(url)} aria-label="Remove">
                      <Trash2 size={14} />
                    </button>
                  </article>
                ))}
              </div>
            </section>
          )}
        </>
      )}

      <section className="talent-dashboard-card talent-dashboard-profile-strip">
        <div>
          <p>Portfolio visibility</p>
          <span>Your portfolio is visible to the VAC content team and will be featured on your public profile once approved.</span>
        </div>
      </section>
    </div>
  )
}
