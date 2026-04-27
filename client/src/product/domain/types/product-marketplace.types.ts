export type ProductCategory = "all" | "vehicles" | "home" | "beauty" | "books" | "tech" | "food"

export type ProductListingCategory = Exclude<ProductCategory, "all">

export type ProductSortValue = "featured" | "latest" | "price-asc" | "price-desc" | "nearest" | "rating"

export type ProductDistanceValue = "all" | "5" | "10" | "25"

export type ProductListing = {
  id: number
  title: string
  seller: string
  price: number
  location: string
  distanceKm: number
  category: ProductListingCategory
  categoryLabel: string
  condition: string
  description: string
  background: string
  icon: string
  postedHoursAgo: number
  postedLabel: string
  rating: number
  mine?: boolean
}

export type ProductSelectOption<T extends string> = {
  label: string
  value: T
}

export type ProductCategoryChip = {
  label: string
  value: ProductCategory
  icon: string
}

export type ProductOverviewCard = {
  label: string
  value: string
  icon: string
  description: string
}
