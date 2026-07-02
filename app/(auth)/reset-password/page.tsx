"use client"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useSearchParams, useRouter } from "next/navigation"
import Link from "next/link"
import { useState } from "react"
import { Loader2, CheckCircle, XCircle } from "lucide-react"
import { resetPasswordAction } from "@/actions/auth"

const schema = z
  .object({
    password: z.string().min(8, "Minimum 8 characters"),
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  })
type FormData = z.infer<typeof schema>

export default function ResetPasswordPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const token = searchParams.get("token") ?? ""
  const [done, setDone] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  if (!token) {
    return (
      <div style={{ textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: "var(--space-4)" }}>
        <XCircle size={48} style={{ color: "var(--color-error)" }} />
        <h1 style={{ fontFamily: "var(--font-display)", fontSize: "var(--text-title)", fontWeight: 600 }}>Invalid Link</h1>
        <p style={{ color: "var(--text-secondary)", fontSize: "var(--text-small)" }}>This reset link is missing or invalid.</p>
        <Link href="/forgot-password" className="btn btn--primary">Request a new link</Link>
      </div>
    )
  }

  if (done) {
    return (
      <div style={{ textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: "var(--space-4)" }}>
        <CheckCircle size={48} style={{ color: "var(--color-success)" }} />
        <h1 style={{ fontFamily: "var(--font-display)", fontSize: "var(--text-title)", fontWeight: 600 }}>Password updated</h1>
        <p style={{ color: "var(--text-secondary)", fontSize: "var(--text-small)" }}>You can now sign in with your new password.</p>
        <Link href="/login" className="btn btn--primary">Sign In</Link>
      </div>
    )
  }

  async function onSubmit(data: FormData) {
    setServerError(null)
    const result = await resetPasswordAction(token, data.password)
    if (result.error) {
      setServerError(result.error)
    } else {
      setDone(true)
    }
  }

  return (
    <>
      <h1 style={{ fontFamily: "var(--font-display)", fontSize: "var(--text-title)", fontWeight: 600, marginBottom: "var(--space-2)", color: "var(--text-primary)" }}>
        Set new password
      </h1>
      <p style={{ color: "var(--text-secondary)", fontSize: "var(--text-small)", marginBottom: "var(--space-6)" }}>
        Choose a strong password for your account.
      </p>

      {serverError && (
        <div role="alert" style={{ padding: "var(--space-3) var(--space-4)", background: "var(--color-error-bg)", color: "var(--color-error)", borderRadius: "var(--radius-md)", fontSize: "var(--text-small)", marginBottom: "var(--space-4)" }}>
          {serverError}{" "}
          {serverError.includes("expired") && <Link href="/forgot-password" style={{ color: "inherit", fontWeight: 600 }}>Request a new link →</Link>}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} noValidate style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
        <div className={`field${errors.password ? " is-invalid" : ""}`}>
          <label className="field__label" htmlFor="password">New Password</label>
          <input id="password" type="password" className="input" autoComplete="new-password" {...register("password")} />
          {errors.password && <span className="field__error">{errors.password.message}</span>}
        </div>

        <div className={`field${errors.confirmPassword ? " is-invalid" : ""}`}>
          <label className="field__label" htmlFor="confirmPassword">Confirm Password</label>
          <input id="confirmPassword" type="password" className="input" autoComplete="new-password" {...register("confirmPassword")} />
          {errors.confirmPassword && <span className="field__error">{errors.confirmPassword.message}</span>}
        </div>

        <button type="submit" className="btn btn--primary" style={{ width: "100%", justifyContent: "center" }} disabled={isSubmitting}>
          {isSubmitting ? <><Loader2 size={16} style={{ marginRight: 8 }} className="animate-spin" />Updating…</> : "Update Password"}
        </button>
      </form>
    </>
  )
}
