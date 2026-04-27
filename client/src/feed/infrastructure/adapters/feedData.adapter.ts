import { useMockSocialData } from "../../../../app/composables/useMockSocialData"
import type { FeedPost, FeedStory } from "../../domain/types/feed.types"

export function useFeedDataSource() {
  const data = useMockSocialData()

  return {
    posts: data.posts as FeedPost[],
    stories: data.stories as FeedStory[],
  }
}
