import { createProduct } from "@/actions/products"
import { F } from "@/components/admin/AdminForm"
import { AdminFormShell } from "@/components/admin/AdminPageChrome"
import { AdminFormWizard } from "@/components/admin/AdminFormWizard"
import { ImageUploadField } from "@/components/admin/ImageUploadField"
import { db } from "@/lib/db"
import Link from "next/link"

export default async function NewProductPage() {
  const categories = await db.category.findMany({ orderBy: { name: "asc" } })

  return (
    <AdminFormShell eyebrow="Operations" title="Add Product" description="Create a catalog item with pricing, inventory, category, artwork details, and storefront visibility." backHref="/admin/products">
      <form action={createProduct}>
        <AdminFormWizard
          submitLabel="Save Product"
          cancel={<Link href="/admin/products" className="btn btn--ghost">Cancel</Link>}
          steps={[
            { title: "Artwork", description: "Add the product name, artist, description, medium, and dimensions." },
            { title: "Inventory", description: "Set price, stock, category, and inventory type." },
            { title: "Publish", description: "Upload the image and choose storefront visibility." },
          ]}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
            <div style={F.wrap}><label style={F.label}>Product Name *</label><input name="name" required style={F.inp} /></div>
            <div style={F.wrap}><label style={F.label}>Artist Name</label><input name="artistName" style={F.inp} /></div>
            <div style={F.wrap}><label style={F.label}>Description</label><textarea name="description" rows={4} style={F.ta} /></div>
            <div style={F.grid2}>
              <div style={F.wrap}><label style={F.label}>Medium</label><input name="medium" style={F.inp} placeholder="Oil on canvas" /></div>
              <div style={F.wrap}><label style={F.label}>Dimensions</label><input name="dimensions" style={F.inp} placeholder="60 x 80 cm" /></div>
            </div>
          </div>

          <div>
            <div style={F.grid2}>
              <div style={F.wrap}><label style={F.label}>Price (USD) *</label><input name="price" type="number" min="0" step="0.01" required style={F.inp} /></div>
              <div style={F.wrap}><label style={F.label}>Stock Quantity</label><input name="stockQuantity" type="number" min="0" defaultValue="1" style={F.inp} /></div>
            </div>
            <div style={{ ...F.grid2, marginTop: "var(--space-4)" }}>
              <div style={F.wrap}>
                <label style={F.label}>Category</label>
                <select name="categoryId" style={F.sel}>
                  <option value="">None</option>
                  {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div style={F.wrap}>
                <label style={F.label}>Inventory Type</label>
                <select name="inventoryType" style={F.sel}>
                  <option value="BATCH">Batch (multiple copies)</option>
                  <option value="UNIQUE">Unique (1 of 1)</option>
                </select>
              </div>
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
            <ImageUploadField name="primaryImageUrl" folder="products" label="Primary Image" />
            <div style={F.grid2}>
              <div style={F.wrap}>
                <label style={F.label}>Status</label>
                <select name="status" style={F.sel}>
                  <option value="DRAFT">Draft</option>
                  <option value="PUBLISHED">Published</option>
                </select>
              </div>
              <div style={{ display: "flex", alignItems: "end", paddingBottom: 8 }}>{F.check("featured", "Featured product", false)}</div>
            </div>
          </div>
        </AdminFormWizard>
      </form>
    </AdminFormShell>
  )
}
