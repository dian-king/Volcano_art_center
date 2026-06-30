"use client"
import { useState, useRef } from "react"
import Image from "next/image"
import { updateProfile } from "@/actions/profile"
import { useToastStore } from "@/store/toast-store"
import { COUNTRIES, flagEmoji } from "@/lib/countries"
import { CountrySelect } from "@/components/ui/CountrySelect"
import { DialCodeSelect } from "@/components/ui/DialCodeSelect"

export interface ProfileUser {
  id: string
  firstName: string
  lastName: string
  email: string
  phone: string | null
  country: string | null
  profileImageUrl: string | null
  image: string | null
  name: string | null
  createdAt: Date
  isGoogleUser: boolean
}

function parsePhone(raw: string | null) {
  if (!raw) return { dialCode: "+250", number: "" }
  const m = raw.match(/^(\+\d{1,4})\s?(.*)$/)
  return m ? { dialCode: m[1], number: m[2] } : { dialCode: "+250", number: raw }
}

const inp: React.CSSProperties = {
  height: "44px", padding: "0 var(--space-4)", border: "1px solid var(--border-subtle)",
  borderRadius: "var(--radius-md)", background: "var(--surface-base)",
  color: "var(--text-primary)", fontSize: "var(--text-small)", fontFamily: "var(--font-ui)", width: "100%",
}
const lbl: React.CSSProperties = {
  fontSize: "var(--text-caption)", fontWeight: 700, letterSpacing: "0.06em",
  textTransform: "uppercase", color: "var(--text-muted)", fontFamily: "var(--font-ui)",
  marginBottom: "var(--space-1)", display: "block",
}

export function ProfileForm({ user }: { user: ProfileUser }) {
  const { addToast } = useToastStore()
  const [editing, setEditing] = useState(false)
  const [pending, setPending] = useState(false)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  const { dialCode: initDial, number: initNumber } = parsePhone(user.phone)
  const [dialCode, setDialCode] = useState(initDial)
  const [phoneNumber, setPhoneNumber] = useState(initNumber)
  const [country, setCountry] = useState(user.country ?? "")

  const avatar = avatarPreview || user.profileImageUrl || user.image
  const displayName = `${user.firstName} ${user.lastName}`.trim() || user.name || user.email

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) { addToast("Only JPEG, PNG or WebP", "error"); return }
    if (file.size > 2 * 1024 * 1024) { addToast("Max 2 MB", "error"); return }
    setAvatarPreview(URL.createObjectURL(file))
    setUploading(true)
    const fd = new FormData(); fd.append("file", file)
    const res = await fetch("/api/upload", { method: "POST", body: fd })
    const json = await res.json()
    setUploading(false)
    if (json.error) { addToast(json.error, "error"); setAvatarPreview(null); return }
    setUploadedUrl(json.url)
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setPending(true)
    const fd = new FormData(e.currentTarget)
    fd.set("phone", phoneNumber ? `${dialCode} ${phoneNumber}` : "")
    fd.set("profileImageUrl", uploadedUrl || user.profileImageUrl || "")
    const result = await updateProfile(fd)
    setPending(false)
    if (result?.error) { addToast(result.error, "error"); return }
    addToast("Profile updated", "success")
    setEditing(false); setUploadedUrl(null)
  }

  return (
    <div style={{ background: "var(--surface-raised)", border: "1px solid var(--border-subtle)", borderRadius: "var(--radius-lg)", padding: "var(--space-6)" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "var(--space-6)" }}>
        <h2 style={{ fontFamily: "var(--font-ui)", fontWeight: 700, fontSize: "var(--text-lead)" }}>Profile Details</h2>
        {!editing && <button className="btn btn--ghost btn--sm" onClick={() => setEditing(true)}>Edit Profile</button>}
      </div>

      {!editing ? (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-6) var(--space-7)", borderTop: "1px solid var(--border-subtle)", paddingTop: "var(--space-5)" }}>
          {([
            ["First Name", user.firstName || "—"],
            ["Last Name",  user.lastName  || "—"],
            ["Email",      user.email],
            ["Phone",      user.phone     || "—"],
            ["Country",    user.country ? `${flagEmoji(COUNTRIES.find(c => c.name === user.country)?.code ?? "")} ${user.country}` : "—"],
          ] as [string, string][]).map(([l, v]) => (
            <div key={l}>
              <p style={{ fontSize: "0.68rem", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--text-muted)", fontFamily: "var(--font-ui)", marginBottom: "var(--space-2)" }}>{l}</p>
              <p style={{ fontSize: "var(--text-body)", color: "var(--text-primary)", fontFamily: "var(--font-body)", fontWeight: 500 }}>{v}</p>
            </div>
          ))}
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          {/* Avatar */}
          <div style={{ marginBottom: "var(--space-5)" }}>
            <span style={lbl}>Profile picture</span>
            <div style={{ display: "flex", alignItems: "center", gap: "var(--space-4)" }}>
              <div style={{ width: 64, height: 64, borderRadius: "50%", overflow: "hidden", position: "relative", background: "var(--green-tint)", border: "2px solid var(--border-subtle)", flexShrink: 0 }}>
                {avatar ? <Image src={avatar} alt="Preview" fill unoptimized style={{ objectFit: "cover" }} /> : (
                  <div style={{ width: "100%", height: "100%", display: "grid", placeItems: "center", fontSize: "1.5rem", color: "var(--green)" }}>{displayName.charAt(0).toUpperCase()}</div>
                )}
              </div>
              <div>
                <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" style={{ display: "none" }} onChange={handleFileChange} />
                <button type="button" className="btn btn--ghost btn--sm" onClick={() => fileRef.current?.click()} disabled={uploading}>
                  {uploading ? "Uploading…" : "Choose from device"}
                </button>
                <p style={{ fontSize: "var(--text-caption)", color: "var(--text-muted)", marginTop: "var(--space-1)" }}>JPEG, PNG or WebP · max 2 MB</p>
              </div>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-4)", marginBottom: "var(--space-4)" }}>
            <div><label style={lbl}>First name <span style={{ color: "var(--color-error)" }}>*</span></label><input name="firstName" defaultValue={user.firstName} required style={inp} /></div>
            <div><label style={lbl}>Last name <span style={{ color: "var(--color-error)" }}>*</span></label><input name="lastName" defaultValue={user.lastName} required style={inp} /></div>
          </div>

          <div style={{ marginBottom: "var(--space-4)" }}>
            <label style={lbl}>Email</label>
            <input value={user.email} disabled style={{ ...inp, opacity: 0.5, cursor: "not-allowed" }} />
          </div>

          <div style={{ marginBottom: "var(--space-4)" }}>
            <label style={lbl}>Phone number</label>
            <div style={{ display: "flex", gap: "var(--space-2)" }}>
              <DialCodeSelect value={dialCode} onChange={setDialCode} />
              <input type="tel" value={phoneNumber} onChange={e => setPhoneNumber(e.target.value)} placeholder="788 000 000" style={{ ...inp, flex: 1 }} />
            </div>
          </div>

          <div style={{ marginBottom: "var(--space-6)" }}>
            <label style={lbl}>Country</label>
            <CountrySelect value={country} onChange={setCountry} />
            <input type="hidden" name="country" value={country} />
          </div>

          <div style={{ display: "flex", gap: "var(--space-3)", borderTop: "1px solid var(--border-subtle)", paddingTop: "var(--space-5)" }}>
            <button type="submit" className="btn btn--primary" disabled={pending || uploading}>{pending ? "Saving…" : "Save Changes"}</button>
            <button type="button" className="btn btn--ghost" onClick={() => { setEditing(false); setAvatarPreview(null); setUploadedUrl(null) }}>Cancel</button>
          </div>
        </form>
      )}
    </div>
  )
}
