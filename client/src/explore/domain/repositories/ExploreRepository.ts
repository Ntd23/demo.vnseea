import type {
  ExploreHashtag,
  ExploreSummaryCard,
  ExploreUserSpotlight,
  ExploreViewOption,
} from "../types/explore.types"

export interface ExploreRepository<TPost = unknown, TPage = unknown> {
  getViewOptions(): ExploreViewOption[]
  getSummaryCards(): ExploreSummaryCard[]
  getRecommendedPosts(): TPost[]
  getRecommendedUsers(): ExploreUserSpotlight[]
  getRecommendedPages(): TPage[]
  getTrendingHashtags(): ExploreHashtag[]
}
