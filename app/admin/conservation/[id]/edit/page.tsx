import Link from "next/link"
import { notFound } from "next/navigation"
import { updateCampaign } from "@/actions/admin-content"
import { F } from "@/components/admin/AdminForm"
import { ImageUploadField } from "@/components/admin/ImageUploadField"
import { db } from "@/lib/db"

export default async function EditCampaignPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const c = await db.conservationCampaign.findUnique({ where: { id } })
  if (!c) notFound()

  const action = updateCampaign.bind(null, id)

  return (
    <div style={{ maxWidth: 640 }}>
      <h1 style={{ fontFamily: "var(--font-display)", fontSize: "var(--text-headline)", fontWeight: 600, marginBottom: "var(--space-6)" }}>Edit: {c.name}</h1>
      <form action={action} style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
        <div style={F.grid2}>
          <div style={F.wrap}>
            <label style={F.label}>Name *</label>
            <input name="name" required defaultValue={c.name} style={F.inp} />
          </div>
          <div style={F.wrap}>
            <label style={F.label}>Goal Amount *</label>
            <input name="goalAmount" type="number" step="0.01" required defaultValue={Number(c.goalAmount)} style={F.inp} />
          </div>
        </div>
        <ImageUploadField name="imageUrl" folder="conservation" label="Campaign Image" defaultUrl={c.imageUrl ?? undefined} />
        <div style={F.wrap}>
          <label style={F.label}>Description</label>
          <textarea name="description" defaultValue={c.description ?? ""} style={F.ta} />
        </div>
        <div style={F.wrap}>
          <label style={F.label}>Impact Statement</label>
          <textarea name="impactStatement" defaultValue={c.impactStatement ?? ""} style={F.ta} />
        </div>
        <div style={F.wrap}>
          <label style={F.label}>Status</label>
          <select name="status" defaultValue={c.status} style={F.sel}>
            <option value="ACTIVE">Active</option>
            <option value="COMPLETED">Completed</option>
            <option value="PAUSED">Paused</option>
            <option value="ARCHIVED">Archived</option>
          </select>
        </div>
        {F.check("featured", "Featured on home page", c.featured)}
        <div style={F.actions}>
          <button type="submit" className="btn btn--primary btn--sm">Save</button>
          <Link href="/admin/conservation" style={{ color: "var(--text-secondary)", fontSize: "var(--text-small)" }}>Cancel</Link>
        </div>
      </form>
    </div>
  )
}
