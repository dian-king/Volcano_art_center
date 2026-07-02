"use client"
import { useState } from "react"
import { sendNewsletterBlast } from "@/actions/newsletter"

export function NewsletterComposer({ subscriberCount }: { subscriberCount: number }) {
  const [subject, setSubject] = useState("")
  const [message, setMessage] = useState("")
  const [pending, setPending] = useState(false)
  const [result, setResult] = useState<{ ok: boolean; text: string } | null>(null)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!confirm(`Send this email to all ${subscriberCount} subscriber${subscriberCount === 1 ? "" : "s"}? This cannot be undone.`)) return
    setPending(true)
    setResult(null)
    const res = await sendNewsletterBlast(subject, message)
    setPending(false)
    if (res.error) {
      setResult({ ok: false, text: res.error })
    } else {
      setResult({ ok: true, text: `Sent to ${res.sent} of ${res.total} subscribers.` })
      setSubject("")
      setMessage("")
    }
  }

  return (
    <form onSubmit={onSubmit} style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
      <div className="field">
        <label className="field__label" htmlFor="nl-subject">Subject</label>
        <input
          id="nl-subject"
          className="input"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          placeholder="e.g. New arrivals from our Talent Programme"
          maxLength={150}
          required
        />
      </div>
      <div className="field">
        <label className="field__label" htmlFor="nl-message">Message</label>
        <textarea
          id="nl-message"
          className="textarea"
          rows={8}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Write your update here…"
          required
        />
      </div>

      {result && (
        <p style={{ fontSize: "var(--text-small)", color: result.ok ? "var(--green)" : "var(--color-error)" }}>{result.text}</p>
      )}

      <button type="submit" className="btn btn--primary" disabled={pending || subscriberCount === 0} style={{ alignSelf: "flex-start" }}>
        {pending ? "Sending…" : `Send to ${subscriberCount} Subscriber${subscriberCount === 1 ? "" : "s"}`}
      </button>
    </form>
  )
}
