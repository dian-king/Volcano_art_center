import { redirect } from "next/navigation"
import { AdminPageHeader } from "@/components/admin/AdminPageChrome"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"

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
  await db.platformSetting.delete({ where: { id: fd.get("id") as string } })
  const { redirect } = await import("next/navigation")
  redirect("/admin/settings")
}

const input: React.CSSProperties = {
  height: 40,
  padding: "0 var(--space-3)",
  border: "1px solid var(--border-subtle)",
  borderRadius: "var(--radius-md)",
  background: "var(--surface-base)",
  color: "var(--text-primary)",
  fontSize: "var(--text-small)",
  fontFamily: "var(--font-ui)",
  width: "100%",
}

const DEFAULT_SETTINGS = [
  { category: "payments", key: "mtn_momo_number", value: "+250 788 945 163" },
  { category: "payments", key: "airtel_money_number", value: "+250 733 000 000" },
  { category: "payments", key: "bank_name", value: "Bank of Kigali" },
  { category: "payments", key: "bank_account", value: "" },
  { category: "contact", key: "phone", value: "+250 788 945 163" },
  { category: "contact", key: "email", value: "hello@volcanoartsandhospes.com" },
  { category: "contact", key: "whatsapp", value: "+250788945163" },
  { category: "shipping", key: "fedex_account", value: "" },
]

export default async function SettingsPage() {
  const session = await auth()
  if (session?.user?.role !== "SUPER_ADMIN") redirect("/admin")

  let settings = await db.platformSetting.findMany({ orderBy: [{ category: "asc" }, { key: "asc" }] })
  if (settings.length === 0) {
    await Promise.all(DEFAULT_SETTINGS.map(s => db.platformSetting.upsert({ where: { category_key: { category: s.category, key: s.key } }, update: {}, create: s })))
    settings = await db.platformSetting.findMany({ orderBy: [{ category: "asc" }, { key: "asc" }] })
  }

  const grouped = settings.reduce((acc, setting) => {
    if (!acc[setting.category]) acc[setting.category] = []
    acc[setting.category].push(setting)
    return acc
  }, {} as Record<string, typeof settings>)

  return (
    <div>
      <AdminPageHeader eyebrow="Administration" title="Platform Settings" description="Manage payment, contact, shipping, and operational configuration values." />

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))", gap: "var(--space-5)", alignItems: "start" }}>
        {Object.entries(grouped).map(([category, items]) => (
          <section key={category} className="admin-card">
            <div className="admin-card__header">
              <h3>{category.replaceAll("_", " ")}</h3>
              <p>{items.length} setting{items.length === 1 ? "" : "s"}</p>
            </div>
            <div className="admin-card__body" style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
              {items.map(setting => (
                <div key={setting.id} style={{ border: "1px solid var(--border-subtle)", borderRadius: "var(--radius-md)", padding: "var(--space-3)", background: "var(--surface)" }}>
                  <p style={{ fontFamily: "var(--font-mono)", fontSize: "var(--text-caption)", color: "var(--text-muted)", marginBottom: "var(--space-2)" }}>{setting.key}</p>
                  <form action={saveSetting} style={{ display: "grid", gridTemplateColumns: "1fr auto auto", gap: "var(--space-2)" }}>
                    <input type="hidden" name="category" value={setting.category} />
                    <input type="hidden" name="key" value={setting.key} />
                    <input name="value" defaultValue={setting.masked ? "••••••••" : setting.value} type={setting.masked ? "password" : "text"} style={input} />
                    <button type="submit" className="btn btn--primary btn--sm">Save</button>
                    <button formAction={deleteSetting} name="id" value={setting.id} className="btn btn--ghost btn--sm" style={{ color: "var(--color-error)" }}>Delete</button>
                  </form>
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>

      <section className="admin-card" style={{ marginTop: "var(--space-6)" }}>
        <div className="admin-card__header"><h3>Add Setting</h3><p>Create a new configuration key under an existing or new category.</p></div>
        <div className="admin-card__body">
          <form action={saveSetting} style={{ display: "grid", gridTemplateColumns: "1fr 1fr 2fr auto", gap: "var(--space-3)", alignItems: "end" }}>
            <div><label style={{ fontSize: "var(--text-caption)", color: "var(--text-muted)" }}>Category</label><input name="category" required style={input} placeholder="payments" /></div>
            <div><label style={{ fontSize: "var(--text-caption)", color: "var(--text-muted)" }}>Key</label><input name="key" required style={input} placeholder="mtn_momo_number" /></div>
            <div><label style={{ fontSize: "var(--text-caption)", color: "var(--text-muted)" }}>Value</label><input name="value" style={input} /></div>
            <button type="submit" className="btn btn--primary btn--sm">Add</button>
          </form>
        </div>
      </section>
    </div>
  )
}
