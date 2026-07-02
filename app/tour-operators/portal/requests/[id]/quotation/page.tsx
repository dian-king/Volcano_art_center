import { db } from "@/lib/db"
import { getPortalSession, getTourOperatorByUserId } from "@/lib/portal-session"
import { notFound, redirect } from "next/navigation"
import { PrintButton } from "@/components/operators/PrintButton"

export const dynamic = "force-dynamic"

export default async function OperatorQuotationPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getPortalSession()
  if (!session?.user?.id) redirect("/login?next=/tour-operators/portal")

  const { id } = await params
  const operator = await getTourOperatorByUserId(session.user.id)
  if (!operator) notFound()

  const request = await db.operatorRequest.findUnique({ where: { id }, include: { operator: true } })
  if (!request || request.operatorId !== operator.id) notFound()

  const amount = Number(request.partnerPrice ?? 0)

  return (
    <main style={{ minHeight: "100vh", background: "#f7f7f4", padding: "40px" }}>
      <section style={{ maxWidth: 760, margin: "0 auto", background: "#fff", border: "1px solid #e5e5df", borderRadius: 8, padding: 36, color: "#1c1c1c" }}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 24, borderBottom: "1px solid #e5e5df", paddingBottom: 24, marginBottom: 24 }}>
          <div>
            <h1 style={{ fontFamily: "Georgia, serif", fontSize: 30, margin: 0 }}>Quotation</h1>
            <p style={{ margin: "6px 0 0", color: "#666" }}>Volcano Arts Center Inc Rwanda</p>
          </div>
          <PrintButton />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, marginBottom: 28 }}>
          <div>
            <p style={{ fontSize: 12, textTransform: "uppercase", color: "#777", fontWeight: 700 }}>Prepared for</p>
            <p style={{ margin: "8px 0 0", fontWeight: 700 }}>{request.operator.companyName}</p>
            <p style={{ margin: "4px 0 0", color: "#666" }}>{request.operator.contactName}</p>
            <p style={{ margin: "4px 0 0", color: "#666" }}>{request.operator.email}</p>
          </div>
          <div>
            <p style={{ fontSize: 12, textTransform: "uppercase", color: "#777", fontWeight: 700 }}>Request</p>
            <p style={{ margin: "8px 0 0" }}>#{request.id.slice(0, 8).toUpperCase()}</p>
            <p style={{ margin: "4px 0 0", color: "#666" }}>{request.status.replaceAll("_", " ")}</p>
            <p style={{ margin: "4px 0 0", color: "#666" }}>{request.createdAt.toLocaleDateString("en-GB")}</p>
          </div>
        </div>

        <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: 28 }}>
          <tbody>
            {[
              ["Request type", request.requestType.replaceAll("_", " ")],
              ["Experience", request.experienceSlug ?? "Custom itinerary"],
              ["Estimated size", `${request.estimatedSize} guests`],
              ["Estimated date", request.estimatedDate ? request.estimatedDate.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" }) : "Flexible"],
              ["Partner price", amount > 0 ? `${amount.toLocaleString()} RWF` : "Pending operations confirmation"],
            ].map(([k, v]) => (
              <tr key={k}>
                <td style={{ border: "1px solid #e5e5df", background: "#f7f7f4", padding: 12, fontWeight: 700 }}>{k}</td>
                <td style={{ border: "1px solid #e5e5df", padding: 12 }}>{v}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {request.specialRequests && (
          <div style={{ marginBottom: 24 }}>
            <p style={{ fontSize: 12, textTransform: "uppercase", color: "#777", fontWeight: 700 }}>Itinerary notes</p>
            <p style={{ lineHeight: 1.7 }}>{request.specialRequests}</p>
          </div>
        )}

        {request.adminNote && (
          <div style={{ background: "#edf8f1", border: "1px solid #00A65144", borderRadius: 6, padding: 16 }}>
            <p style={{ margin: 0, fontWeight: 700, color: "#007a3d" }}>Operations note</p>
            <p style={{ margin: "6px 0 0", lineHeight: 1.7 }}>{request.adminNote}</p>
          </div>
        )}
      </section>
    </main>
  )
}
