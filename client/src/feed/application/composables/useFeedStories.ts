import { useFeedDataSource } from "../../infrastructure/adapters/feedData.adapter"

export function useFeedStories() {
  const { stories } = useFeedDataSource()

  return {
    stories,
  }
}
