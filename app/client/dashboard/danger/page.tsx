import { DeleteAccountSection } from "@/app/client/dashboard/DeleteAccountSection"
import { card } from "../_styles"

export const dynamic = "force-dynamic"

export default function ClientDangerPage() {
  return (
    <section style={card}>
      <h1 style={{ fontFamily: "var(--font-ui)", fontWeight: 700, fontSize: "var(--text-lead)", marginBottom: "var(--space-6)", color: "#e53e3e" }}>Danger Zone</h1>
      <DeleteAccountSection />
    </section>
  )
}
