import { db } from "@/lib/db"
import { sendMail } from "@/lib/mailer"

type BookingEmail = {
  reference: string
  guestName: string
  guestEmail: string
  experienceTitle: string
  preferredDate: Date
  groupSize: number
  note?: string | null
}

type OrderEmail = {
  reference: string
  customerEmail: string
  recipientName: string
  total: number
  status: string
  items: string[]
  trackingNumber?: string | null
  carrier?: string | null
}

function siteUrl() {
  return process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;")
}

function formatDate(date: Date) {
  return date.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })
}

function emailShell(title: string, body: string) {
  return `<!DOCTYPE html>
<html>
<body style="margin:0;padding:0;background:#F9F8F5;font-family:Arial,sans-serif;color:#1C1C1C;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#F9F8F5;padding:32px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;background:#ffffff;border-radius:8px;overflow:hidden;border:1px solid #E8E8E5;">
        <tr>
          <td style="background:#004D26;padding:28px 32px;text-align:center;">
            <h1 style="margin:0;font-family:Georgia,serif;font-size:24px;color:#ffffff;">Volcano Arts Center</h1>
            <p style="margin:6px 0 0;font-size:12px;color:rgba(255,255,255,0.75);letter-spacing:0.08em;text-transform:uppercase;">Arts, Culture & Conservation</p>
          </td>
        </tr>
        <tr>
          <td style="padding:32px;">
            <h2 style="margin:0 0 16px;font-family:Georgia,serif;font-size:22px;color:#1C1C1C;">${escapeHtml(title)}</h2>
            ${body}
          </td>
        </tr>
        <tr>
          <td style="background:#F9F8F5;padding:20px 32px;border-top:1px solid #E8E8E5;">
            <p style="margin:0;font-size:12px;color:#777;line-height:1.6;">
              Volcano Arts Center Inc Rwanda<br/>
              <a href="${siteUrl()}" style="color:#00A651;">${siteUrl()}</a>
            </p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`
}

function bookingSummary(booking: BookingEmail) {
  return `
    <table cellpadding="0" cellspacing="0" style="width:100%;margin:20px 0;border-collapse:collapse;border:1px solid #E8E8E5;">
      <tr><td style="padding:10px 12px;background:#F9F8F5;font-weight:700;">Reference</td><td style="padding:10px 12px;">${escapeHtml(booking.reference)}</td></tr>
      <tr><td style="padding:10px 12px;background:#F9F8F5;font-weight:700;">Experience</td><td style="padding:10px 12px;">${escapeHtml(booking.experienceTitle)}</td></tr>
      <tr><td style="padding:10px 12px;background:#F9F8F5;font-weight:700;">Date</td><td style="padding:10px 12px;">${formatDate(booking.preferredDate)}</td></tr>
      <tr><td style="padding:10px 12px;background:#F9F8F5;font-weight:700;">Group</td><td style="padding:10px 12px;">${booking.groupSize}</td></tr>
    </table>`
}

async function sendSafely(to: string, subject: string, html: string) {
  try {
    await sendMail(to, subject, html)
  } catch (error) {
    console.warn("[transactional-email] failed to send", subject, "to", to, error)
  }
}

async function getOperationsEmails() {
  const users = await db.user.findMany({
    where: { isActive: true, role: { in: ["OPS_MANAGER", "SUPER_ADMIN"] } },
    select: { email: true },
  })
  const configured = [process.env.OPERATIONS_EMAIL, process.env.ADMIN_EMAIL].filter(Boolean) as string[]
  return Array.from(new Set([...users.map(u => u.email), ...configured]))
}

export async function sendBookingSubmittedEmails(booking: BookingEmail) {
  const html = emailShell(
    "Booking request received",
    `<p style="font-size:15px;line-height:1.7;color:#555;">Hello ${escapeHtml(booking.guestName)}, we received your booking request. Our operations team will review availability and confirm the next step.</p>
    ${bookingSummary(booking)}
    <p style="font-size:15px;line-height:1.7;color:#555;">You can follow this booking from your account dashboard.</p>`
  )
  await sendSafely(booking.guestEmail, `Booking request received: ${booking.reference}`, html)

  const opsHtml = emailShell(
    "New booking request",
    `<p style="font-size:15px;line-height:1.7;color:#555;">A new booking request was submitted by ${escapeHtml(booking.guestName)}.</p>
    ${bookingSummary(booking)}
    <p style="font-size:15px;line-height:1.7;color:#555;">Review it in the admin booking queue.</p>
    <p><a href="${siteUrl()}/admin/bookings" style="display:inline-block;background:#00A651;color:#fff;text-decoration:none;padding:11px 18px;border-radius:6px;font-weight:700;">Open Bookings</a></p>`
  )
  for (const email of await getOperationsEmails()) {
    await sendSafely(email, `New booking request: ${booking.reference}`, opsHtml)
  }
}

export async function sendBookingApprovedEmail(booking: BookingEmail) {
  const html = emailShell(
    "Booking approved",
    `<p style="font-size:15px;line-height:1.7;color:#555;">Hello ${escapeHtml(booking.guestName)}, your booking request has been approved.</p>
    ${bookingSummary(booking)}
    ${booking.note ? `<p style="font-size:15px;line-height:1.7;color:#555;"><strong>Message from our team:</strong> ${escapeHtml(booking.note)}</p>` : ""}
    <p style="font-size:15px;line-height:1.7;color:#555;">Our team will contact you if any extra preparation is needed.</p>`
  )
  await sendSafely(booking.guestEmail, `Booking approved: ${booking.reference}`, html)
}

export async function sendBookingRejectedEmail(booking: BookingEmail) {
  const html = emailShell(
    "Booking request update",
    `<p style="font-size:15px;line-height:1.7;color:#555;">Hello ${escapeHtml(booking.guestName)}, we are sorry, but we cannot approve this booking request as submitted.</p>
    ${bookingSummary(booking)}
    <p style="font-size:15px;line-height:1.7;color:#555;"><strong>Reason:</strong> ${escapeHtml(booking.note || "No reason provided.")}</p>
    <p style="font-size:15px;line-height:1.7;color:#555;">You are welcome to submit a new request with another date or group size.</p>`
  )
  await sendSafely(booking.guestEmail, `Booking request update: ${booking.reference}`, html)
}

function orderSummary(order: OrderEmail) {
  return `
    <table cellpadding="0" cellspacing="0" style="width:100%;margin:20px 0;border-collapse:collapse;border:1px solid #E8E8E5;">
      <tr><td style="padding:10px 12px;background:#F9F8F5;font-weight:700;">Reference</td><td style="padding:10px 12px;">${escapeHtml(order.reference)}</td></tr>
      <tr><td style="padding:10px 12px;background:#F9F8F5;font-weight:700;">Items</td><td style="padding:10px 12px;">${escapeHtml(order.items.join(", "))}</td></tr>
      <tr><td style="padding:10px 12px;background:#F9F8F5;font-weight:700;">Total</td><td style="padding:10px 12px;">$${order.total.toFixed(2)}</td></tr>
      <tr><td style="padding:10px 12px;background:#F9F8F5;font-weight:700;">Status</td><td style="padding:10px 12px;">${escapeHtml(order.status)}</td></tr>
      ${order.trackingNumber ? `<tr><td style="padding:10px 12px;background:#F9F8F5;font-weight:700;">Tracking</td><td style="padding:10px 12px;">${escapeHtml(order.trackingNumber)}${order.carrier ? ` (${escapeHtml(order.carrier)})` : ""}</td></tr>` : ""}
    </table>`
}

export async function sendOrderPlacedEmails(order: OrderEmail) {
  const html = emailShell(
    "Order received",
    `<p style="font-size:15px;line-height:1.7;color:#555;">Hello ${escapeHtml(order.recipientName)}, we received your art order. Please use the order reference when making payment.</p>
    ${orderSummary(order)}
    <p style="font-size:15px;line-height:1.7;color:#555;">Our operations team will confirm payment and prepare your shipment.</p>`
  )
  await sendSafely(order.customerEmail, `Order received: ${order.reference}`, html)

  const opsHtml = emailShell(
    "New art order",
    `<p style="font-size:15px;line-height:1.7;color:#555;">A new art order was placed by ${escapeHtml(order.recipientName)}.</p>
    ${orderSummary(order)}
    <p><a href="${siteUrl()}/admin/orders" style="display:inline-block;background:#00A651;color:#fff;text-decoration:none;padding:11px 18px;border-radius:6px;font-weight:700;">Open Orders</a></p>`
  )
  for (const email of await getOperationsEmails()) {
    await sendSafely(email, `New art order: ${order.reference}`, opsHtml)
  }
}

export async function sendOrderStatusEmail(order: OrderEmail) {
  const isShipped = order.status === "SHIPPED"
  const html = emailShell(
    isShipped ? "Your order has shipped" : "Order status updated",
    `<p style="font-size:15px;line-height:1.7;color:#555;">Hello ${escapeHtml(order.recipientName)}, your order status is now <strong>${escapeHtml(order.status)}</strong>.</p>
    ${orderSummary(order)}
    ${isShipped ? `<p style="font-size:15px;line-height:1.7;color:#555;">Use the tracking details above to follow your shipment.</p>` : ""}`
  )
  await sendSafely(order.customerEmail, `${isShipped ? "Order shipped" : "Order update"}: ${order.reference}`, html)
}
