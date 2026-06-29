import { db } from "@/lib/db"
import { updateProduct } from "@/actions/products"
import { notFound } from "next/navigation"
import { ImageUploadField } from "@/components/admin/ImageUploadField"

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const [product, categories] = await Promise.all([
    db.product.findUnique({ where: { id } }),
    db.category.findMany({ orderBy: { name: "asc" } }),
  ])
  if (!product) notFound()

  const action = updateProduct.bind(null, id)

  const sel = (label: string, name: string, options: { value: string; label: string }[], current: string) => (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-1)" }}>
      <label style={{ fontWeight: 600, fontSize: "var(--text-small)", fontFamily: "var(--font-ui)", color: "var(--text-secondary)" }}>{label}</label>
      <select name={name} defaultValue={current}
        style={{ height: "40px", padding: "0 var(--space-3)", border: "1px solid var(--border-subtle)", borderRadius: "var(--radius-md)", background: "var(--surface-raised)", color: "var(--text-primary)", fontSize: "var(--text-small)" }}>
        {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  )

  const inp = (label: string, name: string, value: string, type = "text", extra?: Record<string, string>) => (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-1)" }}>
      <label style={{ fontWeight: 600, fontSize: "var(--text-small)", fontFamily: "var(--font-ui)", color: "var(--text-secondary)" }}>{label}</label>
      <input type={type} name={name} defaultValue={value} {...extra}
        style={{ height: "40px", padding: "0 var(--space-3)", border: "1px solid var(--border-subtle)", borderRadius: "var(--radius-md)", background: "var(--surface-raised)", color: "var(--text-primary)", fontSize: "var(--text-small)", fontFamily: "var(--font-ui)" }}
      />
    </div>
  )

  return (
    <div style={{ maxWidth: "720px" }}>
      <h1 style={{ fontFamily: "var(--font-display)", fontSize: "var(--text-headline)", fontWeight: 600, marginBottom: "var(--space-7)" }}>Edit: {product.name}</h1>

      <form action={action} style={{ display: "flex", flexDirection: "column", gap: "var(--space-5)" }}>
        {inp("Product Name", "name", product.name, "text")}
        {inp("Artist Name", "artistName", product.artistName ?? "")}

        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-1)" }}>
          <label style={{ fontWeight: 600, fontSize: "var(--text-small)", fontFamily: "var(--font-ui)", color: "var(--text-secondary)" }}>Description</label>
          <textarea name="description" rows={4} defaultValue={product.description ?? ""}
            style={{ padding: "var(--space-3)", border: "1px solid var(--border-subtle)", borderRadius: "var(--radius-md)", background: "var(--surface-raised)", color: "var(--text-primary)", fontSize: "var(--text-small)", fontFamily: "var(--font-ui)", resize: "vertical" }}
          />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-4)" }}>
          {inp("Price (USD)", "price", String(Number(product.price)), "number", { min: "0", step: "0.01" })}
          {inp("Stock Quantity", "stockQuantity", String(product.stockQuantity), "number", { min: "0" })}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-4)" }}>
          {sel("Category", "categoryId",
            [{ value: "", label: "— None —" }, ...categories.map((c) => ({ value: c.id, label: c.name }))],
            product.categoryId ?? ""
          )}
          {sel("Inventory Type", "inventoryType",
            [{ value: "BATCH", label: "Batch (multiple copies)" }, { value: "UNIQUE", label: "Unique (1 of 1)" }],
            product.inventoryType
          )}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-4)" }}>
          {inp("Medium", "medium", product.medium ?? "")}
          {inp("Dimensions", "dimensions", product.dimensions ?? "")}
        </div>

        <ImageUploadField name="primaryImageUrl" folder="products" label="Primary Image" defaultUrl={product.primaryImageUrl ?? undefined} />

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-4)" }}>
          {sel("Status", "status",
            [
              { value: "DRAFT", label: "Draft" },
              { value: "PUBLISHED", label: "Published" },
              { value: "ARCHIVED", label: "Archived" },
              { value: "SOLD", label: "Sold" },
            ],
            product.status
          )}
          <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)", paddingTop: "var(--space-6)" }}>
            <input type="checkbox" name="featured" id="featured" defaultChecked={product.featured} style={{ accentColor: "var(--green)", width: "16px", height: "16px" }} />
            <label htmlFor="featured" style={{ fontSize: "var(--text-small)", fontFamily: "var(--font-ui)", color: "var(--text-secondary)", cursor: "pointer" }}>Featured product</label>
          </div>
        </div>

        <div style={{ display: "flex", gap: "var(--space-3)", paddingTop: "var(--space-3)", borderTop: "1px solid var(--border-subtle)" }}>
          <button type="submit" className="btn btn--primary">Save Changes</button>
          <a href="/admin/products" className="btn btn--ghost">Cancel</a>
        </div>
      </form>
    </div>
  )
}
