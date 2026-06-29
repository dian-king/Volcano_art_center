"use client"
import { useState } from "react"
import { submitReview } from "@/actions/reviews"
import { CountrySelect } from "@/components/ui/CountrySelect"
import { Star } from "lucide-react"

export function ReviewForm() {
  const [rating, setRating] = useState(0)
  const [hover, setHover] = useState(0)
  const [country, setCountry] = useState("")
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle")
  const [errorMsg, setErrorMsg] = useState("")

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (rating === 0) { setErrorMsg("Please select a star rating"); return }
    setStatus("loading")
    setErrorMsg("")

    const form = e.currentTarget
    const data = new FormData(form)
    data.set("rating", String(rating))
    data.set("reviewerCountry", country)

    const result = await submitReview(data)
    if (result.success) {
      setStatus("success")
      form.reset()
      setRating(0)
      setCountry("")
    } else {
      setStatus("error")
      setErrorMsg(result.error ?? "Something went wrong, please try again.")
    }
  }

  if (status === "success") {
    return (
      <div style={{ textAlign: "center", padding: "var(--space-8) var(--space-5)" }}>
        <div style={{ fontSize: "2.5rem", marginBottom: "var(--space-3)" }}>🙏</div>
        <h3 style={{ fontFamily: "var(--font-display)", fontSize: "var(--text-title)", marginBottom: "var(--space-2)" }}>
          Thank you for sharing!
        </h3>
        <p style={{ color: "var(--text-secondary)", maxWidth: 400, margin: "0 auto" }}>
          Your review has been received and will appear on the site once approved by our team.
        </p>
        <button
          onClick={() => setStatus("idle")}
          className="btn btn--ghost btn--sm"
          style={{ marginTop: "var(--space-5)" }}
        >
          Submit another review
        </button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)", maxWidth: 520, margin: "0 auto" }}>

      {/* Star rating picker */}
      <div>
        <label style={{ display: "block", fontFamily: "var(--font-ui)", fontWeight: 600, fontSize: "var(--text-small)", marginBottom: "var(--space-2)" }}>
          Your Rating *
        </label>
        <div style={{ display: "flex", gap: 4 }}>
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              onMouseEnter={() => setHover(star)}
              onMouseLeave={() => setHover(0)}
              aria-label={`Rate ${star} star${star > 1 ? "s" : ""}`}
              style={{ background: "none", border: "none", cursor: "pointer", padding: 2 }}
            >
              <Star
                size={28}
                fill={(hover || rating) >= star ? "#F59E0B" : "none"}
                color={(hover || rating) >= star ? "#F59E0B" : "var(--border-default)"}
              />
            </button>
          ))}
        </div>
      </div>

      {/* Name + Country */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-3)" }}>
        <div>
          <label htmlFor="rv-name" style={{ display: "block", fontFamily: "var(--font-ui)", fontWeight: 600, fontSize: "var(--text-small)", marginBottom: "var(--space-1)" }}>
            Your Name *
          </label>
          <input
            id="rv-name"
            name="reviewerName"
            required
            placeholder="e.g. Sophie Laurent"
            style={{ width: "100%", padding: "10px var(--space-4)", border: "1px solid var(--border-default)", borderRadius: "var(--radius-md)", fontFamily: "var(--font-body)", fontSize: "var(--text-small)", background: "var(--surface-raised)", color: "var(--text-primary)", boxSizing: "border-box" }}
          />
        </div>
        <div>
          <label style={{ display: "block", fontFamily: "var(--font-ui)", fontWeight: 600, fontSize: "var(--text-small)", marginBottom: "var(--space-1)" }}>
            Country
          </label>
          <CountrySelect
            value={country}
            onChange={setCountry}
            placeholder="— Select country —"
          />
        </div>
      </div>

      {/* Comment */}
      <div>
        <label htmlFor="rv-comment" style={{ display: "block", fontFamily: "var(--font-ui)", fontWeight: 600, fontSize: "var(--text-small)", marginBottom: "var(--space-1)" }}>
          Your Experience *
        </label>
        <textarea
          id="rv-comment"
          name="comment"
          required
          rows={4}
          placeholder="Tell us about your experience with Volcano Arts Center..."
          style={{ width: "100%", padding: "10px var(--space-4)", border: "1px solid var(--border-default)", borderRadius: "var(--radius-md)", fontFamily: "var(--font-body)", fontSize: "var(--text-small)", background: "var(--surface-raised)", color: "var(--text-primary)", resize: "vertical", boxSizing: "border-box" }}
        />
      </div>

      {errorMsg && (
        <p style={{ color: "var(--color-error)", fontSize: "var(--text-small)", fontFamily: "var(--font-ui)" }}>
          {errorMsg}
        </p>
      )}

      <button
        type="submit"
        disabled={status === "loading"}
        className="btn btn--primary"
        style={{ alignSelf: "flex-start" }}
      >
        {status === "loading" ? "Submitting…" : "Submit Review"}
      </button>

      <p style={{ fontSize: "var(--text-caption)", color: "var(--text-muted)", fontFamily: "var(--font-ui)" }}>
        Reviews are moderated and typically approved within 24 hours.
      </p>
    </form>
  )
}
