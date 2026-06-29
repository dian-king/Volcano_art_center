import { createTalentProfile } from "@/actions/admin-content"
import { db } from "@/lib/db"
import { F } from "@/components/admin/AdminForm"
import { ImageUploadField } from "@/components/admin/ImageUploadField"

export default async function NewTalentPage() {
  const users = await db.user.findMany({ select: { id: true, email: true, firstName: true, lastName: true } })

  return (
    <div style={{ padding: "var(--space-6)", maxWidth: 800 }}>
      <h1 style={{ fontSize: "var(--text-h2)", fontWeight: 700, marginBottom: "var(--space-6)" }}>New Talent Profile</h1>
      <form action={createTalentProfile} style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
        <div style={F.wrap}>
          <label style={F.label}>User</label>
          <select name="userId" style={F.sel}>
            {users.map((u) => (
              <option key={u.id} value={u.id}>{u.firstName} {u.lastName} — {u.email}</option>
            ))}
          </select>
        </div>
        <div style={F.wrap}>
          <label style={F.label}>Display Name *</label>
          <input name="displayName" required style={F.inp} />
        </div>
        <div style={F.wrap}>
          <label style={F.label}>Bio</label>
          <textarea name="bio" style={F.ta} />
        </div>
        <div style={F.wrap}>
          <label style={F.label}>Talent Area</label>
          <select name="talentArea" style={F.sel}>
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
          <select name="category" style={F.sel}>
            <option value="YOUTH">Youth</option>
            <option value="SINGLE_MOTHER">Single Mother</option>
            <option value="PERSON_WITH_DISABILITY">Person with Disability</option>
            <option value="ELDERLY">Elderly</option>
            <option value="PROFESSIONAL_ARTIST">Professional Artist</option>
            <option value="COMMUNITY_MEMBER">Community Member</option>
          </select>
        </div>
        <ImageUploadField name="imageUrl" folder="talent" label="Profile Image" />
        <div style={{ display: "flex", gap: "var(--space-6)" }}>
          {F.check("published", "Published", false)}
          {F.check("featured", "Featured", false)}
        </div>
        <div style={F.actions}>
          <button type="submit" style={{ padding: "var(--space-2) var(--space-5)", background: "var(--green)", color: "#fff", border: "none", borderRadius: "var(--radius-md)", cursor: "pointer", fontWeight: 600 }}>
            Create Profile
          </button>
        </div>
      </form>
    </div>
  )
}
