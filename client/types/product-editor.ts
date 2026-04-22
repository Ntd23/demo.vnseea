export type CategoryValue = "home" | "tech" | "beauty" | "books" | "vehicles" | "food"

export type ConditionValue = "new" | "like-new" | "used"

export type CurrencyValue = "USD" | "VND" | "EUR"

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

export type ProductEditorFields = {
  title: string
  price: string
  description: string
  category: CategoryValue
  condition: ConditionValue
  location: string
  currency: CurrencyValue
  stock: string
}

export type ProductEditorDraft = {
  mode: "create" | "edit"
  productId?: string
  fields: ProductEditorFields
  removedImageIds: string[]
  lastSavedAt: number | null
}
