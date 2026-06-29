"use client"

export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="error-page container section">
      <h2 className="error-page__title">Something went wrong</h2>
      <p className="error-page__msg">{error.message}</p>
      <button className="btn btn--primary" onClick={reset}>Try again</button>
    </div>
  )
}