"use client"

import { AlertTriangle, Trash2, X } from "lucide-react"
import { useState } from "react"
import { useFormStatus } from "react-dom"

interface Props {
  action: (fd: FormData) => Promise<void>
  id: string
  label?: string
  itemName?: string
}

function DeleteSubmit({ label }: { label: string }) {
  const { pending } = useFormStatus()
  return (
    <button type="submit" className="btn btn--primary btn--sm danger-confirm__submit" disabled={pending}>
      <Trash2 size={15} />
      {pending ? "Deleting..." : label}
    </button>
  )
}

export function DeleteButton({ action, id, label = "Delete", itemName }: Props) {
  const [open, setOpen] = useState(false)
  const title = itemName ? `Delete ${itemName}?` : "Delete this item?"

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="btn btn--ghost btn--sm"
        style={{ color: "var(--color-error)" }}
      >
        <Trash2 size={14} />
        {label}
      </button>
      {open && (
        <div className="danger-confirm" role="presentation">
          <button type="button" className="danger-confirm__scrim" aria-label="Close delete confirmation" onClick={() => setOpen(false)} />
          <section className="danger-confirm__dialog" role="dialog" aria-modal="true" aria-labelledby={`delete-title-${id}`}>
            <button type="button" className="danger-confirm__close" aria-label="Close" onClick={() => setOpen(false)}>
              <X size={18} />
            </button>
            <div className="danger-confirm__icon">
              <AlertTriangle size={24} />
            </div>
            <div>
              <span className="eyebrow">Permanent action</span>
              <h2 id={`delete-title-${id}`}>{title}</h2>
              <p>This cannot be undone. The record will be permanently removed from the dashboard.</p>
            </div>
            <form action={action} className="danger-confirm__actions">
              <input type="hidden" name="id" value={id} />
              <button type="button" className="btn btn--ghost btn--sm" onClick={() => setOpen(false)}>Cancel</button>
              <DeleteSubmit label={label} />
            </form>
          </section>
        </div>
      )}
    </>
  )
}
