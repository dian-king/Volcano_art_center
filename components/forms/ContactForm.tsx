"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { submitContactAction } from "@/actions/contact"

const schema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Valid email required"),
  phone: z.string().optional(),
  subject: z.string().min(1, "Please select a subject"),
  message: z.string().min(10, "Message must be at least 10 characters"),
})

type FormData = z.infer<typeof schema>

const SUBJECTS = [
  "General Inquiry",
  "Art Purchase",
  "Experience Booking",
  "Commission a Piece",
  "Press & Media",
  "Partnership",
  "Other",
]

export function ContactForm() {
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle")
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  async function onSubmit(data: FormData) {
    const result = await submitContactAction(data)
    if (result?.success) { setStatus("success"); reset() }
    else setStatus("error")
  }

  if (status === "success") return (
    <div style={{ background: "var(--color-success-bg)", border: "1px solid var(--color-success)", borderRadius: "var(--radius-lg)", padding: "var(--space-7)", textAlign: "center", display: "flex", flexDirection: "column", gap: "var(--space-3)", alignItems: "center" }}>
      <span style={{ fontSize: "2.5rem" }}>✉️</span>
      <h3 style={{ fontFamily: "var(--font-ui)", fontWeight: 700, color: "var(--color-success)" }}>Message sent!</h3>
      <p style={{ color: "var(--text-secondary)", fontSize: "var(--text-small)" }}>We'll get back to you within 24 hours.</p>
      <button className="btn btn--ghost btn--sm" onClick={() => setStatus("idle")}>Send another</button>
    </div>
  )

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
      {status === "error" && (
        <div role="alert" style={{ padding: "var(--space-3) var(--space-4)", background: "var(--color-error-bg)", color: "var(--color-error)", borderRadius: "var(--radius-md)", fontSize: "var(--text-small)" }}>
          Something went wrong. Please try again or email us directly.
        </div>
      )}

      <div className="form-row">
        <div className={`field${errors.name ? " is-invalid" : ""}`}>
          <label className="field__label" htmlFor="name">Name *</label>
          <input id="name" type="text" className="input" {...register("name")} />
          {errors.name && <span className="field__error">{errors.name.message}</span>}
        </div>
        <div className={`field${errors.email ? " is-invalid" : ""}`}>
          <label className="field__label" htmlFor="email">Email *</label>
          <input id="email" type="email" className="input" {...register("email")} />
          {errors.email && <span className="field__error">{errors.email.message}</span>}
        </div>
      </div>

      <div className="form-row">
        <div className="field">
          <label className="field__label" htmlFor="phone">Phone (optional)</label>
          <input id="phone" type="tel" className="input" {...register("phone")} />
        </div>
        <div className={`field${errors.subject ? " is-invalid" : ""}`}>
          <label className="field__label" htmlFor="subject">Subject *</label>
          <select id="subject" className="select" {...register("subject")}>
            <option value="">Select a subject</option>
            {SUBJECTS.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          {errors.subject && <span className="field__error">{errors.subject.message}</span>}
        </div>
      </div>

      <div className={`field${errors.message ? " is-invalid" : ""}`}>
        <label className="field__label" htmlFor="message">Message *</label>
        <textarea id="message" className="textarea" rows={6} {...register("message")} />
        {errors.message && <span className="field__error">{errors.message.message}</span>}
      </div>

      <button type="submit" className="btn btn--primary" style={{ alignSelf: "flex-start", paddingInline: "var(--space-7)" }} disabled={isSubmitting}>
        {isSubmitting ? "Sending…" : "Send Message"}
      </button>
    </form>
  )
}
