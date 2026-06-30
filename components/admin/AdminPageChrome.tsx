import Link from "next/link"

export function AdminPageHeader({
  eyebrow,
  title,
  description,
  actionHref,
  actionLabel,
}: {
  eyebrow?: string
  title: string
  description?: string
  actionHref?: string
  actionLabel?: string
}) {
  return (
    <header className="admin-page-header admin-page-header--panel">
      <div className="admin-page-header__info">
        {eyebrow && <span className="eyebrow">{eyebrow}</span>}
        <h1>{title}</h1>
        {description && <p>{description}</p>}
      </div>
      {actionHref && actionLabel && (
        <div className="admin-page-header__actions">
          <Link href={actionHref} className="btn btn--primary btn--sm">{actionLabel}</Link>
        </div>
      )}
    </header>
  )
}

export function AdminFilters({
  children,
  clearHref,
  active,
}: {
  children: React.ReactNode
  clearHref: string
  active?: boolean
}) {
  return (
    <form method="GET" className="admin-filter-panel">
      {children}
      <button type="submit" className="btn btn--primary btn--sm">Apply</button>
      {active && <Link href={clearHref} className="btn btn--ghost btn--sm">Clear</Link>}
    </form>
  )
}

export function AdminPagination({
  page,
  pages,
  total,
  basePath,
  query,
}: {
  page: number
  pages: number
  total: number
  basePath: string
  query: Record<string, string>
}) {
  const href = (nextPage: number) => {
    const params = new URLSearchParams()
    Object.entries(query).forEach(([key, value]) => {
      if (value) params.set(key, value)
    })
    params.set("page", String(nextPage))
    return `${basePath}?${params.toString()}`
  }

  return (
    <div className="admin-pagination">
      <span>{total} result{total === 1 ? "" : "s"} - Page {page} of {pages}</span>
      <div>
        {page > 1 && <Link href={href(page - 1)} className="btn btn--ghost btn--sm">Previous</Link>}
        {page < pages && <Link href={href(page + 1)} className="btn btn--ghost btn--sm">Next</Link>}
      </div>
    </div>
  )
}

export function AdminFormShell({
  eyebrow,
  title,
  description,
  backHref,
  children,
}: {
  eyebrow?: string
  title: string
  description?: string
  backHref: string
  children: React.ReactNode
}) {
  return (
    <div className="admin-form-page">
      <AdminPageHeader eyebrow={eyebrow} title={title} description={description} actionHref={backHref} actionLabel="Back" />
      <section className="admin-form-card">
        {children}
      </section>
    </div>
  )
}

export function AdminEditModalShell({
  eyebrow = "Edit record",
  title,
  description,
  backHref,
  children,
}: {
  eyebrow?: string
  title: string
  description?: string
  backHref: string
  children: React.ReactNode
}) {
  return (
    <div className="admin-edit-modal-shell">
      <header className="admin-edit-modal-shell__header">
        <span className="eyebrow">{eyebrow}</span>
        <h1>{title}</h1>
        {description && <p>{description}</p>}
      </header>
      <div className="admin-edit-modal-shell__body">
        {children}
        <div style={{ marginTop: "var(--space-4)" }}>
          <Link href={backHref} className="btn btn--ghost btn--sm">Back to list</Link>
        </div>
      </div>
    </div>
  )
}
