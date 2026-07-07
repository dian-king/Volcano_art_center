"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { createDonationAction } from "@/actions/donations"

const schema = z.object({
  campaignId: z.string().min(1, "Please select a campaign"),
  amount: z.number().min(1, "Please enter a donation amount"),
  donorName: z.string().min(2, "Name is required"),
  donorEmail: z.string().email("Valid email required"),
  message: z.string().optional(),
})

type FormData = z.infer<typeof schema>
interface Campaign { id: string; name: string; currency: string }

export function DonationForm({ campaigns }: { campaigns: Campaign[] }) {
  const [reference, setReference] = useState<string | null>(null)
  const [serverError, setServerError] = useState<string | null>(null)
  const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { campaignId: campaigns[0]?.id ?? "" },
  })
  const selectedCampaignId = watch("campaignId")
  const currency = campaigns.find(c => c.id === selectedCampaignId)?.currency ?? "USD"

  async function onSubmit(data: FormData) {
    setServerError(null)
    const result = await createDonationAction(data)
    if (result?.reference) setReference(result.reference)
    else setServerError(result?.error ?? "Something went wrong. Please try again.")
  }

  const err = (msg?: string) => msg
    ? <p style={{ fontSize: "var(--text-caption)", color: "var(--color-error)", marginTop: "var(--space-1)", fontFamily: "var(--font-ui)" }}>{msg}</p>
    : null

  if (reference) {
    return (
      <div style={{ background: "var(--color-success-bg)", border: "1px solid var(--color-success)", borderRadius: "var(--radius-lg)", padding: "var(--space-6)", display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
        <h3 style={{ fontFamily: "var(--font-ui)", fontWeight: 700, color: "var(--color-success)" }}>Thank you for your donation!</h3>
        <p style={{ fontSize: "var(--text-small)", color: "var(--text-secondary)" }}>Please transfer to one of the following:</p>
        <ul style={{ fontSize: "var(--text-small)", color: "var(--text-secondary)", display: "flex", flexDirection: "column", gap: "var(--space-1)", paddingLeft: "var(--space-4)", listStyle: "disc" }}>
          <li><strong>MTN MoMo:</strong> +250 788 945 163</li>
          <li><strong>Bank:</strong> Bank of Kigali</li>
        </ul>
        <p style={{ fontSize: "var(--text-small)", color: "var(--text-secondary)" }}>
          Reference: <code style={{ fontFamily: "var(--font-mono)", background: "var(--green-tint)", padding: "2px 8px", borderRadius: "var(--radius-sm)" }}>{reference}</code>
        </p>
        <p style={{ fontSize: "var(--text-caption)", color: "var(--text-muted)" }}>Our team will confirm your donation within 24 hours.</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate style={{ display: "flex", flexDirection: "column", gap: "var(--space-5)" }}>
      <div className="field">
        <label className="field__label" htmlFor="campaign">Campaign</label>
        <select id="campaign" className="select" {...register("campaignId")}>
          {campaigns.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        {err(errors.campaignId?.message)}
      </div>

      <div className="field">
        <label className="field__label" htmlFor="amount">Amount ({currency})</label>
        <input id="amount" type="number" className="input" placeholder={currency === "USD" ? "e.g. 50" : "e.g. 5000"} {...register("amount", { valueAsNumber: true })} />
        {err(errors.amount?.message)}
      </div>

      <div className="field">
        <label className="field__label" htmlFor="donorName">Your Name</label>
        <input id="donorName" type="text" className="input" {...register("donorName")} />
        {err(errors.donorName?.message)}
      </div>

      <div className="field">
        <label className="field__label" htmlFor="donorEmail">Email</label>
        <input id="donorEmail" type="email" className="input" {...register("donorEmail")} />
        {err(errors.donorEmail?.message)}
      </div>

      <div className="field">
        <label className="field__label" htmlFor="message">Message (optional)</label>
        <textarea id="message" className="textarea" rows={3} {...register("message")} />
      </div>

      {serverError && (
        <p role="alert" style={{ fontSize: "var(--text-small)", color: "var(--color-error)", fontFamily: "var(--font-ui)" }}>{serverError}</p>
      )}

      <button type="submit" className="btn btn--primary" disabled={isSubmitting}>
        {isSubmitting ? "Processing…" : "Donate Now"}
      </button>
    </form>
  )
}
