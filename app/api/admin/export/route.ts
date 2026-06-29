import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { NextRequest, NextResponse } from "next/server"

function toCSV(rows: Record<string, unknown>[]): string {
  if (!rows.length) return ""
  const headers = Object.keys(rows[0])
  const lines = [
    headers.join(","),
    ...rows.map(row => headers.map(h => {
      const v = String(row[h] ?? "").replace(/"/g, '""')
      return `"${v}"`
    }).join(","))
  ]
  return lines.join("\n")
}

export async function GET(req: NextRequest) {
  const session = await auth()
  const role = session?.user?.role as string | undefined
  if (!role || !["SUPER_ADMIN", "OPS_MANAGER"].includes(role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const type = req.nextUrl.searchParams.get("type")

  let csv = ""
  let filename = "export.csv"

  if (type === "orders") {
    const orders = await db.order.findMany({
      orderBy: { createdAt: "desc" },
      include: { user: { select: { email: true } } }
    })
    csv = toCSV(orders.map(o => ({
      reference: o.reference, email: o.user.email, status: o.status,
      total: Number(o.total), country: o.country, city: o.city,
      createdAt: o.createdAt.toISOString(),
    })))
    filename = "orders.csv"
  } else if (type === "bookings") {
    const bookings = await db.booking.findMany({
      orderBy: { createdAt: "desc" },
      include: { experience: { select: { title: true } } }
    })
    csv = toCSV(bookings.map(b => ({
      reference: b.reference, guestName: b.guestName, guestEmail: b.guestEmail,
      experience: b.experience.title, groupSize: b.groupSize,
      preferredDate: b.preferredDate.toISOString().split("T")[0],
      status: b.status, createdAt: b.createdAt.toISOString(),
    })))
    filename = "bookings.csv"
  } else if (type === "donations") {
    const donations = await db.donation.findMany({
      orderBy: { createdAt: "desc" },
      include: { campaign: { select: { name: true } } }
    })
    csv = toCSV(donations.map(d => ({
      reference: d.reference, donorEmail: d.donorEmail, donorName: d.donorName ?? "",
      amount: Number(d.amount), currency: d.currency,
      campaign: d.campaign?.name ?? "General", status: d.status,
      createdAt: d.createdAt.toISOString(),
    })))
    filename = "donations.csv"
  } else {
    return NextResponse.json({ error: "Invalid type. Use: orders, bookings, donations" }, { status: 400 })
  }

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  })
}
