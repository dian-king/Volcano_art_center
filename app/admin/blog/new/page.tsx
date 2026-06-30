import { createPost } from "@/actions/admin-content"
import { F } from "@/components/admin/AdminForm"
import { AdminFormShell } from "@/components/admin/AdminPageChrome"
import { AdminFormWizard } from "@/components/admin/AdminFormWizard"
import { ImageUploadField } from "@/components/admin/ImageUploadField"
import Link from "next/link"

export default function NewPostPage() {
  return (
    <AdminFormShell eyebrow="Editorial" title="New Post" description="Create a story, update, event note, or conservation article for the public blog." backHref="/admin/blog">
      <form action={createPost}>
        <AdminFormWizard
          submitLabel="Create Post"
          cancel={<Link href="/admin/blog" className="btn btn--ghost">Cancel</Link>}
          steps={[
            { title: "Article", description: "Write the title, excerpt, and main content." },
            { title: "Classify", description: "Choose category and tags for discovery." },
            { title: "Publish", description: "Add media, SEO details, and visibility settings." },
          ]}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
            <div style={F.wrap}><label style={F.label}>Title *</label><input name="title" required style={F.inp} /></div>
            <div style={F.wrap}><label style={F.label}>Excerpt</label><textarea name="excerpt" rows={2} style={F.ta} /></div>
            <div style={F.wrap}><label style={F.label}>Content *</label><textarea name="content" rows={14} required style={F.ta} placeholder="<h2>Section Title</h2>&#10;<p>Your paragraph here...</p>" /></div>
          </div>

          <div style={F.grid2}>
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
            <div style={F.wrap}><label style={F.label}>Tags</label><input name="tags" style={F.inp} placeholder="comma-separated" /></div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
            <ImageUploadField name="featuredImageUrl" folder="blog" label="Featured Image" />
            <div style={F.grid2}>
              <div style={F.wrap}><label style={F.label}>SEO Title</label><input name="seoTitle" style={F.inp} /></div>
              <div style={F.wrap}><label style={F.label}>SEO Description</label><input name="seoDesc" style={F.inp} /></div>
            </div>
            <div style={{ display: "flex", gap: "var(--space-6)" }}>{F.check("featured", "Featured", false)}{F.check("published", "Published", false)}</div>
          </div>
        </AdminFormWizard>
      </form>
    </AdminFormShell>
  )
}
