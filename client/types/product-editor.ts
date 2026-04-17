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
}

export type ProductImageTile = {
  name: string
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
