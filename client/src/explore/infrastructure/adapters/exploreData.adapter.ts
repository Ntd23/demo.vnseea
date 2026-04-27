import type { ComputedRef } from "vue"
import { useMockExploreData } from "../../../../app/composables/useMockExploreData"
import type {
  ExploreHashtag,
  ExploreSummaryCard,
  ExploreUserSpotlight,
  ExploreViewOption,
} from "../../domain/types/explore.types"

export function useExploreDataSource() {
  const data = useMockExploreData()

  return {
    exploreViewOptions: data.exploreViewOptions as ComputedRef<ExploreViewOption[]>,
    summaryCards: data.summaryCards as ComputedRef<ExploreSummaryCard[]>,
    recommendedPosts: data.recommendedPosts,
    recommendedUsers: data.recommendedUsers as ComputedRef<ExploreUserSpotlight[]>,
    recommendedPages: data.recommendedPages,
    trendingHashtags: data.trendingHashtags as ComputedRef<ExploreHashtag[]>,
  }
}
