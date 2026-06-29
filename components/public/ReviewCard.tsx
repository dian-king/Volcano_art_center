interface ReviewCardProps {
  review: {
    reviewerName: string
    reviewerCountry: string | null
    rating: number
    comment: string | null
  }
}

function Stars({ rating }: { rating: number }) {
  return (
    <div className="review-card__stars" aria-label={`${rating} out of 5 stars`}>
      {Array.from({ length: 5 }, (_, i) => (
        <span key={i} style={{ color: i < rating ? "var(--accent)" : "var(--border)", fontSize: "1.1rem" }}>★</span>
      ))}
    </div>
  )
}

export function ReviewCard({ review }: ReviewCardProps) {
  return (
    <article className="card review-card">
      <div className="review-card__body card__body">
        <Stars rating={review.rating} />
        {review.comment && (
          <p className="review-card__comment" style={{ margin: "0.75rem 0", fontStyle: "italic" }}>
            &ldquo;{review.comment}&rdquo;
          </p>
        )}
        <div className="review-card__meta" style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginTop: "0.75rem" }}>
          <strong className="review-card__name">{review.reviewerName}</strong>
          {review.reviewerCountry && (
            <span className="review-card__country" style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>
              · {review.reviewerCountry}
            </span>
          )}
        </div>
      </div>
    </article>
  )
}