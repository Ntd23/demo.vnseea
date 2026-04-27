import type { ComputedRef } from "vue"
import type { PopularCategory, PopularPost, PopularQuickLink } from "../types/popular.types"

export interface PopularRepository {
  categories: ComputedRef<PopularCategory[]>
  posts: ComputedRef<PopularPost[]>
  quickLinks: ComputedRef<PopularQuickLink[]>
}
