import { db } from "@/lib/db"
import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { TH, TD } from "@/components/admin/AdminForm"

export const dynamic = "force-dynamic"

async function saveSetting(fd: FormData) {
  "use server"
  const { auth } = await import("@/lib/auth")
  const { db } = await import("@/lib/db")
  const session = await auth()
  if (session?.user?.role !== "SUPER_ADMIN") throw new Error("Unauthorized")
  const category = fd.get("category") as string
  const key = fd.get("key") as string
  const value = fd.get("value") as string
  await db.platformSetting.upsert({
    where: { category_key: { category, key } },
    update: { value },
    create: { category, key, value },
  })
  const { redirect } = await import("next/navigation")
  redirect("/admin/settings")
}

async function deleteSetting(fd: FormData) {
  "use server"
  const { auth } = await import("@/lib/auth")
  const { db } = await import("@/lib/db")
  const session = await auth()
  if (session?.user?.role !== "SUPER_ADMIN") throw new Error("Unauthorized")
  const id = fd.get("id") as string
  await db.platformSetting.delete({ where: { id } })
  const { redirect } = await import("next/navigation")
  redirect("/admin/settings")
}

const inp: React.CSSProperties = { height: "36px", padding: "0 var(--space-3)", border: "1px solid var(--border-subtle)", borderRadius: "var(--radius-md)", background: "var(--surface-base)", color: "var(--text-primary)", fontSize: "var(--text-small)", fontFamily: "var(--font-ui)", width: "100%" }

const DEFAULT_SETTINGS = [
  { category: "payments", key: "mtn_momo_number", value: "+250 788 000 000" },
  { category: "payments", key: "airtel_money_number", value: "+250 733 000 000" },
  { category: "payments", key: "bank_name", value: "Bank of Kigali" },
  { category: "payments", key: "bank_account", value: "" },
  { category: "contact", key: "phone", value: "+250 780 000 000" },
  { category: "contact", key: "email", value: "hello@volcanoartsandhospes.com" },
  { category: "contact", key: "whatsapp", value: "+250780000000" },
  { category: "shipping", key: "fedex_account", value: "" },
]

export default async function SettingsPage() {
  const session = await auth()
  if (session?.user?.role !== "SUPER_ADMIN") redirect("/admin")

  const settings = await db.platformSetting.findMany({ orderBy: [{ category: "asc" }, { key: "asc" }] })

  // Seed defaults if empty
  if (settings.length === 0) {
    await Promise.all(DEFAULT_SETTINGS.map(s =>
      db.platformSetting.upsert({ where: { category_key: { category: s.category, key: s.key } }, update: {}, create: s })
    ))
  }

  const grouped = settings.reduce((acc, s) => {
    if (!acc[s.category]) acc[s.category] = []
    acc[s.category].push(s)
    return acc
  }, {} as Record<string, typeof settings>)

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "var(--space-6)" }}>
        <h1 style={{ fontFamily: "var(--font-display)", fontSize: "var(--text-headline)", fontWeight: 600 }}>Platform Settings</h1>
      </div>

      {Object.entries(grouped).map(([category, items]) => (
        <div key={category} style={{ marginBottom: "var(--space-7)" }}>
          <h2 style={{ fontFamily: "var(--font-ui)", fontWeight: 700, fontSize: "var(--text-small)", letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--text-muted)", marginBottom: "var(--space-4)" }}>
            {category}
          </h2>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                {["Key", "Value", "Actions"].map(h => <th key={h} style={TH}>{h}</th>)}
              </tr>
            </thead>
            <tbody>
              {items.map(s => (
                <tr key={s.id}>
                  <td style={{ ...TD, fontFamily: "var(--font-mono)", color: "var(--text-primary)", width: "220px" }}>{s.key}</td>
                  <td style={TD}>
                    <form action={saveSetting} style={{ display: "flex", gap: "var(--space-2)" }}>
                      <input type="hidden" name="category" value={s.category} />
                      <input type="hidden" name="key" value={s.key} />
                      <input
                        name="value"
                        defaultValue={s.masked ? "••••••••" : s.value}
                        type={s.masked ? "password" : "text"}
                        style={{ ...inp, flex: 1 }}
                      />
                      <button type="submit" className="btn btn--primary btn--sm">Save</button>
                    </form>
                  </td>
                  <td style={TD}>
                    <form action={deleteSetting}>
                      <input type="hidden" name="id" value={s.id} />
                      <button type="submit" className="btn btn--ghost btn--sm" style={{ color: "var(--color-error)" }}>Delete</button>
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}

      {/* Add new setting */}
      <div style={{ background: "var(--surface-raised)", border: "1px solid var(--border-subtle)", borderRadius: "var(--radius-lg)", padding: "var(--space-5)" }}>
        <h3 style={{ fontFamily: "var(--font-ui)", fontWeight: 700, marginBottom: "var(--space-4)" }}>Add Setting</h3>
        <form action={saveSetting} style={{ display: "grid", gridTemplateColumns: "1fr 1fr 2fr auto", gap: "var(--space-3)", alignItems: "end" }}>
          <div>
            <label style={{ fontSize: "var(--text-caption)", display: "block", marginBottom: 4, color: "var(--text-muted)", fontFamily: "var(--font-ui)" }}>Category</label>
            <input name="category" required style={inp} placeholder="payments" />
          </div>
          <div>
            <label style={{ fontSize: "var(--text-caption)", display: "block", marginBottom: 4, color: "var(--text-muted)", fontFamily: "var(--font-ui)" }}>Key</label>
            <input name="key" required style={inp} placeholder="mtn_momo_number" />
          </div>
          <div>
            <label style={{ fontSize: "var(--text-caption)", display: "block", marginBottom: 4, color: "var(--text-muted)", fontFamily: "var(--font-ui)" }}>Value</label>
            <input name="value" style={inp} />
          </div>
          <button type="submit" className="btn btn--primary btn--sm">Add</button>
        </form>
      </div>
    </div>
  )
}
