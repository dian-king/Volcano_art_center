import { readdir } from "fs/promises"
import { join } from "path"
import Image from "next/image"
import type { Metadata } from "next"

export const dynamic = "force-dynamic"
export const metadata: Metadata = { title: "Media Library | Admin" }

async function getMediaFiles() {
  const base = join(process.cwd(), "public", "uploads")
  const folders = ["products", "experiences", "blog", "conservation", "talent", "avatars", "portfolio", "misc"]
  const files: { url: string; folder: string; name: string }[] = []
  for (const folder of folders) {
    try {
      const names = await readdir(join(base, folder))
      for (const name of names) {
        if (/\.(jpg|jpeg|png|webp)$/i.test(name)) {
          files.push({ url: `/uploads/${folder}/${name}`, folder, name })
        }
      }
    } catch {}
  }
  // Also check /images/ folder
  try {
    const names = await readdir(join(process.cwd(), "public", "images"))
    for (const name of names) {
      if (/\.(jpg|jpeg|png|webp)$/i.test(name)) {
        files.push({ url: `/images/${name}`, folder: "images", name })
      }
    }
  } catch {}
  return files
}

export default async function MediaLibraryPage() {
  const files = await getMediaFiles()
  const grouped: Record<string, typeof files> = {}
  files.forEach(f => { if (!grouped[f.folder]) grouped[f.folder] = []; grouped[f.folder].push(f) })

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "var(--space-6)" }}>
        <h1 style={{ fontFamily: "var(--font-display)", fontSize: "var(--text-headline)", fontWeight: 600 }}>Media Library</h1>
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
                  <Image src={f.url} alt={f.name} fill style={{ objectFit: "cover" }} sizes="140px" />
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
