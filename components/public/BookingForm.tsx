"use client"

import { useState } from "react"
import { createBookingAction } from "@/actions/bookings"

interface Slot {
  id: string
  date: string
  label: string
  status: string
  remaining: number
}

interface BookingFormProps {
  experienceId: string
  minGroupSize: number
  maxGroupSize: number
  languages: string[]
  slots: Slot[]
  defaults: {
    guestName: string
    guestEmail: string
    guestPhone?: string | null
  }
}

const inputStyle: React.CSSProperties = {
  height: "42px",
  padding: "0 var(--space-3)",
  border: "1px solid var(--border-subtle)",
  borderRadius: "var(--radius-md)",
  background: "var(--surface-base)",
  color: "var(--text-primary)",
  fontSize: "var(--text-small)",
  fontFamily: "var(--font-ui)",
  width: "100%",
}

const labelStyle: React.CSSProperties = {
  display: "block",
  fontFamily: "var(--font-ui)",
  fontSize: "var(--text-caption)",
  fontWeight: 700,
  color: "var(--text-muted)",
  marginBottom: "var(--space-1)",
  textTransform: "uppercase",
  letterSpacing: "0.06em",
}

export function BookingForm({ experienceId, minGroupSize, maxGroupSize, languages, slots, defaults }: BookingFormProps) {
  const firstAvailable = slots.find(s => s.remaining > 0 && ["AVAILABLE", "LIMITED", "REQUEST_ONLY"].includes(s.status))
  const [slotId, setSlotId] = useState(firstAvailable?.id ?? "")
  const selectedSlot = slots.find(s => s.id === slotId)
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function submit(fd: FormData) {
    setPending(true)
    setError(null)
    if (selectedSlot) {
      fd.set("preferredDate", selectedSlot.date)
      fd.set("slotId", selectedSlot.id)
    }
    const result = await createBookingAction(fd)
    setPending(false)
    if (result?.error) setError(result.error)
  }

  return (
    <form action={submit} style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
      <input type="hidden" name="experienceId" value={experienceId} />

      {slots.length > 0 && (
        <div>
          <label style={labelStyle}>Available date</label>
          <select value={slotId} onChange={(e) => setSlotId(e.target.value)} style={inputStyle}>
            <option value="">Choose a date</option>
            {slots.map(slot => (
              <option key={slot.id} value={slot.id} disabled={slot.remaining <= 0 || !["AVAILABLE", "LIMITED", "REQUEST_ONLY"].includes(slot.status)}>
                {slot.label} · {slot.status.replace("_", " ")} · {slot.remaining} spots
              </option>
            ))}
          </select>
        </div>
      )}

      <div>
        <label style={labelStyle}>{slots.length > 0 ? "Manual date / request" : "Preferred date"} *</label>
        <input name="preferredDate" type="date" required={!selectedSlot} disabled={Boolean(selectedSlot)} style={inputStyle} />
      </div>

      <div>
        <label style={labelStyle}>Alternate date</label>
        <input name="alternateDate" type="date" style={inputStyle} />
      </div>

      <div>
        <label style={labelStyle}>Group size *</label>
        <input name="groupSize" type="number" min={minGroupSize} max={maxGroupSize} defaultValue={minGroupSize} required style={inputStyle} />
      </div>

      <div>
        <label style={labelStyle}>Guest name *</label>
        <input name="guestName" defaultValue={defaults.guestName} required style={inputStyle} />
      </div>

      <div>
        <label style={labelStyle}>Email *</label>
        <input name="guestEmail" type="email" defaultValue={defaults.guestEmail} required style={inputStyle} />
      </div>

      <div>
        <label style={labelStyle}>Phone</label>
        <input name="guestPhone" type="tel" defaultValue={defaults.guestPhone ?? ""} style={inputStyle} />
      </div>

      {languages.length > 0 && (
        <div>
          <label style={labelStyle}>Preferred language</label>
          <select name="language" style={inputStyle}>
            <option value="">No preference</option>
            {languages.map(language => <option key={language}>{language}</option>)}
          </select>
        </div>
      )}

      <div>
        <label style={labelStyle}>Special requests</label>
        <textarea name="specialRequests" rows={3} style={{ ...inputStyle, height: "auto", padding: "var(--space-3)", resize: "vertical" }} />
      </div>

      {error && (
        <p role="alert" style={{ color: "var(--color-error)", fontSize: "var(--text-small)", fontFamily: "var(--font-ui)" }}>{error}</p>
      )}

      <button type="submit" className="btn btn--primary" disabled={pending} style={{ width: "100%", justifyContent: "center" }}>
        {pending ? "Submitting..." : "Submit Booking Request"}
      </button>
    </form>
  )
}
