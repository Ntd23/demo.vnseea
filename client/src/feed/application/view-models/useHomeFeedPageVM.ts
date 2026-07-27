// English description: Loads the home feed, merges pending story state, and exposes page-ready actions for the main feed route.

import type { FeedAnnouncement, FeedGreeting, FeedPostRecord, FeedStoryRecord } from "../../domain/types/feed.types"
import { isFeedStoryExpired } from "../../domain/services/story-lifecycle.service"
import { createApiFeedRepository } from "../../infrastructure/repositories/ApiFeedRepository"
import { useHomeFeedOrder } from "../composables/useHomeFeedOrder"
import { usePendingCreatedStories } from "../composables/usePendingCreatedStories"

const HOME_FEED_PAGE_SIZE = 20

export function useHomeFeedPageVM(
  repository = createApiFeedRepository(),
) {
  const { t } = useI18n()

  const copy = computed(() => ({
    announcementEyebrow: t("pages.homeFeedPage.announcementEyebrow"),
    orderEyebrow: t("pages.homeFeedPage.orderEyebrow"),
    orderTitle: t("pages.homeFeedPage.orderTitle"),
    greetingEyebrow: t("pages.homeFeedPage.greetingEyebrow"),
    orders: {
      all: {
        label: t("pages.homeFeedPage.orders.allLabel"),
        description: t("pages.homeFeedPage.orders.allDescription"),
      },
      following: {
        label: t("pages.homeFeedPage.orders.followingLabel"),
        description: t("pages.homeFeedPage.orders.followingDescription"),
      },
    },
  }))

  const orderOptions = computed(() => [
    { key: "all" as const, ...copy.value.orders.all },
    { key: "following" as const, ...copy.value.orders.following },
  ])

  const activeOrder = useHomeFeedOrder()
  const newPostsCount = ref(0)
  const loadingMore = ref(false)
  const posts = ref<FeedPostRecord[]>([])
  const stories = ref<FeedStoryRecord[]>([])
  const announcement = ref<FeedAnnouncement | null>(null)
  const greeting = ref<FeedGreeting | null>(null)
  const hasMore = ref(false)
  const nextOffset = ref<number | null>(null)
  const initialized = ref(false)
  const pendingCreatedStories = usePendingCreatedStories()

  const visiblePosts = computed(() => posts.value)
  const allLoaded = computed(() => !hasMore.value)

  const canDisplayPostInCurrentFeed = (post: FeedPostRecord) => {
    if (activeOrder.value !== "all" && activeOrder.value !== "following") {
      return false
    }

    return Boolean(post)
  }

  const mergePendingStories = (records: FeedStoryRecord[]) => {
    const backendStoryIds = new Set(records.map(story => story.id))
    const retainedPendingStories = pendingCreatedStories.value
      .filter(story =>
        story.id > 0
        && !backendStoryIds.has(story.id)
        && !isFeedStoryExpired(story),
      )
      .filter((story, index, source) =>
        source.findIndex(candidate => candidate.id === story.id) === index,
      )

    pendingCreatedStories.value = retainedPendingStories

    return [
      ...retainedPendingStories,
      ...records,
    ].filter((story, index, source) =>
      source.findIndex(candidate => candidate.id === story.id) === index,
    )
  }

  async function fetchHome(reset = true) {
    const response = await repository.getHome({
      limit: HOME_FEED_PAGE_SIZE,
      afterPostId: reset ? undefined : nextOffset.value ?? undefined,
      followingOnly: activeOrder.value === "following",
    })

    stories.value = mergePendingStories(response.stories)
    announcement.value = response.announcement
    greeting.value = response.greeting
    hasMore.value = response.hasMore
    nextOffset.value = response.nextOffset
    posts.value = reset
      ? response.posts
      : [...posts.value, ...response.posts.filter(post => !posts.value.some(existing => existing.id === post.id))]
  }

  function loadNewPosts() {
    newPostsCount.value = 0
  }

  async function loadMore() {
    if (!hasMore.value || loadingMore.value) {
      return
    }

    loadingMore.value = true

    try {
      await fetchHome(false)
    }
    finally {
      loadingMore.value = false
    }
  }

  async function refreshFeed() {
    newPostsCount.value = 0
    await fetchHome(true)
  }

  async function handlePostCreated(post: FeedPostRecord | null) {
    if (!post) {
      await refreshFeed()
      return
    }

    newPostsCount.value = 0

    if (!canDisplayPostInCurrentFeed(post)) {
      return
    }

    posts.value = [
      post,
      ...posts.value.filter(existing => existing.id !== post.id),
    ]
  }

  watch(activeOrder, async () => {
    if (!initialized.value) {
      return
    }

    await fetchHome(true)
  })

  function removePost(postId: number) {
    posts.value = posts.value.filter(post => post.id !== postId)
  }

  async function initialize() {
    await fetchHome(true)
    initialized.value = true
  }

  return {
    copy,
    orderOptions,
    activeOrder,
    newPostsCount,
    loadingMore,
    stories,
    announcement,
    greeting,
    visiblePosts,
    allLoaded,
    loadNewPosts,
    loadMore,
    handlePostCreated,
    removePost,
    initialize,
  }
}
