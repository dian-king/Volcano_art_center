import { createCampaign } from "@/actions/admin-content"
import { F } from "@/components/admin/AdminForm"
import { AdminFormShell } from "@/components/admin/AdminPageChrome"
import { AdminFormWizard } from "@/components/admin/AdminFormWizard"
import { ImageUploadField } from "@/components/admin/ImageUploadField"
import Link from "next/link"

export default function NewCampaignPage() {
  return (
    <AdminFormShell eyebrow="Conservation" title="New Campaign" description="Set up a fundraising campaign with goals, impact language, image, and status." backHref="/admin/conservation">
      <form action={createCampaign}>
        <AdminFormWizard
          submitLabel="Save Campaign"
          cancel={<Link href="/admin/conservation" className="btn btn--ghost">Cancel</Link>}
          steps={[
            { title: "Details", description: "Name the campaign and set the fundraising goal." },
            { title: "Content", description: "Add image, description, and impact statement." },
            { title: "Publish", description: "Set campaign status and featured placement." },
          ]}
        >
          <div style={F.grid2}>
            <div style={F.wrap}><label style={F.label}>Name *</label><input name="name" required style={F.inp} /></div>
            <div style={F.wrap}><label style={F.label}>Goal Amount *</label><input name="goalAmount" type="number" step="0.01" required style={F.inp} /></div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
            <ImageUploadField name="imageUrl" folder="conservation" label="Campaign Image" />
            <div style={F.wrap}><label style={F.label}>Description</label><textarea name="description" style={F.ta} /></div>
            <div style={F.wrap}><label style={F.label}>Impact Statement</label><textarea name="impactStatement" style={F.ta} /></div>
          </div>

          <div>
            <div style={F.wrap}>
              <label style={F.label}>Status</label>
              <select name="status" defaultValue="ACTIVE" style={F.sel}>
                <option value="ACTIVE">Active</option>
                <option value="COMPLETED">Completed</option>
                <option value="PAUSED">Paused</option>
                <option value="ARCHIVED">Archived</option>
              </select>
            </div>
            <div style={{ marginTop: "var(--space-4)" }}>{F.check("featured", "Featured on home page", false)}</div>
          </div>
        </AdminFormWizard>
      </form>
    </AdminFormShell>
  )
}
