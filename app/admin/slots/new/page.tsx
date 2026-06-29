import Link from "next/link"
import { db } from "@/lib/db"
import { createSlot } from "@/actions/admin-content"
import { F } from "@/components/admin/AdminForm"

export default async function NewSlotPage() {
  const experiences = await db.experience.findMany({
    select: { id: true, title: true },
    orderBy: { title: "asc" },
  })

  return (
    <div style={{ maxWidth: "640px" }}>
      <h1 style={{ fontFamily: "var(--font-display)", fontSize: "var(--text-h2)", marginBottom: "var(--space-6)" }}>New Availability Slot</h1>
      <form action={createSlot}>
        <div style={F.grid2}>
          <div style={F.wrap}>
            <label style={F.label}>Experience *</label>
            <select name="experienceId" required style={F.sel}>
              <option value="">Select experience…</option>
              {experiences.map((e) => (
                <option key={e.id} value={e.id}>{e.title}</option>
              ))}
            </select>
          </div>
          <div style={F.wrap}>
            <label style={F.label}>Date *</label>
            <input type="date" name="date" required style={F.inp} />
          </div>
          <div style={F.wrap}>
            <label style={F.label}>Capacity</label>
            <input type="number" name="capacity" defaultValue={10} min={1} style={F.inp} />
          </div>
          <div style={F.wrap}>
            <label style={F.label}>Status</label>
            <select name="status" defaultValue="AVAILABLE" style={F.sel}>
              {["AVAILABLE", "LIMITED", "REQUEST_ONLY"].map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
          <div style={F.wrap}>
            <label style={F.label}>Guide Name</label>
            <input type="text" name="guideName" placeholder="Guide name…" style={F.inp} />
          </div>
          <div style={F.wrap}>
            <label style={F.label}>Guide Email</label>
            <input type="email" name="guideEmail" placeholder="guide@example.com" style={F.inp} />
          </div>
        </div>
        <div style={F.actions}>
          <button type="submit" style={{ padding: "0 var(--space-5)", height: "40px", background: "var(--green)", color: "#fff", border: "none", borderRadius: "var(--radius-md)", cursor: "pointer", fontSize: "var(--text-small)", fontFamily: "var(--font-ui)", fontWeight: 600 }}>
            Create Slot
          </button>
          <Link href="/admin/slots" style={{ padding: "0 var(--space-5)", height: "40px", display: "inline-flex", alignItems: "center", border: "1px solid var(--border-subtle)", borderRadius: "var(--radius-md)", textDecoration: "none", fontSize: "var(--text-small)", fontFamily: "var(--font-ui)", color: "var(--text-secondary)" }}>
            Cancel
          </Link>
        </div>
      </form>
    </div>
  )
}
