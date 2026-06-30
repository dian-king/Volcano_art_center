"use client"

export function PrintButton() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      style={{ height: 38, padding: "0 16px", border: "1px solid #00A651", color: "#00A651", background: "#fff", borderRadius: 6, cursor: "pointer" }}
    >
      Print / Save PDF
    </button>
  )
}
