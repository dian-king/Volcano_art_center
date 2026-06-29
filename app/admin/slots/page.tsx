import Link from "next/link"
import { redirect } from "next/navigation"
import { db } from "@/lib/db"
import { updateSlotStatus } from "@/actions/admin-content"
import { F, TH, TD, STATUS_COLORS, statusBadge } from "@/components/admin/AdminForm"

export const dynamic = "force-dynamic"

async function saveSlot(fd: FormData) {
  "use server"
  await updateSlotStatus(fd.get("id") as string, fd.get("status") as string)
  redirect("/admin/slots")
}

export default async function SlotsPage() {
  const slots = await db.availabilitySlot.findMany({
    orderBy: { date: "desc" },
    include: { experience: { select: { title: true } } },
  })

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "var(--space-6)" }}>
        <h1 style={{ fontFamily: "var(--font-display)", fontSize: "var(--text-h2)" }}>Availability Slots</h1>
        <Link href="/admin/slots/new" style={{ padding: "0 var(--space-4)", height: "40px", display: "inline-flex", alignItems: "center", background: "var(--green)", color: "#fff", borderRadius: "var(--radius-md)", textDecoration: "none", fontSize: "var(--text-small)", fontFamily: "var(--font-ui)", fontWeight: 600 }}>
          + New Slot
        </Link>
      </div>
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th style={TH}>Experience</th>
              <th style={TH}>Date</th>
              <th style={TH}>Capacity</th>
              <th style={TH}>Booked</th>
              <th style={TH}>Status</th>
              <th style={TH}>Guide</th>
              <th style={TH}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {slots.map((s) => (
              <tr key={s.id}>
                <td style={TD}>{s.experience?.title ?? "—"}</td>
                <td style={TD}>{s.date.toLocaleDateString("en-GB")}</td>
                <td style={TD}>{s.capacity}</td>
                <td style={TD}>{s.booked}</td>
                <td style={TD}>{statusBadge(s.status, STATUS_COLORS)}</td>
                <td style={TD}>{s.guideName ?? "—"}</td>
                <td style={TD}>
                  <form action={saveSlot} style={{ display: "flex", gap: "var(--space-2)", alignItems: "center" }}>
                    <input type="hidden" name="id" value={s.id} />
                    <select name="status" defaultValue={s.status} style={{ ...F.sel, width: "160px" }}>
                      {["AVAILABLE", "LIMITED", "FULLY_BOOKED", "REQUEST_ONLY", "BLACKOUT"].map((st) => (
                        <option key={st} value={st}>{st}</option>
                      ))}
                    </select>
                    <button type="submit" style={{ padding: "0 var(--space-3)", height: "40px", background: "var(--green)", color: "#fff", border: "none", borderRadius: "var(--radius-md)", cursor: "pointer", fontSize: "var(--text-small)", fontFamily: "var(--font-ui)", whiteSpace: "nowrap" }}>
                      Save
                    </button>
                  </form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {slots.length === 0 && (
          <p style={{ color: "var(--text-muted)", textAlign: "center", padding: "var(--space-8)" }}>No slots yet.</p>
        )}
      </div>
    </div>
  )
}
