export type ProductCategory = "home" | "tech" | "beauty" | "books" | "vehicles" | "food"

export type ProductCondition = "new" | "like-new" | "used"

export type ProductCurrency = "USD" | "VND" | "EUR"

export interface ProductEditorFields {
  title: string
  price: string
  description: string
  category: ProductCategory
  condition: ProductCondition
  location: string
  currency: ProductCurrency
  stock: string
}

export interface ProductEditorDraft {
  mode: "create" | "edit"
  productId?: string
  fields: ProductEditorFields
  removedImageIds: string[]
  lastSavedAt: number | null
}

export interface ProductRecord {
  id: string
  title: string
  description: string
  category: ProductCategory
  condition: ProductCondition
  location: string
  currency: ProductCurrency
  price: number
  stock: number
}

export interface SaveProductDraftInput {
  storageKey: string
  draft: ProductEditorDraft
}
