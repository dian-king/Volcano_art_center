import { db } from "@/lib/db"
import Link from "next/link"
import { DeleteButton } from "@/components/admin/DeleteButton"

export const dynamic = "force-dynamic"

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
  const catFilter = sp.category ?? ""

  const where: any = {}
  if (catFilter) where.category = catFilter
  if (q) where.title = { contains: q, mode: "insensitive" }

  const posts = await db.blogPost.findMany({
    where,
    orderBy: { createdAt: "desc" },
    select: {
      id: true, title: true, excerpt: true, category: true, tags: true,
      viewCount: true, featuredImageUrl: true, featured: true,
      published: true, createdAt: true,
    },
  })

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "var(--space-6)" }}>
        <h1 style={{ fontFamily: "var(--font-display)", fontSize: "var(--text-headline)", fontWeight: 600 }}>Blog & Stories</h1>
        <Link href="/admin/blog/new" className="btn btn--primary btn--sm">+ New Post</Link>
      </div>

      <form method="GET" style={{ display: "flex", gap: "var(--space-3)", marginBottom: "var(--space-6)", flexWrap: "wrap" }}>
        <input name="q" defaultValue={q} placeholder="Search posts…" style={{ height: 40, padding: "0 var(--space-3)", border: "1px solid var(--border-subtle)", borderRadius: "var(--radius-md)", background: "var(--surface-raised)", color: "var(--text-primary)", fontSize: "var(--text-small)", fontFamily: "var(--font-ui)", flex: 1, minWidth: 180 }} />
        <select name="category" defaultValue={catFilter} style={{ height: 40, padding: "0 var(--space-3)", border: "1px solid var(--border-subtle)", borderRadius: "var(--radius-md)", background: "var(--surface-raised)", color: "var(--text-primary)", fontSize: "var(--text-small)", fontFamily: "var(--font-ui)" }}>
          <option value="">All Categories</option>
          <option value="STORY">Story</option>
          <option value="CULTURE">Culture</option>
          <option value="CONSERVATION">Conservation</option>
          <option value="EVENT">Event</option>
          <option value="UPDATE">Update</option>
        </select>
        <button type="submit" className="btn btn--primary btn--sm">Search</button>
        {(q || catFilter) && <a href="/admin/blog" className="btn btn--ghost btn--sm">Clear</a>}
      </form>

      <p style={{ fontFamily: "var(--font-mono)", fontSize: "var(--text-caption)", color: "var(--text-muted)", marginBottom: "var(--space-4)" }}>{posts.length} posts</p>

      {posts.length === 0 ? (
        <p style={{ color: "var(--text-muted)" }}>No posts found. <Link href="/admin/blog/new">Write your first post →</Link></p>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: "var(--space-4)" }}>
          {posts.map((p) => (
            <div key={p.id} className="card card--interactive" style={{ display: "flex", flexDirection: "column" }}>
              <div style={{ position: "relative", aspectRatio: "4/3", background: "var(--green-tint)" }}>
                {p.featuredImageUrl && <img src={p.featuredImageUrl} alt={p.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />}
                <span className={`chip ${p.published ? "chip--success" : "chip--neutral"}`} style={{ position: "absolute", top: "var(--space-2)", left: "var(--space-2)" }}>{p.published ? "Published" : "Draft"}</span>
                {p.featured && <span style={{ position: "absolute", top: "var(--space-2)", right: "var(--space-2)", fontSize: "1.1rem" }}>⭐</span>}
              </div>
              <div style={{ padding: "var(--space-4)", flex: 1, display: "flex", flexDirection: "column", gap: "var(--space-2)" }}>
                <p style={{ fontFamily: "var(--font-ui)", fontWeight: 700, fontSize: "var(--text-small)", color: "var(--text-primary)" }}>{p.title}</p>
                {p.excerpt && <p style={{ fontSize: "var(--text-caption)", color: "var(--text-muted)" }}>{p.excerpt.slice(0, 60)}{p.excerpt.length > 60 ? "…" : ""}</p>}
                <span className="chip chip--neutral" style={{ alignSelf: "flex-start", fontSize: "10px" }}>{p.category}</span>
                <div style={{ display: "flex", gap: "var(--space-1)", flexWrap: "wrap" }}>
                  {(p.tags as string[] | null ?? []).slice(0, 2).map(t => (
                    <span key={t} style={{ fontSize: "10px", background: "var(--green-tint)", color: "var(--green)", borderRadius: "var(--radius-pill)", padding: "1px 6px" }}>{t}</span>
                  ))}
                </div>
                <p style={{ fontSize: "var(--text-caption)", color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>👁 {p.viewCount ?? 0}</p>
                <div style={{ display: "flex", gap: "var(--space-2)", marginTop: "auto", flexWrap: "wrap" }}>
                  <a href={`/admin/blog/${p.id}/edit`} className="btn btn--ghost btn--sm">Edit</a>
                  <form action={p.featured ? unfeature : feature}>
                    <input type="hidden" name="id" value={p.id} />
                    <button type="submit" className="btn btn--ghost btn--sm" style={{ color: p.featured ? "#F59E0B" : "var(--text-muted)" }}>
                      {p.featured ? "★ Unfeature" : "☆ Feature"}
                    </button>
                  </form>
                  <DeleteButton action={del} id={p.id} itemName={p.title} />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
