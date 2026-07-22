// English description: Shares the transient reel viewer state used when opening a feed video without changing routes.

import type { FeedPostRecord } from "../../../feed/domain/types/feed.types"

type ReelsViewerOverlayState = {
  post: FeedPostRecord
}

export function useReelsViewerOverlay() {
  const viewer = useState<ReelsViewerOverlayState | null>("reels-viewer-overlay", () => null)

  function open(post: FeedPostRecord) {
    viewer.value = { post }
  }

  function close() {
    viewer.value = null
  }

  return {
    viewer,
    open,
    close,
  }
}
