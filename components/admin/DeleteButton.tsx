"use client"

interface Props {
  action: (fd: FormData) => Promise<void>
  id: string
  label?: string
  itemName?: string
}

export function DeleteButton({ action, id, label = "Delete", itemName }: Props) {
  const msg = itemName
    ? `Delete "${itemName}" permanently? This cannot be undone.`
    : "Delete this item permanently? This cannot be undone."

  return (
    <form action={action} style={{ display: "inline" }}>
      <input type="hidden" name="id" value={id} />
      <button
        type="submit"
        onClick={(e) => { if (!confirm(msg)) e.preventDefault() }}
        className="btn btn--ghost btn--sm"
        style={{ color: "#e53e3e" }}
      >
        {label}
      </button>
    </form>
  )
}
