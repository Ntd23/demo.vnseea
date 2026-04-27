export type ProductCategory = "home" | "tech" | "beauty" | "books" | "vehicles" | "food"

export type ProductCondition = "new" | "like-new" | "used"

export type ProductCurrency = "USD" | "VND" | "EUR"

export type CategoryValue = ProductCategory

export type ConditionValue = ProductCondition

export type CurrencyValue = ProductCurrency

export type ProductHeroStat = {
  label: string
  value: string
  description: string
}

export type ProductChecklistItem = {
  label: string
  description: string
  done: boolean
}

export type ProductTipItem = {
  title: string
  description: string
  icon: string
}

export type ProductOption<T extends string> = {
  label: string
  value: T
}

export type ProductCurrentImage = {
  id: string
  src: string
  alt: string
}

export type ProductImageTile = {
  id: string
  name: string
  src?: string
  alt?: string
}

export type ProductCategoryMeta = {
  label: string
  icon: string
  background: string
}

export type ProductCurrencyMeta = {
  label: string
  locale: string
}

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
