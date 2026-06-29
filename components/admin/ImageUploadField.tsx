"use client"
import { useState, useRef } from "react"
import Image from "next/image"
import { Upload, X } from "lucide-react"

interface Props {
  name: string          // hidden input name (used by the parent form action)
  defaultUrl?: string   // existing image URL when editing
  folder?: string       // upload sub-folder: products | experiences | blog | conservation | talent | avatars
  label?: string
}

export function ImageUploadField({ name, defaultUrl, folder = "misc", label = "Image" }: Props) {
  const [preview, setPreview] = useState<string | null>(defaultUrl || null)
  const [url, setUrl] = useState<string>(defaultUrl || "")
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setError(null)

    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setError("Only JPEG, PNG or WebP allowed"); return
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("Max 5 MB"); return
    }

    setPreview(URL.createObjectURL(file))
    setUploading(true)

    const fd = new FormData()
    fd.append("file", file)
    fd.append("folder", folder)

    const res = await fetch("/api/upload", { method: "POST", body: fd })
    const json = await res.json()
    setUploading(false)

    if (json.error) { setError(json.error); setPreview(defaultUrl || null); return }
    setUrl(json.url)
  }

  function clear() {
    setPreview(null)
    setUrl("")
    if (fileRef.current) fileRef.current.value = ""
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-2)" }}>
      <span style={{ fontSize: "var(--text-caption)", fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--text-muted)", fontFamily: "var(--font-ui)" }}>
        {label}
      </span>

      {/* Hidden input carries the URL into the server action */}
      <input type="hidden" name={name} value={url} />
      <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" style={{ display: "none" }} onChange={handleFile} />

      {preview ? (
        <div style={{ position: "relative", width: "100%", maxWidth: 340 }}>
          <div style={{ position: "relative", width: "100%", aspectRatio: "16/9", borderRadius: "var(--radius-md)", overflow: "hidden", border: "1px solid var(--border-subtle)", background: "var(--surface-base)" }}>
            <Image src={preview} alt="Preview" fill unoptimized style={{ objectFit: "cover" }} />
            {uploading && (
              <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.5)", display: "grid", placeItems: "center", color: "#fff", fontFamily: "var(--font-ui)", fontSize: "var(--text-small)" }}>
                Uploading…
              </div>
            )}
          </div>
          <div style={{ display: "flex", gap: "var(--space-2)", marginTop: "var(--space-2)" }}>
            <button type="button" onClick={() => fileRef.current?.click()} disabled={uploading}
              style={{ height: 32, padding: "0 var(--space-3)", border: "1px solid var(--border-subtle)", borderRadius: "var(--radius-md)", background: "var(--surface-base)", color: "var(--text-secondary)", fontSize: "var(--text-caption)", fontFamily: "var(--font-ui)", cursor: "pointer" }}>
              Change
            </button>
            <button type="button" onClick={clear}
              style={{ height: 32, width: 32, border: "1px solid var(--border-subtle)", borderRadius: "var(--radius-md)", background: "var(--surface-base)", color: "var(--text-muted)", display: "grid", placeItems: "center", cursor: "pointer" }}>
              <X size={13} />
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          style={{
            width: "100%", maxWidth: 340, aspectRatio: "16/9",
            border: "2px dashed var(--border-subtle)", borderRadius: "var(--radius-md)",
            background: "var(--surface-base)", cursor: "pointer",
            display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
            gap: "var(--space-2)", color: "var(--text-muted)",
          }}
        >
          <Upload size={22} />
          <span style={{ fontSize: "var(--text-small)", fontFamily: "var(--font-ui)" }}>Choose from device</span>
          <span style={{ fontSize: "var(--text-caption)" }}>JPEG · PNG · WebP · max 5 MB</span>
        </button>
      )}

      {error && <p style={{ fontSize: "var(--text-caption)", color: "var(--color-error)", fontFamily: "var(--font-ui)" }}>{error}</p>}
    </div>
  )
}
