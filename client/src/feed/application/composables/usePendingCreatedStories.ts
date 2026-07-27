// English description: Keeps newly created stories until the backend feed confirms every uploaded item.

import type { FeedStoryRecord } from "../../domain/types/feed.types"

export function usePendingCreatedStories() {
  return useState<FeedStoryRecord[]>("feed-pending-created-stories", () => [])
}
