import { db } from "@/lib/db"
import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { hasRole, CONTENT_ROLES } from "@/lib/permissions"
import { AdminPageHeader } from "@/components/admin/AdminPageChrome"
import { ImageUploadField } from "@/components/admin/ImageUploadField"
import { DeleteButton } from "@/components/admin/DeleteButton"
import { createGalleryImage, updateGalleryImage, deleteGalleryImage } from "@/actions/gallery"

export const dynamic = "force-dynamic"

export default async function AdminGalleryPage() {
  const session = await auth()
  if (!hasRole(session?.user?.role as string | undefined, CONTENT_ROLES)) redirect("/admin")

  const images = await db.galleryImage.findMany({ orderBy: { sortOrder: "asc" } })

  async function update(fd: FormData) {
    "use server"
    await updateGalleryImage(fd.get("id") as string, fd)
  }

  return (
    <div>
      <AdminPageHeader
        eyebrow="Content"
        title="Gallery"
        description="Photos of Volcano Arts Center shown on the public Gallery page, each with a short caption."
      />

      {/* Add image */}
      <section className="card" style={{ padding: "var(--space-5)", marginBottom: "var(--space-7)" }}>
        <h2 style={{ fontFamily: "var(--font-ui)", fontWeight: 700, fontSize: "var(--text-body)", marginBottom: "var(--space-4)" }}>Add Photo</h2>
        <form action={createGalleryImage} style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
          <ImageUploadField name="imageUrl" folder="gallery" label="Photo" />
          <div className="field">
            <label className="field__label" htmlFor="caption">Caption</label>
            <input id="caption" name="caption" type="text" className="input" placeholder="e.g. Wood carving workshop, June 2026" maxLength={160} />
          </div>
          <button type="submit" className="btn btn--primary btn--sm" style={{ alignSelf: "flex-start" }}>Add to Gallery</button>
        </form>
      </section>

      <div className="admin-results-bar"><span>{images.length} photo{images.length === 1 ? "" : "s"}</span><span>Oldest first</span></div>

      {images.length === 0 ? (
        <p style={{ color: "var(--text-muted)" }}>No gallery photos yet — add your first one above.</p>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: "var(--space-4)" }}>
          {images.map((img) => (
            <div key={img.id} className="card" style={{ display: "flex", flexDirection: "column", overflow: "hidden" }}>
              <div style={{ position: "relative", aspectRatio: "4/3", background: "var(--green-tint)" }}>
                <img src={img.imageUrl} alt={img.caption ?? ""} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                {!img.published && (
                  <span className="chip chip--neutral" style={{ position: "absolute", top: "var(--space-2)", left: "var(--space-2)" }}>Hidden</span>
                )}
              </div>
              <form action={update} style={{ padding: "var(--space-4)", display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
                <input type="hidden" name="id" value={img.id} />
                <div className="field">
                  <label className="field__label" htmlFor={`caption-${img.id}`}>Caption</label>
                  <input id={`caption-${img.id}`} name="caption" type="text" className="input" defaultValue={img.caption ?? ""} maxLength={160} />
                </div>
                <label style={{ display: "flex", alignItems: "center", gap: "var(--space-2)", fontSize: "var(--text-small)", color: "var(--text-secondary)" }}>
                  <input type="checkbox" name="published" defaultChecked={img.published} />
                  Visible on public Gallery page
                </label>
                <div style={{ display: "flex", gap: "var(--space-2)" }}>
                  <button type="submit" className="btn btn--ghost btn--sm">Save</button>
                  <DeleteButton action={deleteGalleryImage} id={img.id} itemName={img.caption ?? "this photo"} />
                </div>
              </form>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
