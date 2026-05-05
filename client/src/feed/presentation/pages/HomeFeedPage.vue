<!-- Description: Renders the home feed in PHP order while sourcing stories, announcement, and posts from real backend bridges instead of mock social data. -->
<template>
  <div class="home-feed">
    <section class="home-feed__section surface-card">
      <div class="home-feed__section-header">
        <div>
          <p class="home-feed__eyebrow">{{ copy.filterEyebrow }}</p>
          <h2 class="home-feed__title">{{ copy.filterTitle }}</h2>
        </div>
        <span class="home-feed__hint">{{ copy.filterHint }}</span>
      </div>

      <div class="home-feed__filter-list">
        <button
          v-for="filter in filters"
          :key="filter.key"
          class="home-feed__filter-chip"
          :class="{ 'home-feed__filter-chip--active': activeFilter === filter.key }"
          type="button"
          @click="activeFilter = filter.key"
        >
          <Icon :name="filter.icon" class="h-4 w-4" />
          <span>{{ filter.label }}</span>
        </button>
      </div>
    </section>

    <div class="home-feed__stories">
      <FeedStoryCarousel :stories="stories" />
    </div>

    <section class="home-feed__section surface-card">
      <div class="home-feed__announcement">
        <div class="home-feed__announcement-icon">
          <Icon name="i-ph-megaphone-simple-duotone" class="h-5 w-5" />
        </div>
        <div class="home-feed__announcement-copy">
          <p class="home-feed__eyebrow">{{ copy.announcementEyebrow }}</p>
          <h2 class="home-feed__title">{{ announcement?.title || copy.announcementTitle }}</h2>
          <p class="home-feed__body">
            {{ announcement?.message || copy.announcementMessage }}
          </p>
        </div>
      </div>
    </section>

    <div class="home-feed__publisher">
      <FeedPublisherBox @created="handlePostCreated" />
    </div>

    <section class="home-feed__section surface-card home-feed__order-card">
      <div class="home-feed__section-header">
        <div>
          <p class="home-feed__eyebrow">{{ copy.orderEyebrow }}</p>
          <h2 class="home-feed__title">{{ copy.orderTitle }}</h2>
        </div>
      </div>

      <div class="home-feed__order-list">
        <button
          v-for="option in orderOptions"
          :key="option.key"
          class="home-feed__order-button"
          :class="{ 'home-feed__order-button--active': activeOrder === option.key }"
          type="button"
          @click="activeOrder = option.key"
        >
          <span class="font-semibold">{{ option.label }}</span>
          <span class="home-feed__order-description">{{ option.description }}</span>
        </button>
      </div>
    </section>

    <section class="home-feed__section surface-card">
      <div class="home-feed__greeting">
        <div>
          <p class="home-feed__eyebrow">{{ copy.greetingEyebrow }}</p>
          <h2 class="home-feed__title">{{ greetingTitle }}</h2>
        </div>
        <p class="home-feed__body">{{ copy.greetingDescription }}</p>
      </div>
    </section>

    <Transition
      enter-active-class="transition duration-300 ease-out"
      enter-from-class="opacity-0 -translate-y-2"
      enter-to-class="opacity-100 translate-y-0"
      leave-active-class="transition duration-150"
      leave-to-class="opacity-0 -translate-y-2"
    >
      <div v-if="newPostsCount > 0" class="home-feed__new-posts">
        <button class="home-feed__new-posts-btn" type="button" @click="loadNewPosts">
          <Icon name="i-ph-arrow-up-bold" class="h-4 w-4" />
          {{ t("pages.homeFeedPage.newPostsButton", { count: newPostsCount }) }}
        </button>
      </div>
    </Transition>

    <div class="home-feed__posts">
      <FeedPostCard v-for="post in visiblePosts" :key="post.id" :post="post" />
    </div>

    <div class="home-feed__load-more">
      <button
        v-if="!allLoaded"
        class="home-feed__load-more-btn"
        :disabled="loadingMore"
        type="button"
        @click="loadMore"
      >
        <Icon v-if="loadingMore" name="i-lucide-loader-2" class="h-4 w-4 animate-spin" />
        <Icon v-else name="i-ph-arrow-down-bold" class="h-4 w-4" />
        {{ loadingMore ? t("pages.homeFeedPage.loadingMore") : t("pages.homeFeedPage.loadMore") }}
      </button>
      <p v-else class="home-feed__all-loaded">{{ t("pages.homeFeedPage.allCaughtUp") }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { FeedAnnouncement, FeedPostRecord, FeedStoryRecord } from "../../domain/types/feed.types"
import { createApiFeedRepository } from "../../infrastructure/repositories/ApiFeedRepository"
import FeedPostCard from "../components/PostCard.vue"
import FeedPublisherBox from "../components/FeedPublisherBox.vue"
import FeedStoryCarousel from "../components/StoryCarousel.vue"

type FeedFilterKey = "all" | "text" | "photos" | "video" | "music"
type FeedOrderKey = "all" | "following"

const { t } = useI18n()
const repository = createApiFeedRepository()

const copy = computed(() => ({
  filterEyebrow: t("pages.homeFeedPage.filterEyebrow"),
  filterTitle: t("pages.homeFeedPage.filterTitle"),
  filterHint: t("pages.homeFeedPage.filterHint"),
  announcementEyebrow: t("pages.homeFeedPage.announcementEyebrow"),
  announcementTitle: t("pages.homeFeedPage.announcementTitle"),
  announcementMessage: t("pages.homeFeedPage.announcementMessage"),
  orderEyebrow: t("pages.homeFeedPage.orderEyebrow"),
  orderTitle: t("pages.homeFeedPage.orderTitle"),
  greetingEyebrow: t("pages.homeFeedPage.greetingEyebrow"),
  morning: t("pages.homeFeedPage.greetingMorning"),
  afternoon: t("pages.homeFeedPage.greetingAfternoon"),
  evening: t("pages.homeFeedPage.greetingEvening"),
  greetingDescription: t("pages.homeFeedPage.greetingDescription"),
  filters: {
    all: t("pages.homeFeedPage.filters.all"),
    text: t("pages.homeFeedPage.filters.text"),
    photos: t("pages.homeFeedPage.filters.photos"),
    video: t("pages.homeFeedPage.filters.video"),
    music: t("pages.homeFeedPage.filters.music"),
  },
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

const filters = computed(() => [
  { key: "all" as const, icon: "i-ph-squares-four-duotone", label: copy.value.filters.all },
  { key: "text" as const, icon: "i-ph-text-align-left-duotone", label: copy.value.filters.text },
  { key: "photos" as const, icon: "i-ph-image-duotone", label: copy.value.filters.photos },
  { key: "video" as const, icon: "i-ph-video-camera-duotone", label: copy.value.filters.video },
  { key: "music" as const, icon: "i-ph-music-notes-duotone", label: copy.value.filters.music },
])

const orderOptions = computed(() => [
  { key: "all" as const, ...copy.value.orders.all },
  { key: "following" as const, ...copy.value.orders.following },
])

const activeFilter = ref<FeedFilterKey>("all")
const activeOrder = ref<FeedOrderKey>("all")
const newPostsCount = ref(0)
const loadingMore = ref(false)
const posts = ref<FeedPostRecord[]>([])
const stories = ref<FeedStoryRecord[]>([])
const announcement = ref<FeedAnnouncement | null>(null)
const hasMore = ref(false)
const nextOffset = ref<number | null>(null)
const initialized = ref(false)
const pendingCreatedStory = useState<FeedStoryRecord | null>("feed-pending-created-story", () => null)

const visiblePosts = computed(() => posts.value)
const allLoaded = computed(() => !hasMore.value)

const resolveGreetingPeriod = () => {
  const hour = new Date().getHours()
  if (hour < 12) return "morning" as const
  if (hour < 18) return "afternoon" as const
  return "evening" as const
}

const greetingPeriod = useState<"morning" | "afternoon" | "evening">(
  "feed-home-greeting-period",
  resolveGreetingPeriod,
)

const greetingTitle = computed(() => {
  if (greetingPeriod.value === "morning") return copy.value.morning
  if (greetingPeriod.value === "afternoon") return copy.value.afternoon
  return copy.value.evening
})

const resolvePostType = (filter: FeedFilterKey) => {
  if (filter === "all") return ""
  return filter
}

const canDisplayPostInCurrentFeed = (post: FeedPostRecord) => {
  if (activeOrder.value !== "all" && activeOrder.value !== "following") {
    return false
  }

  if (activeFilter.value === "all") {
    return true
  }

  if (activeFilter.value === "text") {
    return post.primaryMediaType === "text"
  }

  if (activeFilter.value === "photos") {
    return post.primaryMediaType === "image"
  }

  if (activeFilter.value === "video") {
    return post.primaryMediaType === "video"
  }

  return false
}

const mergePendingStory = (records: FeedStoryRecord[]) => {
  const pendingStory = pendingCreatedStory.value

  if (!pendingStory) {
    return records
  }

  if (records.some(story => story.id === pendingStory.id)) {
    pendingCreatedStory.value = null
    return records
  }

  return [pendingStory, ...records]
}

async function fetchHome(reset = true) {
  const response = await repository.getHome({
    limit: 6,
    afterPostId: reset ? undefined : nextOffset.value ?? undefined,
    postType: resolvePostType(activeFilter.value),
    followingOnly: activeOrder.value === "following",
  })

  stories.value = mergePendingStory(response.stories)
  announcement.value = response.announcement
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
  if (!hasMore.value || loadingMore.value) return

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

await fetchHome(true)
initialized.value = true

onMounted(() => {
  greetingPeriod.value = resolveGreetingPeriod()
})

watch([activeFilter, activeOrder], async () => {
  if (!initialized.value) return
  await fetchHome(true)
})
</script>

<style scoped>
.home-feed {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding-top: 8px;
}

.home-feed__section {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 16px;
}

.home-feed__section-header {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: 12px;
}

.home-feed__eyebrow {
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: rgba(15, 23, 42, 0.48);
}

.home-feed__title {
  font-size: 16px;
  font-weight: 800;
  color: var(--text-primary);
}

.home-feed__hint,
.home-feed__body,
.home-feed__order-description,
.home-feed__all-loaded {
  font-size: 13px;
  line-height: 1.6;
  color: rgba(15, 23, 42, 0.64);
}

.home-feed__filter-list,
.home-feed__order-list {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.home-feed__filter-chip,
.home-feed__order-button,
.home-feed__new-posts-btn,
.home-feed__load-more-btn {
  transition: all 0.2s ease;
}

.home-feed__filter-chip {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  border-radius: 999px;
  border: 1px solid rgba(15, 23, 42, 0.08);
  background: #f8fafc;
  padding: 10px 14px;
  font-size: 13px;
  font-weight: 700;
  color: rgba(15, 23, 42, 0.72);
}

.home-feed__filter-chip--active {
  border-color: rgba(37, 99, 235, 0.22);
  background: rgba(37, 99, 235, 0.08);
  color: #1d4ed8;
}

.home-feed__announcement {
  display: flex;
  gap: 12px;
}

.home-feed__announcement-icon {
  display: flex;
  height: 40px;
  width: 40px;
  align-items: center;
  justify-content: center;
  border-radius: 14px;
  background: rgba(59, 130, 246, 0.12);
  color: #2563eb;
}

.home-feed__announcement-copy,
.home-feed__greeting {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 6px;
}

.home-feed__order-card {
  display: none;
}

.home-feed__order-button {
  display: flex;
  min-width: 220px;
  flex: 1 1 220px;
  flex-direction: column;
  align-items: flex-start;
  gap: 4px;
  border-radius: 18px;
  border: 1px solid rgba(15, 23, 42, 0.08);
  background: #f8fafc;
  padding: 12px 14px;
  color: var(--text-primary);
  text-align: left;
}

.home-feed__order-button--active {
  border-color: rgba(37, 99, 235, 0.24);
  background: rgba(37, 99, 235, 0.08);
}

.home-feed__new-posts,
.home-feed__load-more {
  display: flex;
  justify-content: center;
}

.home-feed__new-posts-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  border-radius: 999px;
  border: 1px solid rgba(37, 99, 235, 0.14);
  background: #ffffff;
  padding: 8px 18px;
  color: #1d4ed8;
  font-size: 13px;
  font-weight: 700;
  box-shadow: 0 8px 24px rgba(37, 99, 235, 0.12);
}

.home-feed__new-posts-btn:hover,
.home-feed__load-more-btn:hover {
  transform: translateY(-1px);
}

.home-feed__posts {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.home-feed__load-more {
  padding: 8px 0 24px;
}

.home-feed__load-more-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  border-radius: 999px;
  border: 1px solid rgba(15, 23, 42, 0.08);
  background: #ffffff;
  padding: 10px 22px;
  color: rgba(15, 23, 42, 0.7);
  font-size: 13px;
  font-weight: 700;
}

.home-feed__load-more-btn:disabled {
  cursor: not-allowed;
  opacity: 0.6;
}

@media (max-width: 767px) {
  .home-feed__order-card {
    display: flex;
  }
}
</style>
