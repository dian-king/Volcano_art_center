import { createExperience } from "@/actions/admin-content"
import { F } from "@/components/admin/AdminForm"
import { AdminFormShell } from "@/components/admin/AdminPageChrome"
import { AdminFormWizard } from "@/components/admin/AdminFormWizard"
import { ImageUploadField } from "@/components/admin/ImageUploadField"
import Link from "next/link"

export default function NewExperiencePage() {
  return (
    <AdminFormShell eyebrow="Content Studio" title="New Experience" description="Create a public experience with booking settings, pricing, logistics, and media." backHref="/admin/experiences">
      <form action={createExperience}>
        <AdminFormWizard
          submitLabel="Save Experience"
          cancel={<Link href="/admin/experiences" className="btn btn--ghost">Cancel</Link>}
          steps={[
            { title: "Story", description: "Name the experience and write the public description." },
            { title: "Booking", description: "Set type, pricing, duration, location, and group size." },
            { title: "Logistics", description: "Add guest-facing logistics and what is included." },
            { title: "Publish", description: "Upload the primary image and choose visibility." },
          ]}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
            <div style={F.wrap}><label style={F.label}>Title *</label><input name="title" required style={F.inp} /></div>
            <div style={F.wrap}><label style={F.label}>Short Description</label><textarea name="shortDescription" rows={2} style={F.ta} /></div>
            <div style={F.wrap}><label style={F.label}>Full Description</label><textarea name="description" rows={5} style={F.ta} /></div>
          </div>

          <div>
            <div style={F.grid2}>
              <div style={F.wrap}>
                <label style={F.label}>Type</label>
                <select name="experienceType" style={F.sel}>
                  {["CULTURAL","VILLAGE","CONSERVATION","CUSTOM"].map(t => <option key={t}>{t}</option>)}
                </select>
              </div>
              <div style={F.wrap}>
                <label style={F.label}>Booking Type</label>
                <select name="bookingType" style={F.sel}>
                  <option value="DIRECT">Direct Booking</option>
                  <option value="INQUIRY">Inquiry Only</option>
                </select>
              </div>
            </div>
            <div style={{ ...F.grid3, marginTop: "var(--space-4)" }}>
              <div style={F.wrap}><label style={F.label}>Price per Person (USD)</label><input name="pricePerPerson" type="number" min="0" step="0.01" style={F.inp} /></div>
              <div style={F.wrap}><label style={F.label}>Duration (hours)</label><input name="durationHours" type="number" min="0" step="0.5" style={F.inp} /></div>
              <div style={F.wrap}><label style={F.label}>Location</label><input name="location" style={F.inp} /></div>
            </div>
            <div style={{ ...F.grid2, marginTop: "var(--space-4)" }}>
              <div style={F.wrap}><label style={F.label}>Min Group Size</label><input name="minGroupSize" type="number" defaultValue="1" style={F.inp} /></div>
              <div style={F.wrap}><label style={F.label}>Max Group Size</label><input name="maxGroupSize" type="number" defaultValue="10" style={F.inp} /></div>
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
            <div style={F.wrap}><label style={F.label}>Languages</label><input name="languages" style={F.inp} placeholder="English, French, Kinyarwanda" /></div>
            <div style={F.wrap}><label style={F.label}>Meeting Point</label><input name="meetingPoint" style={F.inp} /></div>
            <div style={F.wrap}><label style={F.label}>What's Included</label><textarea name="included" rows={3} style={F.ta} placeholder="Park permit, Expert guide, Lunch, Transport from Kigali" /></div>
            <div style={F.wrap}><label style={F.label}>Not Included</label><textarea name="excluded" rows={2} style={F.ta} placeholder="International flights, Visa fees, Tips" /></div>
            <div style={F.wrap}><label style={F.label}>What to Bring</label><textarea name="whatToBring" rows={2} style={F.ta} placeholder="Sturdy hiking boots, Rain jacket, Water (2L)" /></div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
            <ImageUploadField name="primaryImageUrl" folder="experiences" label="Primary Image" />
            <div style={F.wrap}>
              <label style={F.label}>Status</label>
              <select name="status" style={F.sel}>
                <option value="DRAFT">Draft</option>
                <option value="PUBLISHED">Published</option>
                <option value="ARCHIVED">Archived</option>
              </select>
            </div>
            {F.check("featured", "Featured on home page", false)}
          </div>
        </AdminFormWizard>
      </form>
    </AdminFormShell>
  )
}
