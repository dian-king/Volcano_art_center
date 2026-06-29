"use client"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { forgotPasswordAction } from "@/actions/auth"
import Link from "next/link"
import { useState } from "react"
import { Loader2, CheckCircle } from "lucide-react"

const schema = z.object({ email: z.string().email("Valid email required") })
type FormData = z.infer<typeof schema>

export default function ForgotPasswordPage() {
  const [submitted, setSubmitted] = useState(false)
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  async function onSubmit(data: FormData) {
    await forgotPasswordAction(data.email)
    setSubmitted(true)
  }

  if (submitted) {
    return (
      <div style={{ textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: "var(--space-4)" }}>
        <CheckCircle size={48} style={{ color: "var(--color-success)" }} />
        <h1 style={{ fontFamily: "var(--font-display)", fontSize: "var(--text-title)", fontWeight: 600 }}>Check your email</h1>
        <p style={{ color: "var(--text-secondary)", fontSize: "var(--text-small)" }}>
          If an account exists, you&apos;ll receive a reset link shortly.
        </p>
        <Link href="/login" className="btn btn--secondary">Back to Sign In</Link>
      </div>
    )
  }

  return (
    <>
      <h1 style={{ fontFamily: "var(--font-display)", fontSize: "var(--text-title)", fontWeight: 600, marginBottom: "var(--space-2)", color: "var(--text-primary)" }}>
        Reset Password
      </h1>
      <p style={{ color: "var(--text-secondary)", fontSize: "var(--text-small)", marginBottom: "var(--space-6)" }}>
        Enter your email and we&apos;ll send you a reset link.
      </p>

      <form onSubmit={handleSubmit(onSubmit)} noValidate style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
        <div className={`field${errors.email ? " is-invalid" : ""}`}>
          <label className="field__label" htmlFor="email">Email</label>
          <input id="email" type="email" className="input" autoComplete="email" {...register("email")} />
          {errors.email && <span className="field__error">{errors.email.message}</span>}
        </div>

        <button type="submit" className="btn btn--primary" style={{ width: "100%", justifyContent: "center" }} disabled={isSubmitting}>
          {isSubmitting ? <><Loader2 size={16} style={{ marginRight: 8 }} className="animate-spin" />Sending…</> : "Send Reset Link"}
        </button>
      </form>

      <p style={{ marginTop: "var(--space-6)", textAlign: "center", fontSize: "var(--text-small)", color: "var(--text-secondary)" }}>
        <Link href="/login" style={{ color: "var(--green)", fontWeight: 600 }}>← Back to Sign In</Link>
      </p>
    </>
  )
}