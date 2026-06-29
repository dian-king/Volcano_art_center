"use client"
import { useState } from "react"
import { subscribeNewsletter } from "@/actions/newsletter"

export function NewsletterForm() {
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle")
  const [msg, setMsg] = useState("")

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setStatus("loading")
    const fd = new FormData(e.currentTarget)
    const result = await subscribeNewsletter(fd)
    if (result?.error) {
      setMsg(result.error)
      setStatus("error")
    } else {
      setStatus("done")
    }
  }

  if (status === "done") return (
    <div style={{ padding: "var(--space-4)", background: "rgba(0,166,81,0.15)", border: "1px solid rgba(0,166,81,0.4)", borderRadius: "var(--radius-md)" }}>
      <p style={{ color: "#fff", fontSize: "var(--text-small)", fontWeight: 600 }}>✓ You're in! Check your inbox for a welcome email.</p>
      <p style={{ color: "rgba(255,255,255,0.65)", fontSize: "var(--text-caption)", marginTop: "var(--space-1)" }}>Stories, new arrivals &amp; conservation updates. No spam.</p>
    </div>
  )

  return (
    <form className="site-footer__news" onSubmit={handleSubmit} noValidate>
      <label htmlFor="footer-news-email">Join our journal</label>
      <div className="site-footer__news-row">
        <input
          type="email"
          id="footer-news-email"
          name="email"
          placeholder="Your email address"
          autoComplete="email"
          required
          maxLength={120}
          disabled={status === "loading"}
        />
        <button type="submit" disabled={status === "loading"}>
          {status === "loading" ? "Subscribing…" : "Subscribe"}
          {status !== "loading" && (
            <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path d="M5 12h14M13 5l7 7-7 7"/>
            </svg>
          )}
        </button>
      </div>
      {status === "error" && <span style={{ color: "#f87171", fontSize: "var(--text-caption)" }}>{msg}</span>}
      {status === "idle" && <span className="site-footer__news-hint">Stories, new arrivals &amp; conservation updates. No spam.</span>}
    </form>
  )
}
