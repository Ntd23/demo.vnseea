// English description: Loads reel videos and coordinates active-item navigation for the reels route.

import type { FeedPostRecord } from "../../../feed/domain/types/feed.types"
import { createApiFeedRepository } from "../../../feed/infrastructure/repositories/ApiFeedRepository"

export function useReelsPageVM(
  repository = createApiFeedRepository(),
) {
  const { t } = useI18n()

  const loading = ref(true)
  const errorMessage = ref("")
  const reels = ref<FeedPostRecord[]>([])
  const activeIndex = ref(0)
  const touchStartY = ref<number | null>(null)

  const activeReel = computed(() => reels.value[activeIndex.value] ?? null)
  const activeMedia = computed(() => activeReel.value?.mediaItems[0] ?? null)

  async function fetchReels() {
    loading.value = true
    errorMessage.value = ""

    try {
      const response = await repository.getVideos({ limit: 12 })
      reels.value = response.posts.filter(post =>
        post.primaryMediaType === "video" || post.mediaItems[0]?.type === "video",
      )
    }
    catch (error) {
      errorMessage.value = error instanceof Error ? error.message : t("pages.watchPage.emptyDescription")
    }
    finally {
      loading.value = false
    }
  }

  function nextReel() {
    if (reels.value.length < 2) {
      return
    }

    activeIndex.value = (activeIndex.value + 1) % reels.value.length
  }

  function prevReel() {
    if (reels.value.length < 2) {
      return
    }

    activeIndex.value = (activeIndex.value - 1 + reels.value.length) % reels.value.length
  }

  function onTouchStart(event: TouchEvent) {
    touchStartY.value = event.changedTouches[0]?.clientY ?? null
  }

  function onTouchEnd(event: TouchEvent) {
    const startY = touchStartY.value
    const endY = event.changedTouches[0]?.clientY ?? null
    touchStartY.value = null

    if (startY == null || endY == null) {
      return
    }

    const deltaY = startY - endY
    if (Math.abs(deltaY) < 50) {
      return
    }

    if (deltaY > 0) {
      nextReel()
      return
    }

    prevReel()
  }

  return {
    loading,
    errorMessage,
    reels,
    activeIndex,
    activeReel,
    activeMedia,
    fetchReels,
    nextReel,
    prevReel,
    onTouchStart,
    onTouchEnd,
  }
}
