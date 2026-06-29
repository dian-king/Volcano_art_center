import { createPost } from "@/actions/admin-content"
import { F } from "@/components/admin/AdminForm"
import { ImageUploadField } from "@/components/admin/ImageUploadField"

export default function NewPostPage() {
  return (
    <div style={{ padding: "var(--space-6)", maxWidth: 800 }}>
      <h1 style={{ fontSize: "var(--text-h2)", fontWeight: 700, marginBottom: "var(--space-6)" }}>New Post</h1>
      <form action={createPost} style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
        <div style={F.wrap}>
          <label style={F.label}>Title *</label>
          <input name="title" required style={F.inp} />
        </div>
        <div style={F.wrap}>
          <label style={F.label}>Excerpt</label>
          <textarea name="excerpt" rows={2} style={F.ta} />
        </div>
        <div style={F.wrap}>
          <label style={F.label}>Content * <span style={{ fontWeight: 400, textTransform: "none", letterSpacing: 0, color: "var(--text-muted)" }}>— supports HTML: &lt;h2&gt;, &lt;p&gt;, &lt;ul&gt;&lt;li&gt;, &lt;strong&gt;, &lt;blockquote&gt;</span></label>
          <textarea name="content" rows={14} required style={F.ta} placeholder="<h2>Section Title</h2>&#10;<p>Your paragraph here...</p>&#10;<ul><li>Item one</li><li>Item two</li></ul>" />
        </div>
        <div style={F.wrap}>
          <label style={F.label}>Category</label>
          <select name="category" defaultValue="STORY" style={F.sel}>
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
          <input name="tags" style={F.inp} placeholder="comma-separated" />
        </div>
        <ImageUploadField name="featuredImageUrl" folder="blog" label="Featured Image" />
        <div style={F.grid2}>
          <div style={F.wrap}>
            <label style={F.label}>SEO Title</label>
            <input name="seoTitle" style={F.inp} />
          </div>
          <div style={F.wrap}>
            <label style={F.label}>SEO Description</label>
            <input name="seoDesc" style={F.inp} />
          </div>
        </div>
        <div style={{ display: "flex", gap: "var(--space-6)" }}>
          {F.check("featured", "Featured", false)}
          {F.check("published", "Published", false)}
        </div>
        <div style={F.actions}>
          <button type="submit" className="btn btn--primary">Create Post</button>
        </div>
      </form>
    </div>
  )
}
