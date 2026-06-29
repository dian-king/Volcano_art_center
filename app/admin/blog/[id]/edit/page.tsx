import { notFound } from "next/navigation"
import { updatePost } from "@/actions/admin-content"
import { db } from "@/lib/db"
import { F } from "@/components/admin/AdminForm"
import { ImageUploadField } from "@/components/admin/ImageUploadField"

export default async function EditPostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const p = await db.blogPost.findUnique({ where: { id } })
  if (!p) notFound()

  const action = updatePost.bind(null, id)

  return (
    <div style={{ padding: "var(--space-6)", maxWidth: 800 }}>
      <h1 style={{ fontSize: "var(--text-h2)", fontWeight: 700, marginBottom: "var(--space-6)" }}>Edit: {p.title}</h1>
      <form action={action} style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
        <div style={F.wrap}>
          <label style={F.label}>Title *</label>
          <input name="title" required defaultValue={p.title} style={F.inp} />
        </div>
        <div style={F.wrap}>
          <label style={F.label}>Excerpt</label>
          <textarea name="excerpt" rows={2} defaultValue={p.excerpt ?? ""} style={F.ta} />
        </div>
        <div style={F.wrap}>
          <label style={F.label}>Content *</label>
          <textarea name="content" rows={10} required defaultValue={p.content} style={F.ta} />
        </div>
        <div style={F.wrap}>
          <label style={F.label}>Category</label>
          <select name="category" defaultValue={p.category} style={F.sel}>
            <option value="UPDATE">Update</option>
            <option value="EVENT">Event</option>
            <option value="STORY">Story</option>
            <option value="CULTURE">Culture</option>
            <option value="CONSERVATION">Conservation</option>
            <option value="TESTIMONIAL">Testimonial</option>
          </select>
        </div>
        <div style={F.wrap}>
          <label style={F.label}>Tags</label>
          <input name="tags" defaultValue={p.tags.join(", ")} style={F.inp} placeholder="comma-separated" />
        </div>
        <ImageUploadField name="featuredImageUrl" folder="blog" label="Featured Image" defaultUrl={p.featuredImageUrl ?? undefined} />
        <div style={F.grid2}>
          <div style={F.wrap}>
            <label style={F.label}>SEO Title</label>
            <input name="seoTitle" defaultValue={p.seoTitle ?? ""} style={F.inp} />
          </div>
          <div style={F.wrap}>
            <label style={F.label}>SEO Description</label>
            <input name="seoDesc" defaultValue={p.seoDesc ?? ""} style={F.inp} />
          </div>
        </div>
        <div style={{ display: "flex", gap: "var(--space-6)" }}>
          {F.check("featured", "Featured", p.featured)}
          {F.check("published", "Published", p.published)}
        </div>
        <div style={F.actions}>
          <button type="submit" className="btn btn--primary">Save Changes</button>
        </div>
      </form>
    </div>
  )
}
