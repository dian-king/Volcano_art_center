import { createExperience } from "@/actions/admin-content"
import { F } from "@/components/admin/AdminForm"
import { ImageUploadField } from "@/components/admin/ImageUploadField"
import Link from "next/link"

export default function NewExperiencePage() {
  return (
    <div style={{ maxWidth: 760 }}>
      <h1 style={{ fontFamily: "var(--font-display)", fontSize: "var(--text-headline)", fontWeight: 600, marginBottom: "var(--space-7)" }}>New Experience</h1>
      <form action={createExperience} style={{ display: "flex", flexDirection: "column", gap: "var(--space-5)" }}>
        <div style={F.wrap}><label style={F.label}>Title *</label><input name="title" required style={F.inp} /></div>
        <div style={F.wrap}><label style={F.label}>Short Description</label><textarea name="shortDescription" rows={2} style={F.ta} /></div>
        <div style={F.wrap}><label style={F.label}>Full Description</label><textarea name="description" rows={5} style={F.ta} /></div>

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

        <div style={F.grid3}>
          <div style={F.wrap}><label style={F.label}>Price per Person (USD)</label><input name="pricePerPerson" type="number" min="0" step="0.01" style={F.inp} /></div>
          <div style={F.wrap}><label style={F.label}>Duration (hours)</label><input name="durationHours" type="number" min="0" step="0.5" style={F.inp} /></div>
          <div style={F.wrap}><label style={F.label}>Location</label><input name="location" style={F.inp} /></div>
        </div>

        <div style={F.grid2}>
          <div style={F.wrap}><label style={F.label}>Min Group Size</label><input name="minGroupSize" type="number" defaultValue="1" style={F.inp} /></div>
          <div style={F.wrap}><label style={F.label}>Max Group Size</label><input name="maxGroupSize" type="number" defaultValue="10" style={F.inp} /></div>
        </div>

        <div style={F.wrap}>
          <label style={F.label}>Languages <span style={{ color: "var(--text-muted)", fontWeight: 400, textTransform: "none", letterSpacing: 0 }}>(comma-separated)</span></label>
          <input name="languages" style={F.inp} placeholder="English, French, Kinyarwanda" />
        </div>
        <div style={F.wrap}><label style={F.label}>Meeting Point</label><input name="meetingPoint" style={F.inp} /></div>

        <div style={F.wrap}>
          <label style={F.label}>What&apos;s Included <span style={{ color: "var(--text-muted)", fontWeight: 400, textTransform: "none", letterSpacing: 0 }}>(comma-separated)</span></label>
          <textarea name="included" rows={3} style={F.ta} placeholder="Park permit, Expert guide, Lunch, Transport from Kigali" />
        </div>
        <div style={F.wrap}>
          <label style={F.label}>Not Included <span style={{ color: "var(--text-muted)", fontWeight: 400, textTransform: "none", letterSpacing: 0 }}>(comma-separated)</span></label>
          <textarea name="excluded" rows={2} style={F.ta} placeholder="International flights, Visa fees, Tips" />
        </div>
        <div style={F.wrap}>
          <label style={F.label}>What to Bring <span style={{ color: "var(--text-muted)", fontWeight: 400, textTransform: "none", letterSpacing: 0 }}>(comma-separated)</span></label>
          <textarea name="whatToBring" rows={2} style={F.ta} placeholder="Sturdy hiking boots, Rain jacket, Water (2L)" />
        </div>

        <ImageUploadField name="primaryImageUrl" folder="experiences" label="Primary Image" />

        <div style={F.wrap}>
          <label style={F.label}>Status</label>
          <select name="status" style={F.sel}>
            <option value="DRAFT">Draft</option>
            <option value="PUBLISHED">Published</option>
            <option value="ARCHIVED">Archived</option>
          </select>
        </div>

        <div style={{ display: "flex", gap: "var(--space-5)" }}>
          {F.check("featured", "Featured on home page", false)}
        </div>

        <div style={F.actions}>
          <button type="submit" className="btn btn--primary">Save Experience</button>
          <Link href="/admin/experiences" className="btn btn--ghost">Cancel</Link>
        </div>
      </form>
    </div>
  )
}
