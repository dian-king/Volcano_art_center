"use client"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { signIn } from "next-auth/react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { useState } from "react"
import { Loader2 } from "lucide-react"
import type { Metadata } from "next"

const schema = z.object({
  email: z.string().email("Valid email required"),
  password: z.string().min(1, "Password is required"),
})
type FormData = z.infer<typeof schema>

const OAUTH_ERRORS: Record<string, string> = {
  OAuthAccountNotLinked: "This email is already registered with a different sign-in method. Please use your original login.",
  OAuthCallbackError: "Google sign-in failed. Please try again.",
  OAuthSignin: "Could not start Google sign-in. Please try again.",
  Callback: "Authentication callback failed. Please try again.",
  AccessDenied: "Access was denied. Please contact support.",
  Configuration: "Authentication is not properly configured. Please contact support.",
  Default: "An authentication error occurred. Please try again.",
}

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const next = searchParams.get("next") ?? "/"
  const oauthError = searchParams.get("error")
  const [error, setError] = useState<string | null>(
    oauthError ? (OAUTH_ERRORS[oauthError] ?? OAUTH_ERRORS.Default) : null
  )
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  async function onSubmit(data: FormData) {
    setError(null)
    const result = await signIn("credentials", { email: data.email, password: data.password, redirect: false })
    if (result?.error) {
      setError("Invalid email or password. Try: client@volcanoarts.rw / Test1234!")
    } else {
      router.replace(next)
      router.refresh()
    }
  }

  return (
    <>
      <h1 style={{ fontFamily: "var(--font-display)", fontSize: "var(--text-title)", fontWeight: 600, marginBottom: "var(--space-6)", color: "var(--text-primary)" }}>
        Sign In
      </h1>

      {/* Google OAuth */}
      <button
        type="button"
        onClick={() => signIn("google", { callbackUrl: next })}
        style={{
          display: "flex", alignItems: "center", justifyContent: "center", gap: "var(--space-3)",
          width: "100%", height: "44px",
          border: "1px solid var(--border-default)", borderRadius: "var(--radius-md)",
          background: "var(--surface-raised)", color: "var(--text-primary)",
          fontFamily: "var(--font-ui)", fontWeight: 600, fontSize: "var(--text-small)",
          cursor: "pointer", transition: "border-color 0.15s, box-shadow 0.15s",
          marginBottom: "var(--space-5)",
        }}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
        </svg>
        Continue with Google
      </button>

      {/* Divider */}
      <div style={{ display: "flex", alignItems: "center", gap: "var(--space-4)", marginBottom: "var(--space-5)", color: "var(--text-muted)", fontSize: "var(--text-small)" }}>
        <div style={{ flex: 1, height: 1, background: "var(--border-subtle)" }} />
        <span>or sign in with email</span>
        <div style={{ flex: 1, height: 1, background: "var(--border-subtle)" }} />
      </div>

      {/* Error message */}
      {error && (
        <div role="alert" style={{ padding: "var(--space-3) var(--space-4)", background: "var(--color-error-bg)", color: "var(--color-error)", borderRadius: "var(--radius-md)", fontSize: "var(--text-small)", marginBottom: "var(--space-4)" }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} noValidate style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
        <div className={`field${errors.email ? " is-invalid" : ""}`}>
          <label className="field__label" htmlFor="email">Email</label>
          <input id="email" type="email" className="input" autoComplete="email" {...register("email")} />
          {errors.email && <span className="field__error">{errors.email.message}</span>}
        </div>

        <div className={`field${errors.password ? " is-invalid" : ""}`}>
          <label className="field__label" htmlFor="password">Password</label>
          <input id="password" type="password" className="input" autoComplete="current-password" {...register("password")} />
          {errors.password && <span className="field__error">{errors.password.message}</span>}
          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <Link href="/forgot-password" style={{ fontSize: "var(--text-caption)", color: "var(--green)" }}>Forgot password?</Link>
          </div>
        </div>

        <button type="submit" className="btn btn--primary" style={{ width: "100%", justifyContent: "center" }} disabled={isSubmitting}>
          {isSubmitting ? <><Loader2 size={16} style={{ marginRight: 8 }} className="animate-spin" />Signing in…</> : "Sign In"}
        </button>
      </form>

      <p style={{ marginTop: "var(--space-6)", textAlign: "center", fontSize: "var(--text-small)", color: "var(--text-secondary)" }}>
        Don&apos;t have an account?{" "}
        <Link href="/register" style={{ color: "var(--green)", fontWeight: 600 }}>Create one</Link>
      </p>
    </>
  )
}
