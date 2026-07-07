import { db } from "@/lib/db"
import { sendMail } from "@/lib/mailer"
import { formatPrice } from "@/lib/utils"
import type { Role } from "@prisma/client"

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
  currency: string
  status: string
  items: string[]
  trackingNumber?: string | null
  carrier?: string | null
}

function siteUrl() {
  return process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"
}

export function escapeHtml(value: string) {
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

export function emailShell(title: string, body: string) {
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

async function sendSafely(to: string, subject: string, html: string, replyTo?: string) {
  try {
    await sendMail(to, subject, html, replyTo)
  } catch (error) {
    console.warn("[transactional-email] failed to send", subject, "to", to, error)
  }
}

async function notifyAdmins(roles: Role[], title: string, body: string, ctaUrl: string, type = "INFO") {
  try {
    const admins = await db.user.findMany({
      where: { isActive: true, role: { in: roles } },
      select: { id: true },
    })
    if (admins.length === 0) return
    await db.notification.createMany({
      data: admins.map(a => ({ userId: a.id, title, body, type, ctaUrl })),
    })
  } catch (err) {
    console.warn("[transactional-email] failed to create admin notifications", err)
  }
}

// Hardcoded admin emails — also pulled from env so Vercel/production can override
const DIRECTOR_EMAIL  = process.env.DIRECTOR_EMAIL  ?? "ntihemuka@volcanoartscenterinc.org.rw"
const OPS_EMAIL       = process.env.OPS_EMAIL        ?? "oliveni@volcanoartscenterinc.org.rw"
const MARKETING_EMAIL = process.env.MARKETING_EMAIL  ?? "danken@volcanoartscenterinc.org.rw"

/** Orders & bookings → Director + Ops Manager */
async function getOrdersAdminEmails() {
  const dbUsers = await db.user.findMany({
    where: { isActive: true, role: { in: ["OPS_MANAGER", "SUPER_ADMIN"] } },
    select: { email: true },
  })
  return Array.from(new Set([DIRECTOR_EMAIL, OPS_EMAIL, ...dbUsers.map(u => u.email)]))
}

/** Donations → Director + Marketing/Content Manager */
async function getDonationAdminEmails() {
  const dbUsers = await db.user.findMany({
    where: { isActive: true, role: { in: ["CONTENT_MANAGER", "SUPER_ADMIN"] } },
    select: { email: true },
  })
  return Array.from(new Set([DIRECTOR_EMAIL, MARKETING_EMAIL, ...dbUsers.map(u => u.email)]))
}

/** Contact inquiries → all three admins */
function getAllAdminEmails() {
  return [DIRECTOR_EMAIL, OPS_EMAIL, MARKETING_EMAIL]
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
  for (const email of await getOrdersAdminEmails()) {
    await sendSafely(email, `New booking request: ${booking.reference}`, opsHtml, booking.guestEmail)
  }
  await notifyAdmins(
    ["OPS_MANAGER", "SUPER_ADMIN"],
    "New booking request",
    `${booking.guestName} requested ${booking.experienceTitle} on ${formatDate(booking.preferredDate)} (${booking.groupSize} guests)`,
    "/admin/bookings",
    "BOOKING"
  )
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
      <tr><td style="padding:10px 12px;background:#F9F8F5;font-weight:700;">Total</td><td style="padding:10px 12px;">${formatPrice(order.total, order.currency as "USD" | "RWF")}</td></tr>
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
  for (const email of await getOrdersAdminEmails()) {
    await sendSafely(email, `New art order: ${order.reference}`, opsHtml, order.customerEmail)
  }
  await notifyAdmins(
    ["OPS_MANAGER", "SUPER_ADMIN"],
    "New art order",
    `${order.recipientName} placed an order for ${order.items.join(", ")} — ${formatPrice(order.total, order.currency as "USD" | "RWF")}`,
    "/admin/orders",
    "ORDER"
  )
}

// ── DONATION EMAILS ──────────────────────────────────────────────────────────

type DonationEmail = {
  reference: string
  donorName?: string | null
  donorEmail: string
  amount: number
  currency: string
  purpose: string
  frequency: string
  anonymous: boolean
}

export async function sendDonationEmails(donation: DonationEmail) {
  const displayName = donation.anonymous || !donation.donorName ? "Anonymous donor" : donation.donorName

  // Donor confirmation
  const donorHtml = emailShell(
    "Thank you for your support",
    `<p style="font-size:15px;line-height:1.7;color:#555;">Dear ${escapeHtml(displayName)}, your donation has been received. Thank you for supporting conservation at Volcano Arts Center.</p>
    <table cellpadding="0" cellspacing="0" style="width:100%;margin:20px 0;border-collapse:collapse;border:1px solid #E8E8E5;">
      <tr><td style="padding:10px 12px;background:#F9F8F5;font-weight:700;">Reference</td><td style="padding:10px 12px;">${escapeHtml(donation.reference)}</td></tr>
      <tr><td style="padding:10px 12px;background:#F9F8F5;font-weight:700;">Amount</td><td style="padding:10px 12px;">${formatPrice(donation.amount, donation.currency as "USD" | "RWF")}</td></tr>
      <tr><td style="padding:10px 12px;background:#F9F8F5;font-weight:700;">Purpose</td><td style="padding:10px 12px;">${escapeHtml(donation.purpose.replace("_", " "))}</td></tr>
      <tr><td style="padding:10px 12px;background:#F9F8F5;font-weight:700;">Frequency</td><td style="padding:10px 12px;">${escapeHtml(donation.frequency.replace("_", " "))}</td></tr>
    </table>
    <p style="font-size:15px;line-height:1.7;color:#555;">Our team will reach out to confirm next steps for payment. Every contribution makes a direct difference to Rwanda's gorilla habitat.</p>`
  )
  await sendSafely(donation.donorEmail, `Donation received: ${donation.reference}`, donorHtml)

  // Admin notification → Director + Marketing
  const adminHtml = emailShell(
    "New conservation donation",
    `<p style="font-size:15px;line-height:1.7;color:#555;">A new donation was submitted.</p>
    <table cellpadding="0" cellspacing="0" style="width:100%;margin:20px 0;border-collapse:collapse;border:1px solid #E8E8E5;">
      <tr><td style="padding:10px 12px;background:#F9F8F5;font-weight:700;">Reference</td><td style="padding:10px 12px;">${escapeHtml(donation.reference)}</td></tr>
      <tr><td style="padding:10px 12px;background:#F9F8F5;font-weight:700;">Donor</td><td style="padding:10px 12px;">${escapeHtml(displayName)}</td></tr>
      ${!donation.anonymous ? `<tr><td style="padding:10px 12px;background:#F9F8F5;font-weight:700;">Email</td><td style="padding:10px 12px;">${escapeHtml(donation.donorEmail)}</td></tr>` : ""}
      <tr><td style="padding:10px 12px;background:#F9F8F5;font-weight:700;">Amount</td><td style="padding:10px 12px;">${formatPrice(donation.amount, donation.currency as "USD" | "RWF")}</td></tr>
      <tr><td style="padding:10px 12px;background:#F9F8F5;font-weight:700;">Purpose</td><td style="padding:10px 12px;">${escapeHtml(donation.purpose.replace("_", " "))}</td></tr>
      <tr><td style="padding:10px 12px;background:#F9F8F5;font-weight:700;">Frequency</td><td style="padding:10px 12px;">${escapeHtml(donation.frequency.replace("_", " "))}</td></tr>
    </table>
    <p><a href="${siteUrl()}/admin/conservation" style="display:inline-block;background:#00A651;color:#fff;text-decoration:none;padding:11px 18px;border-radius:6px;font-weight:700;">View in Admin</a></p>`
  )
  for (const email of await getDonationAdminEmails()) {
    await sendSafely(email, `New donation ${formatPrice(donation.amount, donation.currency as "USD" | "RWF")}: ${donation.reference}`, adminHtml, donation.donorEmail)
  }
  await notifyAdmins(
    ["CONTENT_MANAGER", "SUPER_ADMIN"],
    "New conservation donation",
    `${displayName} donated ${formatPrice(donation.amount, donation.currency as "USD" | "RWF")} for ${donation.purpose.replace("_", " ")}`,
    "/admin/conservation",
    "DONATION"
  )
}

export async function sendDonationConfirmedEmail(donation: { reference: string; donorName?: string | null; donorEmail: string; amount: number; currency: string }) {
  const displayName = donation.donorName || "friend"
  const html = emailShell(
    "Your donation is confirmed",
    `<p style="font-size:15px;line-height:1.7;color:#555;">Dear ${escapeHtml(displayName)}, we have confirmed receipt of your donation. Thank you for supporting conservation at Volcano Arts Center — your contribution is now funding work on the ground.</p>
    <table cellpadding="0" cellspacing="0" style="width:100%;margin:20px 0;border-collapse:collapse;border:1px solid #E8E8E5;">
      <tr><td style="padding:10px 12px;background:#F9F8F5;font-weight:700;">Reference</td><td style="padding:10px 12px;">${escapeHtml(donation.reference)}</td></tr>
      <tr><td style="padding:10px 12px;background:#F9F8F5;font-weight:700;">Amount</td><td style="padding:10px 12px;">${formatPrice(donation.amount, donation.currency as "USD" | "RWF")}</td></tr>
    </table>`
  )
  await sendSafely(donation.donorEmail, `Donation confirmed: ${donation.reference}`, html)
}

// ── CONTACT EMAILS ───────────────────────────────────────────────────────────

type ContactEmail = {
  name: string
  email: string
  phone?: string | null
  subject: string
  message: string
}

export async function sendContactEmails(inquiry: ContactEmail) {
  // Auto-reply to sender
  const senderHtml = emailShell(
    "We received your message",
    `<p style="font-size:15px;line-height:1.7;color:#555;">Dear ${escapeHtml(inquiry.name)}, thank you for reaching out to Volcano Arts Center. We will get back to you within 24–48 hours.</p>
    <table cellpadding="0" cellspacing="0" style="width:100%;margin:20px 0;border-collapse:collapse;border:1px solid #E8E8E5;">
      <tr><td style="padding:10px 12px;background:#F9F8F5;font-weight:700;">Subject</td><td style="padding:10px 12px;">${escapeHtml(inquiry.subject)}</td></tr>
      <tr><td style="padding:10px 12px;background:#F9F8F5;font-weight:700;">Your message</td><td style="padding:10px 12px;">${escapeHtml(inquiry.message)}</td></tr>
    </table>
    <p style="font-size:15px;line-height:1.7;color:#555;">For urgent matters you can reach us directly at <a href="mailto:${DIRECTOR_EMAIL}" style="color:#00A651;">${DIRECTOR_EMAIL}</a>.</p>`
  )
  await sendSafely(inquiry.email, "We received your message — Volcano Arts Center", senderHtml)

  // Admin notification → all three admins, reply-to is the sender so they can reply directly
  const adminHtml = emailShell(
    "New contact inquiry",
    `<p style="font-size:15px;line-height:1.7;color:#555;">A visitor submitted a contact form. Reply to this email to respond directly to them.</p>
    <table cellpadding="0" cellspacing="0" style="width:100%;margin:20px 0;border-collapse:collapse;border:1px solid #E8E8E5;">
      <tr><td style="padding:10px 12px;background:#F9F8F5;font-weight:700;">Name</td><td style="padding:10px 12px;">${escapeHtml(inquiry.name)}</td></tr>
      <tr><td style="padding:10px 12px;background:#F9F8F5;font-weight:700;">Email</td><td style="padding:10px 12px;"><a href="mailto:${escapeHtml(inquiry.email)}" style="color:#00A651;">${escapeHtml(inquiry.email)}</a></td></tr>
      ${inquiry.phone ? `<tr><td style="padding:10px 12px;background:#F9F8F5;font-weight:700;">Phone</td><td style="padding:10px 12px;">${escapeHtml(inquiry.phone)}</td></tr>` : ""}
      <tr><td style="padding:10px 12px;background:#F9F8F5;font-weight:700;">Subject</td><td style="padding:10px 12px;">${escapeHtml(inquiry.subject)}</td></tr>
      <tr><td style="padding:10px 12px;background:#F9F8F5;font-weight:700;">Message</td><td style="padding:10px 12px;white-space:pre-wrap;">${escapeHtml(inquiry.message)}</td></tr>
    </table>
    <p><a href="${siteUrl()}/admin/inquiries" style="display:inline-block;background:#00A651;color:#fff;text-decoration:none;padding:11px 18px;border-radius:6px;font-weight:700;">View in Admin</a></p>`
  )
  for (const email of getAllAdminEmails()) {
    await sendSafely(email, `New inquiry from ${inquiry.name}: ${inquiry.subject}`, adminHtml, inquiry.email)
  }
  await notifyAdmins(
    ["OPS_MANAGER", "CONTENT_MANAGER", "SUPER_ADMIN"],
    "New contact inquiry",
    `${inquiry.name} — "${inquiry.subject}"`,
    "/admin/inquiries",
    "INQUIRY"
  )
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
