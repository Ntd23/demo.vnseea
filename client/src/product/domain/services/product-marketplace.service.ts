import type {
  ProductDistanceValue,
  ProductListing,
  ProductListingCategory,
  ProductSortValue,
} from "../types/product-marketplace.types"

export type ProductMarketplaceFilters = {
  keyword: string
  category: "all" | ProductListingCategory
  distance: ProductDistanceValue
  nearbyOnly: boolean
}

export const filterProductListings = (
  products: ProductListing[],
  filters: ProductMarketplaceFilters,
) => {
  const keyword = filters.keyword.trim().toLowerCase()

  return products.filter((product) => {
    const matchesKeyword = keyword.length === 0 || [
      product.title,
      product.description,
      product.seller,
      product.location,
      product.categoryLabel,
    ].some(field => field.toLowerCase().includes(keyword))

    const matchesCategory =
      filters.category === "all" || product.category === filters.category

    const matchesDistance =
      filters.distance === "all" || product.distanceKm <= Number(filters.distance)

    const matchesNearby = !filters.nearbyOnly || product.distanceKm <= 5

    return matchesKeyword && matchesCategory && matchesDistance && matchesNearby
  })
}

export const sortProductListings = (
  products: ProductListing[],
  sortBy: ProductSortValue,
) => {
  return products.slice().sort((left, right) => {
    switch (sortBy) {
      case "latest":
        return left.postedHoursAgo - right.postedHoursAgo
      case "price-asc":
        return left.price - right.price
      case "price-desc":
        return right.price - left.price
      case "nearest":
        return left.distanceKm - right.distanceKm
      case "rating":
        return right.rating - left.rating
      case "featured":
      default:
        return (
          Number(Boolean(right.mine)) - Number(Boolean(left.mine))
          || right.rating - left.rating
          || left.postedHoursAgo - right.postedHoursAgo
        )
    }
  })
}
