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
  const touchStartX = ref<number | null>(null)
  const touchStartedFromLeftEdge = ref(false)
  const wheelLocked = ref(false)

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

  function exitFullscreen() {
    if (import.meta.client && window.history.length > 1) {
      window.history.back()
      return
    }

    navigateTo("/")
  }

  function onTouchStart(event: TouchEvent) {
    const touch = event.changedTouches[0]
    touchStartY.value = touch?.clientY ?? null
    touchStartX.value = touch?.clientX ?? null
    touchStartedFromLeftEdge.value = (touch?.clientX ?? Number.POSITIVE_INFINITY) <= 28
  }

  function onTouchEnd(event: TouchEvent) {
    const startY = touchStartY.value
    const startX = touchStartX.value
    const touch = event.changedTouches[0]
    const endY = touch?.clientY ?? null
    const endX = touch?.clientX ?? null
    touchStartY.value = null
    touchStartX.value = null

    if (startY == null || startX == null || endY == null || endX == null) {
      return
    }

    const deltaY = startY - endY
    const deltaX = endX - startX

    if (touchStartedFromLeftEdge.value && deltaX > 72 && Math.abs(deltaX) > Math.abs(deltaY)) {
      touchStartedFromLeftEdge.value = false
      exitFullscreen()
      return
    }

    touchStartedFromLeftEdge.value = false

    if (Math.abs(deltaY) < 50 || Math.abs(deltaY) < Math.abs(deltaX)) {
      return
    }

    if (deltaY > 0) {
      nextReel()
      return
    }

    prevReel()
  }

  function onWheel(event: WheelEvent) {
    if (wheelLocked.value || Math.abs(event.deltaY) < 32) {
      return
    }

    wheelLocked.value = true

    if (event.deltaY > 0) {
      nextReel()
    }
    else {
      prevReel()
    }

    window.setTimeout(() => {
      wheelLocked.value = false
    }, 420)
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
    exitFullscreen,
    onTouchStart,
    onTouchEnd,
    onWheel,
  }
}
