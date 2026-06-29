import { db } from "@/lib/db"
import { toggleReviewApproved, toggleReviewFeatured } from "@/actions/admin-content"
import { TH, TD, STATUS_COLORS, statusBadge } from "@/components/admin/AdminForm"
import { redirect } from "next/navigation"

export const dynamic = "force-dynamic"

async function approve(fd: FormData) {
  "use server"
  await toggleReviewApproved(fd.get("id") as string, true)
  redirect("/admin/reviews")
}
async function revoke(fd: FormData) {
  "use server"
  await toggleReviewApproved(fd.get("id") as string, false)
  redirect("/admin/reviews")
}
async function feature(fd: FormData) {
  "use server"
  await toggleReviewFeatured(fd.get("id") as string, true)
  redirect("/admin/reviews")
}
async function unfeature(fd: FormData) {
  "use server"
  await toggleReviewFeatured(fd.get("id") as string, false)
  redirect("/admin/reviews")
}

const btn = (color: string, disabled: boolean): React.CSSProperties => ({
  padding: "2px 10px", fontSize: "12px", fontWeight: 600, border: "none",
  borderRadius: "var(--radius-sm)", cursor: disabled ? "not-allowed" : "pointer",
  background: disabled ? "var(--border-subtle)" : color,
  color: disabled ? "var(--text-muted)" : "#fff",
  opacity: disabled ? 0.5 : 1,
})

export default async function ReviewsPage() {
  const reviews = await db.review.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true, reviewerName: true, reviewerCountry: true,
      rating: true, comment: true, approved: true, featured: true, createdAt: true,
      product: { select: { name: true } },
      experience: { select: { title: true } },
    },
  })

  return (
    <div>
      <h1 style={{ fontFamily: "var(--font-display)", fontSize: "var(--text-headline)", fontWeight: 600, marginBottom: "var(--space-6)" }}>Reviews</h1>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            {["Reviewer", "Review", "For", "Rating", "Date", "Approved", "Featured", "Actions"].map(h => (
              <th key={h} style={TH}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {reviews.map((r) => (
            <tr key={r.id}>
              <td style={TD}>
                <p style={{ fontWeight: 600, color: "var(--text-primary)", fontSize: "var(--text-small)" }}>{r.reviewerName}</p>
                {r.reviewerCountry && <p style={{ fontSize: "var(--text-caption)", color: "var(--text-muted)" }}>{r.reviewerCountry}</p>}
              </td>
              <td style={{ ...TD, maxWidth: 240 }}>
                <span style={{ fontSize: "var(--text-caption)", color: "var(--text-secondary)", fontStyle: "italic" }}>
                  &ldquo;{r.comment && r.comment.length > 120 ? r.comment.slice(0, 120) + "…" : (r.comment ?? "")}&rdquo;
                </span>
              </td>
              <td style={TD}>{r.product?.name ?? r.experience?.title ?? "—"}</td>
              <td style={TD}>
                <span style={{ color: "#F59E0B", fontFamily: "var(--font-mono)", fontSize: "var(--text-small)" }}>
                  {"★".repeat(r.rating)}{"☆".repeat(5 - r.rating)}
                </span>
              </td>
              <td style={TD}>{new Date(r.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}</td>
              <td style={TD}>{r.approved ? statusBadge("APPROVED", STATUS_COLORS) : <span style={{ color: "var(--text-muted)", fontSize: "var(--text-small)" }}>Pending</span>}</td>
              <td style={TD}>{r.featured ? "✓" : "—"}</td>
              <td style={TD}>
                <div style={{ display: "flex", gap: "var(--space-1)", flexWrap: "wrap" }}>
                  <form action={approve}>
                    <input type="hidden" name="id" value={r.id} />
                    <button type="submit" disabled={r.approved} style={btn("var(--green)", r.approved)}>Approve</button>
                  </form>
                  <form action={revoke}>
                    <input type="hidden" name="id" value={r.id} />
                    <button type="submit" disabled={!r.approved} style={btn("#e53e3e", !r.approved)}>Revoke</button>
                  </form>
                  <form action={feature}>
                    <input type="hidden" name="id" value={r.id} />
                    <button type="submit" disabled={r.featured} style={btn("#2563eb", r.featured)}>Feature</button>
                  </form>
                  <form action={unfeature}>
                    <input type="hidden" name="id" value={r.id} />
                    <button type="submit" disabled={!r.featured} style={btn("#7c3aed", !r.featured)}>Unfeature</button>
                  </form>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
