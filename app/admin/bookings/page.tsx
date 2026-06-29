import Link from "next/link"
import { redirect } from "next/navigation"
import { db } from "@/lib/db"
import { updateBookingStatus } from "@/actions/admin-content"
import { F, TH, TD, STATUS_COLORS, statusBadge } from "@/components/admin/AdminForm"

export const dynamic = "force-dynamic"

async function setStatus(fd: FormData) {
  "use server"
  await updateBookingStatus(fd.get("id") as string, fd.get("status") as string)
  redirect("/admin/bookings")
}

export default async function BookingsPage() {
  const bookings = await db.booking.findMany({
    orderBy: { createdAt: "desc" },
    include: { experience: { select: { title: true } } },
  })

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "var(--space-6)" }}>
        <h1 style={{ fontFamily: "var(--font-display)", fontSize: "var(--text-h2)" }}>Bookings</h1>
        <a href="/api/admin/export?type=bookings" className="btn btn--ghost btn--sm" download>↓ Export CSV</a>
      </div>
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th style={TH}>Reference</th>
              <th style={TH}>Experience</th>
              <th style={TH}>Guest</th>
              <th style={TH}>Date</th>
              <th style={TH}>Group</th>
              <th style={TH}>Status</th>
              <th style={TH}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {bookings.map((b) => {
              const d = b.preferredDate
              const formatted = d
                ? `${String(d.getDate()).padStart(2, "0")} ${d.toLocaleString("en-GB", { month: "short" })} ${d.getFullYear()}`
                : "—"
              return (
                <tr key={b.id}>
                  <td style={TD}><code style={{ fontFamily: "var(--font-mono)", fontSize: "11px", color: "var(--green)" }}>{b.id.slice(0, 8)}</code></td>
                  <td style={TD}>{b.experience?.title ?? "—"}</td>
                  <td style={TD}>{b.guestName ?? b.guestEmail ?? "—"}</td>
                  <td style={TD}>{formatted}</td>
                  <td style={TD}>{b.groupSize}</td>
                  <td style={TD}>{statusBadge(b.status, STATUS_COLORS)}</td>
                  <td style={TD}>
                    <form action={setStatus} style={{ display: "flex", gap: "var(--space-2)", alignItems: "center" }}>
                      <input type="hidden" name="id" value={b.id} />
                      <select name="status" defaultValue={b.status} style={{ ...F.sel, width: "160px" }}>
                        {["PENDING", "CONFIRMED", "CANCELLED", "COMPLETED", "REJECTED"].map((s) => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                      <button type="submit" style={{ padding: "0 var(--space-3)", height: "36px", background: "var(--green)", color: "#fff", border: "none", borderRadius: "var(--radius-md)", cursor: "pointer", fontSize: "var(--text-small)", fontFamily: "var(--font-ui)", whiteSpace: "nowrap" }}>
                        Save
                      </button>
                    </form>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
        {bookings.length === 0 && (
          <p style={{ color: "var(--text-muted)", textAlign: "center", padding: "var(--space-8)" }}>No bookings yet.</p>
        )}
      </div>
    </div>
  )
}
