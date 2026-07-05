import nodemailer from "nodemailer"

export function getTransporter() {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST ?? "smtp.gmail.com",
    port: Number(process.env.SMTP_PORT ?? 587),
    secure: Number(process.env.SMTP_PORT ?? 587) === 465,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  })
}

export const FROM = `"Volcano Arts Center Inc Rwanda" <${process.env.SMTP_USER ?? "info@volcanoartscenterinc.org.rw"}>`

export async function sendMail(to: string, subject: string, html: string, replyTo?: string) {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.warn("[mailer] SMTP not configured — skipping email to", to)
    return
  }
  const t = getTransporter()
  await t.sendMail({ from: FROM, to, subject, html, ...(replyTo ? { replyTo } : {}) })
}
