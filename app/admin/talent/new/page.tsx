import { createTalentProfile } from "@/actions/admin-content"
import { F } from "@/components/admin/AdminForm"
import { AdminFormShell } from "@/components/admin/AdminPageChrome"
import { AdminFormWizard } from "@/components/admin/AdminFormWizard"
import { ImageUploadField } from "@/components/admin/ImageUploadField"
import { db } from "@/lib/db"
import Link from "next/link"

export default async function NewTalentPage() {
  const users = await db.user.findMany({ select: { id: true, email: true, firstName: true, lastName: true }, orderBy: { email: "asc" } })

  return (
    <AdminFormShell eyebrow="Community" title="New Talent Profile" description="Create a public profile for an approved artist or community talent participant." backHref="/admin/talent">
      <form action={createTalentProfile}>
        <AdminFormWizard
          submitLabel="Create Profile"
          cancel={<Link href="/admin/talent" className="btn btn--ghost">Cancel</Link>}
          steps={[
            { title: "Owner", description: "Connect this public profile to a registered user." },
            { title: "Identity", description: "Write the public name, bio, talent area, and category." },
            { title: "Visibility", description: "Upload a profile image and choose publishing settings." },
          ]}
        >
          <div style={F.wrap}>
            <label style={F.label}>User</label>
            <select name="userId" style={F.sel}>
              {users.map((u) => (
                <option key={u.id} value={u.id}>{`${u.firstName} ${u.lastName}`.trim() || u.email} - {u.email}</option>
              ))}
            </select>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
            <div style={F.wrap}><label style={F.label}>Display Name *</label><input name="displayName" required style={F.inp} /></div>
            <div style={F.wrap}><label style={F.label}>Bio</label><textarea name="bio" style={F.ta} /></div>
            <div style={F.grid2}>
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
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
            <ImageUploadField name="imageUrl" folder="talent" label="Profile Image" />
            <div style={{ display: "flex", gap: "var(--space-6)" }}>{F.check("published", "Published", false)}{F.check("featured", "Featured", false)}</div>
          </div>
        </AdminFormWizard>
      </form>
    </AdminFormShell>
  )
}
