import type { ProductEditorDraft, ProductRecord } from "../types/product-editor.types"

export interface ProductRepository {
  getById(id: string): Promise<ProductRecord | null>
  create(draft: ProductEditorDraft): Promise<ProductRecord>
  update(id: string, draft: ProductEditorDraft): Promise<ProductRecord>
}
