import { notFound } from "next/navigation"
import { updateTalentProfile } from "@/actions/admin-content"
import { db } from "@/lib/db"
import { F } from "@/components/admin/AdminForm"
import { ImageUploadField } from "@/components/admin/ImageUploadField"

export default async function EditTalentPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const p = await db.talentProfile.findUnique({ where: { id } })
  if (!p) notFound()

  const action = updateTalentProfile.bind(null, id)

  return (
    <div style={{ padding: "var(--space-6)", maxWidth: 800 }}>
      <h1 style={{ fontSize: "var(--text-h2)", fontWeight: 700, marginBottom: "var(--space-6)" }}>Edit: {p.displayName}</h1>
      <form action={action} style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
        <div style={F.wrap}>
          <label style={F.label}>Display Name *</label>
          <input name="displayName" required defaultValue={p.displayName} style={F.inp} />
        </div>
        <div style={F.wrap}>
          <label style={F.label}>Bio</label>
          <textarea name="bio" defaultValue={p.bio ?? ""} style={F.ta} />
        </div>
        <div style={F.wrap}>
          <label style={F.label}>Talent Area</label>
          <select name="talentArea" defaultValue={p.talentArea} style={F.sel}>
            <option value="TRADITIONAL_DANCE">Traditional Dance</option>
            <option value="STORYTELLING">Storytelling</option>
            <option value="CULTURAL_PERFORMANCE">Cultural Performance</option>
            <option value="MUSIC">Music</option>
            <option value="VISUAL_ARTS">Visual Arts</option>
            <option value="CRAFTS">Crafts</option>
            <option value="OTHER">Other</option>
          </select>
        </div>
        <div style={F.wrap}>
          <label style={F.label}>Category</label>
          <select name="category" defaultValue={p.category} style={F.sel}>
            <option value="YOUTH">Youth</option>
            <option value="SINGLE_MOTHER">Single Mother</option>
            <option value="PERSON_WITH_DISABILITY">Person with Disability</option>
            <option value="ELDERLY">Elderly</option>
            <option value="PROFESSIONAL_ARTIST">Professional Artist</option>
            <option value="COMMUNITY_MEMBER">Community Member</option>
          </select>
        </div>
        <ImageUploadField name="imageUrl" folder="talent" label="Profile Image" defaultUrl={p.imageUrl ?? undefined} />
        <div style={{ display: "flex", gap: "var(--space-6)" }}>
          {F.check("published", "Published", p.published)}
          {F.check("featured", "Featured", p.featured)}
        </div>
        <div style={F.actions}>
          <button type="submit" style={{ padding: "var(--space-2) var(--space-5)", background: "var(--green)", color: "#fff", border: "none", borderRadius: "var(--radius-md)", cursor: "pointer", fontWeight: 600 }}>
            Save Changes
          </button>
        </div>
      </form>
    </div>
  )
}
