// English description: Loads reel videos and coordinates active-item navigation for the reels route.

import type { FeedPostRecord } from "../../../feed/domain/types/feed.types"
import type { FeedRepository } from "../../../feed/domain/repositories/FeedRepository"
import { useFeedPostCardVM } from "../../../feed/application/view-models/useFeedPostCardVM"
import { createApiFeedRepository } from "../../../feed/infrastructure/repositories/ApiFeedRepository"
import { useReelsViewerOverlay } from "../composables/useReelsViewerOverlay"

type ReelsPageVMOptions = {
  postId?: number
  initialPost?: FeedPostRecord
  onExit?: () => void
}

export function useReelsPageVM(
  repository: FeedRepository = createApiFeedRepository(),
  options: ReelsPageVMOptions = {},
) {
  const { t } = useI18n()
  const route = useRoute()
  const { viewer } = useReelsViewerOverlay()
  const initialPost = options.initialPost ?? viewer.value?.post

  const loading = ref(!initialPost)
  const errorMessage = ref("")
  const reels = ref<FeedPostRecord[]>(initialPost ? [initialPost] : [])
  const activeIndex = ref(0)
  const gestureStartY = ref<number | null>(null)
  const gestureStartX = ref<number | null>(null)
  const gestureStartedFromLeftEdge = ref(false)
  const wheelLocked = ref(false)
  const videoRef = ref<HTMLVideoElement | null>(null)
  const currentTime = ref(0)
  const duration = ref(0)
  const isPlaying = ref(true)

  const activeReel = computed(() => reels.value[activeIndex.value] ?? null)
  const activeMedia = computed(() =>
    activeReel.value?.mediaItems.find(item => item.type === "video")
    ?? activeReel.value?.mediaItems[0]
    ?? null,
  )
  const progress = computed(() => (duration.value ? (currentTime.value / duration.value) * 100 : 0))
  const feedPostVM = useFeedPostCardVM(activeReel)

  async function fetchReels() {
    if (!initialPost) {
      loading.value = true
    }
    errorMessage.value = ""

    try {
      const response = await repository.getVideos({ limit: 12 })
      const fetchedReels = response.posts.filter(post =>
        post.primaryMediaType === "video" || post.mediaItems.some(item => item.type === "video"),
      )
      reels.value = initialPost
        ? [initialPost, ...fetchedReels.filter(post => post.id !== initialPost.id)]
        : fetchedReels

      const requestedPostId = options.postId ?? initialPost?.id ?? Number(route.query.postId ?? 0)
      if (requestedPostId > 0) {
        const existingIndex = reels.value.findIndex(post => post.id === requestedPostId)
        if (existingIndex >= 0) {
          activeIndex.value = existingIndex
        }
        else {
          const requestedPost = await repository.getPostById(requestedPostId)
          if (requestedPost && (
            requestedPost.primaryMediaType === "video"
            || requestedPost.mediaItems.some(item => item.type === "video")
          )) {
            reels.value.unshift(requestedPost)
            activeIndex.value = 0
          }
        }
      }
    }
    catch (error) {
      errorMessage.value = error instanceof Error ? error.message : t("pages.watchPage.emptyDescription")
    }
    finally {
      loading.value = false
    }
  }

  function updateProgress() {
    if (videoRef.value) {
      currentTime.value = videoRef.value.currentTime
    }
  }

  function onMetadataLoaded() {
    if (videoRef.value) {
      duration.value = videoRef.value.duration
    }
  }

  function togglePlayPause() {
    const video = videoRef.value

    if (!video) {
      return
    }

    if (video.paused) {
      void video.play()
      isPlaying.value = true
      return
    }

    video.pause()
    isPlaying.value = false
  }

  function seek(event: MouseEvent) {
    if (!videoRef.value || !duration.value) {
      return
    }

    const container = event.currentTarget as HTMLElement
    const rect = container.getBoundingClientRect()
    const position = (event.clientX - rect.left) / rect.width
    videoRef.value.currentTime = position * duration.value
  }

  function nextReel() {
    if (reels.value.length < 2) {
      return
    }

    activeIndex.value = (activeIndex.value + 1) % reels.value.length
  }

  function handleVideoEnded() {
    if (reels.value.length > 1) {
      nextReel()
      return
    }

    isPlaying.value = false
  }

  function prevReel() {
    if (reels.value.length < 2) {
      return
    }

    activeIndex.value = (activeIndex.value - 1 + reels.value.length) % reels.value.length
  }

  function exitFullscreen() {
    if (options.onExit) {
      options.onExit()
      return
    }

    if (import.meta.client && window.history.length > 1) {
      window.history.back()
      return
    }

    navigateTo("/")
  }

  function startGesture(clientX: number, clientY: number) {
    gestureStartY.value = clientY
    gestureStartX.value = clientX
    gestureStartedFromLeftEdge.value = clientX <= 40
  }

  function finishGesture(clientX: number, clientY: number) {
    const startY = gestureStartY.value
    const startX = gestureStartX.value
    const startedFromLeftEdge = gestureStartedFromLeftEdge.value
    gestureStartY.value = null
    gestureStartX.value = null
    gestureStartedFromLeftEdge.value = false

    if (startY == null || startX == null) {
      return
    }

    if (feedPostVM.showComments.value) {
      return
    }

    const deltaY = startY - clientY
    const deltaX = clientX - startX

    if (startedFromLeftEdge && deltaX > 82 && Math.abs(deltaX) > Math.abs(deltaY)) {
      exitFullscreen()
      return
    }

    if (Math.abs(deltaY) < 64 || Math.abs(deltaY) < Math.abs(deltaX)) {
      return
    }

    if (deltaY > 0) {
      nextReel()
      return
    }

    prevReel()
  }

  function onPointerDown(event: PointerEvent) {
    if (event.pointerType === "mouse" && event.button !== 0) {
      return
    }

    startGesture(event.clientX, event.clientY)
  }

  function onPointerUp(event: PointerEvent) {
    finishGesture(event.clientX, event.clientY)
  }

  function onTouchStart(event: TouchEvent) {
    const touch = event.changedTouches[0]

    if (!touch) return

    startGesture(touch.clientX, touch.clientY)
  }

  function onTouchEnd(event: TouchEvent) {
    const touch = event.changedTouches[0]

    if (!touch) return

    finishGesture(touch.clientX, touch.clientY)
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

  function handleWheel(event: WheelEvent) {
    if (feedPostVM.showComments.value) {
      return
    }

    event.preventDefault()
    onWheel(event)
  }

  function toggleComments() {
    feedPostVM.showComments.value = !feedPostVM.showComments.value
  }

  watch(
    activeReel,
    () => {
      currentTime.value = 0
      duration.value = 0
      isPlaying.value = true
    },
    { immediate: true },
  )

  if (initialPost && import.meta.client) {
    requestAnimationFrame(() => {
      void fetchReels()
    })
  }
  else {
    void fetchReels()
  }

  return {
    loading,
    errorMessage,
    reels,
    activeIndex,
    activeReel,
    activeMedia,
    videoRef,
    currentTime,
    duration,
    isPlaying,
    progress,
    ...feedPostVM,
    updateProgress,
    onMetadataLoaded,
    togglePlayPause,
    seek,
    handleVideoEnded,
    nextReel,
    prevReel,
    exitFullscreen,
    onPointerDown,
    onPointerUp,
    onTouchStart,
    onTouchEnd,
    handleWheel,
    toggleComments,
  }
}
