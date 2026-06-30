import { DeleteButton } from "@/components/admin/DeleteButton"
import { AdminFilters, AdminPageHeader, AdminPagination } from "@/components/admin/AdminPageChrome"
import { db } from "@/lib/db"
import Link from "next/link"

export const dynamic = "force-dynamic"
const PAGE_SIZE = 12

async function feature(fd: FormData) {
  "use server"
  const { toggleBlogFeatured } = await import("@/actions/admin-content")
  await toggleBlogFeatured(fd.get("id") as string, true)
  const { redirect } = await import("next/navigation")
  redirect("/admin/blog")
}

async function unfeature(fd: FormData) {
  "use server"
  const { toggleBlogFeatured } = await import("@/actions/admin-content")
  await toggleBlogFeatured(fd.get("id") as string, false)
  const { redirect } = await import("next/navigation")
  redirect("/admin/blog")
}

async function del(fd: FormData) {
  "use server"
  const { deletePost } = await import("@/actions/admin-content")
  await deletePost(fd.get("id") as string)
}

export default async function AdminBlogPage({ searchParams }: { searchParams: Promise<Record<string, string>> }) {
  const sp = await searchParams
  const q = sp.q ?? ""
  const category = sp.category ?? ""
  const status = sp.status ?? ""
  const page = Math.max(1, Number(sp.page ?? 1))

  const where: any = {}
  if (category) where.category = category
  if (status === "PUBLISHED") where.published = true
  if (status === "DRAFT") where.published = false
  if (q) where.title = { contains: q, mode: "insensitive" }

  const [posts, total] = await Promise.all([
    db.blogPost.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      select: { id: true, title: true, excerpt: true, category: true, tags: true, viewCount: true, featuredImageUrl: true, featured: true, published: true },
    }),
    db.blogPost.count({ where }),
  ])
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE))

  return (
    <div>
      <AdminPageHeader eyebrow="Editorial" title="Blog & Stories" description="Draft, publish, feature, and organize stories across the public site." actionHref="/admin/blog/new" actionLabel="+ New Post" />

      <AdminFilters clearHref="/admin/blog" active={Boolean(q || category || status)}>
        <input name="q" defaultValue={q} placeholder="Search posts..." />
        <select name="category" defaultValue={category}>
          <option value="">All categories</option>
          <option value="UPDATE">Update</option>
          <option value="EVENT">Event</option>
          <option value="STORY">Story</option>
          <option value="CULTURE">Culture</option>
          <option value="CONSERVATION">Conservation</option>
          <option value="TESTIMONIAL">Testimonial</option>
        </select>
        <select name="status" defaultValue={status}>
          <option value="">All statuses</option>
          <option value="PUBLISHED">Published</option>
          <option value="DRAFT">Draft</option>
        </select>
      </AdminFilters>

      <div className="admin-results-bar"><span>{total} post{total === 1 ? "" : "s"}</span><span>{q || category || status ? "Filtered view" : "All records"}</span></div>

      {posts.length === 0 ? (
        <p style={{ color: "var(--text-muted)" }}>No posts found. <Link href="/admin/blog/new">Write your first post</Link></p>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: "var(--space-4)" }}>
          {posts.map((p) => (
            <div key={p.id} className="card card--interactive" style={{ display: "flex", flexDirection: "column", overflow: "hidden" }}>
              <div style={{ position: "relative", aspectRatio: "4/3", background: "var(--green-tint)" }}>
                {p.featuredImageUrl && <img src={p.featuredImageUrl} alt={p.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />}
                <span className={`chip ${p.published ? "chip--success" : "chip--neutral"}`} style={{ position: "absolute", top: "var(--space-2)", left: "var(--space-2)" }}>{p.published ? "Published" : "Draft"}</span>
                {p.featured && <span className="chip chip--warning" style={{ position: "absolute", top: "var(--space-2)", right: "var(--space-2)" }}>Featured</span>}
              </div>
              <div style={{ padding: "var(--space-4)", flex: 1, display: "flex", flexDirection: "column", gap: "var(--space-2)" }}>
                <p style={{ fontFamily: "var(--font-ui)", fontWeight: 700, color: "var(--text-primary)" }}>{p.title}</p>
                {p.excerpt && <p style={{ fontSize: "var(--text-caption)", color: "var(--text-muted)" }}>{p.excerpt.slice(0, 80)}{p.excerpt.length > 80 ? "..." : ""}</p>}
                <span className="chip chip--neutral" style={{ alignSelf: "flex-start", fontSize: "10px" }}>{p.category}</span>
                <p style={{ fontSize: "var(--text-caption)", color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>{p.viewCount ?? 0} views</p>
                <div style={{ display: "flex", gap: "var(--space-2)", marginTop: "auto", flexWrap: "wrap" }}>
                  <Link href={`/admin/blog/${p.id}/edit`} className="btn btn--ghost btn--sm">Edit</Link>
                  <form action={p.featured ? unfeature : feature}>
                    <input type="hidden" name="id" value={p.id} />
                    <button type="submit" className="btn btn--ghost btn--sm">{p.featured ? "Unfeature" : "Feature"}</button>
                  </form>
                  <DeleteButton action={del} id={p.id} itemName={p.title} />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <AdminPagination page={page} pages={pages} total={total} basePath="/admin/blog" query={{ q, category, status }} />
    </div>
  )
}
