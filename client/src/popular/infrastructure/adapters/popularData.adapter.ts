import type { ComputedRef } from "vue"
import { useMockPopularData } from "../../../../app/composables/useMockPopularData"
import type { PopularCategory, PopularPost, PopularQuickLink } from "../../domain/types/popular.types"

export function usePopularDataSource() {
  const data = useMockPopularData()

  return {
    categories: data.categories as ComputedRef<PopularCategory[]>,
    posts: data.posts as ComputedRef<PopularPost[]>,
    quickLinks: data.quickLinks as ComputedRef<PopularQuickLink[]>,
  }
}
