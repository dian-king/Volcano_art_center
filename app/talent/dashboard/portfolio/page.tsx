"use client"
import { useState, useRef } from "react"
import Image from "next/image"
import { Trash2, Upload } from "lucide-react"
import { useToastStore } from "@/store/toast-store"

// ponytail: stores portfolio as JSON array in TalentProfile.portfolioItems
// Server action inline for simplicity

export default function PortfolioPage() {
  const { addToast } = useToastStore()
  const [images, setImages] = useState<string[]>([])
  const [uploading, setUploading] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? [])
    if (!files.length) return
    setUploading(true)

    const newUrls: string[] = []
    for (const file of files) {
      if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
        addToast(`${file.name}: only JPEG, PNG, WebP`, "error"); continue
      }
      if (file.size > 5 * 1024 * 1024) {
        addToast(`${file.name}: max 5 MB`, "error"); continue
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
      // Save to profile
      await fetch("/api/talent/portfolio", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: updated }),
      })
      addToast(`${newUrls.length} image${newUrls.length > 1 ? "s" : ""} uploaded`, "success")
    }
    setUploading(false)
    if (fileRef.current) fileRef.current.value = ""
  }

  async function handleRemove(url: string) {
    const updated = images.filter(i => i !== url)
    setImages(updated)
    await fetch("/api/talent/portfolio", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ items: updated }),
    })
    addToast("Image removed", "success")
  }

  return (
    <PortfolioLoader onLoad={setImages}>
      <div style={{ maxWidth: 720 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "var(--space-6)" }}>
          <h1 style={{ fontFamily: "var(--font-display)", fontSize: "var(--text-headline)", fontWeight: 600 }}>Portfolio</h1>
          <div>
            <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" multiple style={{ display: "none" }} onChange={handleFile} />
            <button onClick={() => fileRef.current?.click()} disabled={uploading} className="btn btn--primary btn--sm">
              <Upload size={14} />
              {uploading ? "Uploading…" : "Add Images"}
            </button>
          </div>
        </div>

        {images.length === 0 ? (
          <div style={{ border: "2px dashed var(--border-subtle)", borderRadius: "var(--radius-lg)", padding: "var(--space-10)", textAlign: "center", cursor: "pointer" }} onClick={() => fileRef.current?.click()}>
            <Upload size={32} style={{ color: "var(--text-muted)", margin: "0 auto var(--space-3)" }} />
            <p style={{ fontFamily: "var(--font-ui)", fontWeight: 600, color: "var(--text-primary)", marginBottom: "var(--space-1)" }}>Add your first portfolio image</p>
            <p style={{ fontSize: "var(--text-small)", color: "var(--text-muted)" }}>JPEG · PNG · WebP · max 5 MB each</p>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "var(--space-4)" }}>
            {images.map((url, i) => (
              <div key={url} style={{ position: "relative", aspectRatio: "1", borderRadius: "var(--radius-md)", overflow: "hidden", background: "var(--green-tint)" }}>
                <Image src={url} alt={`Portfolio ${i + 1}`} fill unoptimized style={{ objectFit: "cover" }} />
                <button
                  onClick={() => handleRemove(url)}
                  style={{ position: "absolute", top: "var(--space-2)", right: "var(--space-2)", width: 28, height: 28, borderRadius: "50%", background: "rgba(0,0,0,0.6)", border: "none", color: "#fff", display: "grid", placeItems: "center", cursor: "pointer" }}
                  aria-label="Remove image"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            ))}
          </div>
        )}

        <p style={{ fontSize: "var(--text-caption)", color: "var(--text-muted)", marginTop: "var(--space-5)", fontFamily: "var(--font-ui)" }}>
          Your portfolio is visible to the VAC content team and will be featured on your public profile once approved.
        </p>
      </div>
    </PortfolioLoader>
  )
}

// Loads initial portfolio from server on mount
function PortfolioLoader({ children, onLoad }: { children: React.ReactNode; onLoad: (urls: string[]) => void }) {
  const [loaded, setLoaded] = useState(false)
  if (!loaded) {
    fetch("/api/talent/portfolio").then(r => r.json()).then(d => {
      onLoad(d.items ?? [])
      setLoaded(true)
    })
  }
  return <>{children}</>
}
