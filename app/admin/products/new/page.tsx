import { db } from "@/lib/db"
import { createProduct } from "@/actions/products"
import { ImageUploadField } from "@/components/admin/ImageUploadField"

export default async function NewProductPage() {
  const categories = await db.category.findMany({ orderBy: { name: "asc" } })

  const field = (label: string, name: string, type = "text", required = false, rest?: Record<string, string>) => (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-1)" }}>
      <label style={{ fontWeight: 600, fontSize: "var(--text-small)", fontFamily: "var(--font-ui)", color: "var(--text-secondary)" }}>
        {label}{required && <span style={{ color: "var(--red)" }}> *</span>}
      </label>
      <input
        type={type} name={name} required={required} {...rest}
        style={{ height: "40px", padding: "0 var(--space-3)", border: "1px solid var(--border-subtle)", borderRadius: "var(--radius-md)", background: "var(--surface-raised)", color: "var(--text-primary)", fontSize: "var(--text-small)", fontFamily: "var(--font-ui)" }}
      />
    </div>
  )

  return (
    <div style={{ maxWidth: "720px" }}>
      <h1 style={{ fontFamily: "var(--font-display)", fontSize: "var(--text-headline)", fontWeight: 600, marginBottom: "var(--space-7)" }}>Add Product</h1>

      <form action={createProduct} style={{ display: "flex", flexDirection: "column", gap: "var(--space-5)" }}>
        {field("Product Name", "name", "text", true)}
        {field("Artist Name", "artistName")}

        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-1)" }}>
          <label style={{ fontWeight: 600, fontSize: "var(--text-small)", fontFamily: "var(--font-ui)", color: "var(--text-secondary)" }}>Description</label>
          <textarea name="description" rows={4}
            style={{ padding: "var(--space-3)", border: "1px solid var(--border-subtle)", borderRadius: "var(--radius-md)", background: "var(--surface-raised)", color: "var(--text-primary)", fontSize: "var(--text-small)", fontFamily: "var(--font-ui)", resize: "vertical" }}
          />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-4)" }}>
          {field("Price (USD)", "price", "number", true, { min: "0", step: "0.01" })}
          {field("Stock Quantity", "stockQuantity", "number", false, { min: "0", defaultValue: "1" })}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-4)" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-1)" }}>
            <label style={{ fontWeight: 600, fontSize: "var(--text-small)", fontFamily: "var(--font-ui)", color: "var(--text-secondary)" }}>Category</label>
            <select name="categoryId"
              style={{ height: "40px", padding: "0 var(--space-3)", border: "1px solid var(--border-subtle)", borderRadius: "var(--radius-md)", background: "var(--surface-raised)", color: "var(--text-primary)", fontSize: "var(--text-small)" }}>
              <option value="">— None —</option>
              {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-1)" }}>
            <label style={{ fontWeight: 600, fontSize: "var(--text-small)", fontFamily: "var(--font-ui)", color: "var(--text-secondary)" }}>Inventory Type</label>
            <select name="inventoryType"
              style={{ height: "40px", padding: "0 var(--space-3)", border: "1px solid var(--border-subtle)", borderRadius: "var(--radius-md)", background: "var(--surface-raised)", color: "var(--text-primary)", fontSize: "var(--text-small)" }}>
              <option value="BATCH">Batch (multiple copies)</option>
              <option value="UNIQUE">Unique (1 of 1)</option>
            </select>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-4)" }}>
          {field("Medium (e.g. Oil on canvas)", "medium")}
          {field("Dimensions (e.g. 60×80 cm)", "dimensions")}
        </div>

        <ImageUploadField name="primaryImageUrl" folder="products" label="Primary Image" />

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-4)" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-1)" }}>
            <label style={{ fontWeight: 600, fontSize: "var(--text-small)", fontFamily: "var(--font-ui)", color: "var(--text-secondary)" }}>Status</label>
            <select name="status"
              style={{ height: "40px", padding: "0 var(--space-3)", border: "1px solid var(--border-subtle)", borderRadius: "var(--radius-md)", background: "var(--surface-raised)", color: "var(--text-primary)", fontSize: "var(--text-small)" }}>
              <option value="DRAFT">Draft (not visible in store)</option>
              <option value="PUBLISHED">Published (visible in store)</option>
            </select>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)", paddingTop: "var(--space-6)" }}>
            <input type="checkbox" name="featured" id="featured" style={{ accentColor: "var(--green)", width: "16px", height: "16px" }} />
            <label htmlFor="featured" style={{ fontSize: "var(--text-small)", fontFamily: "var(--font-ui)", color: "var(--text-secondary)", cursor: "pointer" }}>Featured product</label>
          </div>
        </div>

        <div style={{ display: "flex", gap: "var(--space-3)", paddingTop: "var(--space-3)", borderTop: "1px solid var(--border-subtle)" }}>
          <button type="submit" className="btn btn--primary">Save Product</button>
          <a href="/admin/products" className="btn btn--ghost">Cancel</a>
        </div>
      </form>
    </div>
  )
}
