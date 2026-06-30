"use client"

import { CalendarDays, Edit3, FileText, Users, X } from "lucide-react"
import { useState } from "react"
import { useFormStatus } from "react-dom"

type ExperienceOption = {
  slug: string
  title: string
}

type RequestDraft = {
  id: string
  requestType: string
  experienceSlug: string
  estimatedSize: number
  estimatedDate: string
  invoiceRequired: boolean
  specialRequests: string
}

function SaveButton() {
  const { pending } = useFormStatus()
  return (
    <button type="submit" className="btn btn--primary" disabled={pending}>
      {pending ? "Saving..." : "Save request"}
    </button>
  )
}

export function OperatorRequestEditor({
  request,
  experiences,
  action,
}: {
  request: RequestDraft
  experiences: ExperienceOption[]
  action: (fd: FormData) => Promise<void>
}) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <button type="button" className="btn btn--ghost btn--sm" onClick={() => setOpen(true)}>
        <Edit3 size={14} />
        Edit
      </button>
      {open && (
        <div className="operator-edit-modal" role="presentation">
          <button type="button" className="operator-edit-modal__scrim" aria-label="Close edit request" onClick={() => setOpen(false)} />
          <section className="operator-edit-modal__dialog" role="dialog" aria-modal="true" aria-labelledby={`request-edit-${request.id}`}>
            <header className="operator-edit-modal__header">
              <div>
                <span className="eyebrow">Edit request</span>
                <h2 id={`request-edit-${request.id}`}>Update company request</h2>
                <p>Adjust the itinerary details while the operations team is still reviewing it.</p>
              </div>
              <button type="button" className="operator-edit-modal__close" aria-label="Close" onClick={() => setOpen(false)}>
                <X size={18} />
              </button>
            </header>

            <form action={action} className="operator-edit-form">
              <label className="operator-edit-field">
                <span><FileText size={15} /> Request type</span>
                <select name="requestType" defaultValue={request.requestType}>
                  <option value="GROUP_BOOKING">Group booking</option>
                  <option value="CUSTOM_PACKAGE">Custom package</option>
                </select>
              </label>

              <label className="operator-edit-field operator-edit-field--wide">
                <span><CalendarDays size={15} /> Experience</span>
                <select name="experienceSlug" defaultValue={request.experienceSlug}>
                  <option value="">Custom / unsure</option>
                  {experiences.map(exp => <option key={exp.slug} value={exp.slug}>{exp.title}</option>)}
                </select>
              </label>

              <label className="operator-edit-field">
                <span><Users size={15} /> Estimated guests</span>
                <input name="estimatedSize" type="number" min={1} defaultValue={request.estimatedSize} required />
              </label>

              <label className="operator-edit-field">
                <span><CalendarDays size={15} /> Estimated date</span>
                <input name="estimatedDate" type="date" defaultValue={request.estimatedDate} />
              </label>

              <label className="operator-edit-field operator-edit-field--wide">
                <span><FileText size={15} /> Notes and special requests</span>
                <textarea name="specialRequests" rows={5} defaultValue={request.specialRequests} placeholder="Tell the operations team what changed..." />
              </label>

              <label className="operator-edit-check operator-edit-field--wide">
                <input type="checkbox" name="invoiceRequired" defaultChecked={request.invoiceRequired} />
                <span>Invoice required for this request</span>
              </label>

              <footer className="operator-edit-form__actions">
                <button type="button" className="btn btn--ghost" onClick={() => setOpen(false)}>Cancel</button>
                <SaveButton />
              </footer>
            </form>
          </section>
        </div>
      )}
    </>
  )
}
