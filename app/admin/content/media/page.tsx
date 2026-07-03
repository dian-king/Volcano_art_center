import { readdir } from "fs/promises"
import { join } from "path"
import Image from "next/image"
import type { Metadata } from "next"
import { cloudinary } from "@/lib/cloudinary"

export const dynamic = "force-dynamic"
export const metadata: Metadata = { title: "Media Library | Admin" }

interface MediaFile { url: string; thumbUrl: string; folder: string; name: string }

async function getCloudinaryFiles(): Promise<MediaFile[]> {
  const files: MediaFile[] = []
  for (const resourceType of ["image", "video"] as const) {
    try {
      const { resources } = await cloudinary.api.resources({
        type: "upload",
        resource_type: resourceType,
        prefix: "volcano-arts/",
        max_results: 500,
      })
      for (const r of resources) {
        // public_id looks like "volcano-arts/<folder>/<name>"
        const parts = r.public_id.split("/")
        const folder = parts[1] ?? "misc"
        const name = parts.slice(2).join("/") || parts[parts.length - 1]
        const thumbUrl = resourceType === "video"
          ? cloudinary.url(r.public_id, { resource_type: "video", format: "jpg" })
          : r.secure_url
        files.push({ url: r.secure_url, thumbUrl, folder, name: `${name}.${r.format}` })
      }
    } catch {
      // Cloudinary not configured yet, or no assets of this type
    }
  }
  return files
}

async function getStaticImages(): Promise<MediaFile[]> {
  const files: MediaFile[] = []
  try {
    const names = await readdir(join(process.cwd(), "public", "images"))
    for (const name of names) {
      if (/\.(jpg|jpeg|png|webp)$/i.test(name)) {
        files.push({ url: `/images/${name}`, thumbUrl: `/images/${name}`, folder: "images", name })
      }
    }
  } catch {}
  return files
}

export default async function MediaLibraryPage() {
  const [cloudinaryFiles, staticImages] = await Promise.all([getCloudinaryFiles(), getStaticImages()])
  const files = [...cloudinaryFiles, ...staticImages]
  const grouped: Record<string, typeof files> = {}
  files.forEach(f => { if (!grouped[f.folder]) grouped[f.folder] = []; grouped[f.folder].push(f) })

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "var(--space-6)" }}>
        <div>
          <h1 style={{ fontFamily: "var(--font-display)", fontSize: "var(--text-headline)", fontWeight: 600 }}>Media Library</h1>
          <p style={{ fontSize: "var(--text-caption)", color: "var(--text-muted)", marginTop: "var(--space-1)" }}>
            Uploaded content lives in Cloudinary — for full management (delete, reorganize, search) use the{" "}
            <a href="https://console.cloudinary.com/console/media_library" target="_blank" rel="noopener noreferrer" style={{ color: "var(--green)" }}>Cloudinary dashboard</a>.
          </p>
        </div>
        <p style={{ fontFamily: "var(--font-mono)", fontSize: "var(--text-caption)", color: "var(--text-muted)" }}>{files.length} files</p>
      </div>

      {files.length === 0 ? (
        <div style={{ textAlign: "center", padding: "var(--space-10)", color: "var(--text-muted)" }}>
          <p style={{ fontFamily: "var(--font-ui)" }}>No media files uploaded yet.</p>
          <p style={{ fontSize: "var(--text-small)", marginTop: "var(--space-2)" }}>Upload images via product, blog, experience, or conservation forms.</p>
        </div>
      ) : Object.entries(grouped).map(([folder, items]) => (
        <section key={folder} style={{ marginBottom: "var(--space-7)" }}>
          <h2 style={{ fontFamily: "var(--font-ui)", fontWeight: 700, fontSize: "var(--text-caption)", letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--text-muted)", marginBottom: "var(--space-4)" }}>
            {folder} ({items.length})
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: "var(--space-3)" }}>
            {items.map(f => (
              <div key={f.url} style={{ background: "var(--surface-raised)", border: "1px solid var(--border-subtle)", borderRadius: "var(--radius-md)", overflow: "hidden" }}>
                <div style={{ position: "relative", aspectRatio: "1", background: "var(--green-tint)" }}>
                  <Image src={f.thumbUrl} alt={f.name} fill style={{ objectFit: "cover" }} sizes="140px" />
                </div>
                <div style={{ padding: "var(--space-2)" }}>
                  <p style={{ fontSize: "10px", color: "var(--text-muted)", fontFamily: "var(--font-mono)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", marginBottom: "var(--space-1)" }}>{f.name}</p>
                  <div style={{ display: "flex", gap: "var(--space-2)" }}>
                    <a
                      href={f.url}
                      download={f.name}
                      style={{ fontSize: "10px", color: "var(--text-secondary)", fontFamily: "var(--font-ui)", textDecoration: "none", padding: "2px 6px", border: "1px solid var(--border-subtle)", borderRadius: "var(--radius-sm)", display: "inline-flex", alignItems: "center", gap: 3 }}
                      title="Download image"
                    >
                      ↓ Download
                    </a>
                  <button
                    onClick={undefined}
                    style={{ fontSize: "10px", color: "var(--green)", fontFamily: "var(--font-ui)", background: "none", cursor: "pointer", padding: "2px 6px", border: "1px solid var(--green)", borderRadius: "var(--radius-sm)" } as React.CSSProperties}
                    title="Click to copy URL"
                    data-url={f.url}
                  >
                    Copy URL
                  </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  )
}
