"use server"
import { db } from "@/lib/db"
import { sendMail } from "@/lib/mailer"
import { z } from "zod"

const schema = z.string().email()

export async function subscribeNewsletter(fd: FormData) {
  const email = (fd.get("email") as string ?? "").trim().toLowerCase()
  if (!schema.safeParse(email).success) return { error: "Please enter a valid email address." }

  // Store subscription (idempotent)
  const existing = await db.contactInquiry.findFirst({ where: { email, subject: "Newsletter Subscription" } })
  if (!existing) {
    await db.contactInquiry.create({
      data: {
        name: email.split("@")[0],
        email,
        subject: "Newsletter Subscription",
        message: `${email} subscribed to the VAC journal on ${new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}.`,
        status: "CLOSED",
      },
    })
  }

  // Send welcome email (skips gracefully if SMTP not configured)
  const siteUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"
  await sendMail(
    email,
    "Welcome to the Volcano Arts Center Journal",
    `<!DOCTYPE html>
<html>
<body style="margin:0;padding:0;background:#F9F8F5;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#F9F8F5;padding:40px 0;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
        <tr>
          <td style="background:#004D26;padding:32px 40px;text-align:center;">
            <h1 style="margin:0;font-family:Georgia,serif;font-size:24px;font-weight:600;color:#fff;">Volcano Arts Center</h1>
            <p style="margin:6px 0 0;font-size:13px;color:rgba(255,255,255,0.7);letter-spacing:0.06em;text-transform:uppercase;">Inc Rwanda · Arts &amp; Cultural Experience</p>
          </td>
        </tr>
        <tr>
          <td style="padding:40px;">
            <h2 style="margin:0 0 16px;font-family:Georgia,serif;font-size:22px;color:#1C1C1C;">Welcome to the Journal</h2>
            <p style="margin:0 0 16px;font-size:15px;line-height:1.7;color:#6B6B6B;">Thank you for joining the Volcano Arts Center community. You are now part of a growing network of art lovers, collectors, and conservation champions connected to Rwanda's most vibrant cultural hub.</p>
            <p style="margin:0 0 24px;font-size:15px;line-height:1.7;color:#6B6B6B;">Expect to hear from us with new artwork arrivals, stories from our artists, conservation updates from the Virunga, and exclusive early access to exhibitions and events.</p>
            <table cellpadding="0" cellspacing="0">
              <tr>
                <td style="background:#00A651;border-radius:999px;">
                  <a href="${siteUrl}" style="display:inline-block;padding:12px 28px;font-size:14px;font-weight:600;color:#fff;text-decoration:none;">Visit the Gallery →</a>
                </td>
              </tr>
            </table>
          </td>
        </tr>
        <tr>
          <td style="background:#F9F8F5;padding:24px 40px;border-top:1px solid #E8E8E5;">
            <p style="margin:0;font-size:12px;color:#9A9A94;line-height:1.6;">
              Volcano Arts Center Inc Rwanda · GJQ7+P76, Musanze, Rwanda<br/>
              You received this because you subscribed at ${siteUrl}.<br/>
              <a href="${siteUrl}/contact" style="color:#00A651;">Unsubscribe</a>
            </p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`
  )

  return { success: true }
}
