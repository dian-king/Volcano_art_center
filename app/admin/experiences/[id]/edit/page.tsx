import { db } from "@/lib/db"
import { updateExperience } from "@/actions/admin-content"
import { F } from "@/components/admin/AdminForm"
import { ImageUploadField } from "@/components/admin/ImageUploadField"
import { notFound } from "next/navigation"
import Link from "next/link"

export default async function EditExperiencePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const [e, categories] = await Promise.all([
    db.experience.findUnique({ where: { id } }),
    db.experienceCategory.findMany({ orderBy: { name: "asc" } }),
  ])
  if (!e) notFound()
  const action = updateExperience.bind(null, id)

  return (
    <div style={{ maxWidth: 760 }}>
      <h1 style={{ fontFamily: "var(--font-display)", fontSize: "var(--text-headline)", fontWeight: 600, marginBottom: "var(--space-7)" }}>Edit: {e.title}</h1>
      <form action={action} style={{ display: "flex", flexDirection: "column", gap: "var(--space-5)" }}>
        <div style={F.wrap}><label style={F.label}>Title *</label><input name="title" defaultValue={e.title} required style={F.inp} /></div>
        <div style={F.wrap}><label style={F.label}>Short Description</label><textarea name="shortDescription" rows={2} defaultValue={e.shortDescription ?? ""} style={F.ta} /></div>
        <div style={F.wrap}><label style={F.label}>Full Description</label><textarea name="description" rows={5} defaultValue={e.description ?? ""} style={F.ta} /></div>

        <div style={F.grid2}>
          <div style={F.wrap}>
            <label style={F.label}>Category</label>
            <select name="categoryId" defaultValue={e.categoryId ?? ""} style={F.sel}>
              <option value="">Uncategorized</option>
              {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div style={F.wrap}>
            <label style={F.label}>Booking Type</label>
            <select name="bookingType" defaultValue={e.bookingType} style={F.sel}>
              <option value="DIRECT">Direct Booking</option>
              <option value="INQUIRY">Inquiry Only</option>
            </select>
          </div>
        </div>

        <div style={F.grid3}>
          <div style={F.wrap}><label style={F.label}>Price/Person</label><input name="pricePerPerson" type="number" min="0" step="0.01" defaultValue={e.pricePerPerson ? String(Number(e.pricePerPerson)) : ""} style={F.inp} /></div>
          <div style={F.wrap}>
            <label style={F.label}>Currency</label>
            <select name="currency" defaultValue={e.currency} style={F.sel}>
              <option value="USD">USD</option>
              <option value="RWF">RWF</option>
            </select>
          </div>
          <div style={F.wrap}><label style={F.label}>Duration (h)</label><input name="durationHours" type="number" step="0.5" defaultValue={e.durationHours ? String(Number(e.durationHours)) : ""} style={F.inp} /></div>
        </div>
        <div style={F.grid3}>
          <div style={F.wrap}><label style={F.label}>Location</label><input name="location" defaultValue={e.location ?? ""} style={F.inp} /></div>
        </div>

        <div style={F.grid2}>
          <div style={F.wrap}><label style={F.label}>Min Group</label><input name="minGroupSize" type="number" defaultValue={e.minGroupSize} style={F.inp} /></div>
          <div style={F.wrap}><label style={F.label}>Max Group</label><input name="maxGroupSize" type="number" defaultValue={e.maxGroupSize} style={F.inp} /></div>
        </div>

        <div style={F.wrap}>
          <label style={F.label}>Languages <span style={{ color: "var(--text-muted)", fontWeight: 400, textTransform: "none", letterSpacing: 0 }}>(comma-separated)</span></label>
          <input name="languages" style={F.inp} defaultValue={e.languages.join(", ")} placeholder="English, French, Kinyarwanda" />
        </div>
        <div style={F.wrap}><label style={F.label}>Meeting Point</label><input name="meetingPoint" defaultValue={e.meetingPoint ?? ""} style={F.inp} /></div>

        <div style={F.wrap}>
          <label style={F.label}>What&apos;s Included <span style={{ color: "var(--text-muted)", fontWeight: 400, textTransform: "none", letterSpacing: 0 }}>(comma-separated)</span></label>
          <textarea name="included" rows={3} style={F.ta} defaultValue={e.included.join(", ")} />
        </div>
        <div style={F.wrap}>
          <label style={F.label}>Not Included <span style={{ color: "var(--text-muted)", fontWeight: 400, textTransform: "none", letterSpacing: 0 }}>(comma-separated)</span></label>
          <textarea name="excluded" rows={2} style={F.ta} defaultValue={e.excluded.join(", ")} />
        </div>
        <div style={F.wrap}>
          <label style={F.label}>What to Bring <span style={{ color: "var(--text-muted)", fontWeight: 400, textTransform: "none", letterSpacing: 0 }}>(comma-separated)</span></label>
          <textarea name="whatToBring" rows={2} style={F.ta} defaultValue={e.whatToBring.join(", ")} />
        </div>

        <ImageUploadField name="primaryImageUrl" folder="experiences" label="Primary Image" defaultUrl={e.primaryImageUrl ?? undefined} />

        <div style={F.wrap}>
          <label style={F.label}>Status</label>
          <select name="status" defaultValue={e.status} style={F.sel}>
            <option value="DRAFT">Draft</option>
            <option value="PUBLISHED">Published</option>
            <option value="ARCHIVED">Archived</option>
          </select>
        </div>

        <div style={{ display: "flex", gap: "var(--space-5)" }}>
          {F.check("featured", "Featured on home page", e.featured)}
        </div>

        <div style={F.actions}>
          <button type="submit" className="btn btn--primary">Save Changes</button>
          <Link href="/admin/experiences" className="btn btn--ghost">Cancel</Link>
        </div>
      </form>
    </div>
  )
}
