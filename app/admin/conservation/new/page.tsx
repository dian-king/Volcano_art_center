import Link from "next/link"
import { createCampaign } from "@/actions/admin-content"
import { F } from "@/components/admin/AdminForm"
import { ImageUploadField } from "@/components/admin/ImageUploadField"

export default function NewCampaignPage() {
  return (
    <div style={{ maxWidth: 640 }}>
      <h1 style={{ fontFamily: "var(--font-display)", fontSize: "var(--text-headline)", fontWeight: 600, marginBottom: "var(--space-6)" }}>New Campaign</h1>
      <form action={createCampaign} style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
        <div style={F.grid2}>
          <div style={F.wrap}>
            <label style={F.label}>Name *</label>
            <input name="name" required style={F.inp} />
          </div>
          <div style={F.wrap}>
            <label style={F.label}>Goal Amount *</label>
            <input name="goalAmount" type="number" step="0.01" required style={F.inp} />
          </div>
        </div>
        <ImageUploadField name="imageUrl" folder="conservation" label="Campaign Image" />
        <div style={F.wrap}>
          <label style={F.label}>Description</label>
          <textarea name="description" style={F.ta} />
        </div>
        <div style={F.wrap}>
          <label style={F.label}>Impact Statement</label>
          <textarea name="impactStatement" style={F.ta} />
        </div>
        <div style={F.wrap}>
          <label style={F.label}>Status</label>
          <select name="status" defaultValue="ACTIVE" style={F.sel}>
            <option value="ACTIVE">Active</option>
            <option value="COMPLETED">Completed</option>
            <option value="PAUSED">Paused</option>
            <option value="ARCHIVED">Archived</option>
          </select>
        </div>
        {F.check("featured", "Featured on home page", false)}
        <div style={F.actions}>
          <button type="submit" className="btn btn--primary btn--sm">Save</button>
          <Link href="/admin/conservation" style={{ color: "var(--text-secondary)", fontSize: "var(--text-small)" }}>Cancel</Link>
        </div>
      </form>
    </div>
  )
}
