<!-- Description: Renders the Nuxt home feed in the same section order as the legacy Wowonder home template. -->
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
      <FeedStoryCarousel />
    </div>

    <section class="home-feed__section surface-card">
      <div class="home-feed__announcement">
        <div class="home-feed__announcement-icon">
          <Icon name="i-ph-megaphone-simple-duotone" class="h-5 w-5" />
        </div>
        <div class="home-feed__announcement-copy">
          <p class="home-feed__eyebrow">{{ copy.announcementEyebrow }}</p>
          <h2 class="home-feed__title">{{ widgets[1]?.title ?? copy.announcementTitle }}</h2>
          <p class="home-feed__body">
            {{ widgets[1]?.items?.[0]?.title ?? copy.announcementMessage }}
          </p>
        </div>
      </div>
    </section>

    <div class="home-feed__publisher">
      <FeedPublisherBox />
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
import FeedPostCard from "../components/PostCard.vue"
import FeedPublisherBox from "../components/FeedPublisherBox.vue"
import FeedStoryCarousel from "../components/StoryCarousel.vue"
import { useMockSocialData } from "../../application/composables/useMockSocialData"

type FeedFilterKey = "all" | "text" | "photos" | "video" | "music"
type FeedOrderKey = "all" | "following"

const { t, locale } = useI18n()
const { posts, widgets } = useMockSocialData()

const copy = computed(() => {
  if (locale.value === "en") {
    return {
      filterEyebrow: "Feed filters",
      filterTitle: "Choose what appears first",
      filterHint: "Mirrors the legacy filter row before stories and posts.",
      announcementEyebrow: "Announcement",
      announcementTitle: "Platform update",
      announcementMessage: "Check the latest notice before continuing with stories and feed updates.",
      orderEyebrow: "Order posts by",
      orderTitle: "Switch the feed rhythm",
      greetingEyebrow: "Greeting",
      morning: "Good morning, welcome back.",
      afternoon: "Good afternoon, here is what changed today.",
      evening: "Good evening, catch up with the latest posts.",
      greetingDescription: "The greeting banner stays above the post stack, just like the PHP timeline flow.",
      filters: {
        all: "All",
        text: "Text",
        photos: "Photos",
        video: "Video",
        music: "Music",
      },
      orders: {
        all: {
          label: "All posts",
          description: "Show the full mixed feed.",
        },
        following: {
          label: "People I follow",
          description: "Focus on people you already follow.",
        },
      },
      extraPostOne: "We have aligned the feed shell to the legacy order so stories, publisher, greeting, and load-more flow now stay in the same visual rhythm.",
      extraPostTwo: "This mock entry keeps the home timeline populated after filters change, helping the page behave more like the PHP feed with mixed post types.",
    }
  }

  return {
    filterEyebrow: "Bộ lọc bảng tin",
    filterTitle: "Chọn loại nội dung hiển thị trước",
    filterHint: "Giữ đúng hàng filter của giao diện PHP trước stories và post list.",
    announcementEyebrow: "Thông báo",
    announcementTitle: "Cập nhật hệ thống",
    announcementMessage: "Xem nhanh thông báo mới trước khi tiếp tục với stories và bảng tin.",
    orderEyebrow: "Sắp xếp bài viết",
    orderTitle: "Đổi nhịp hiển thị của feed",
    greetingEyebrow: "Lời chào",
    morning: "Chào buổi sáng, mời bạn xem cập nhật mới.",
    afternoon: "Chào buổi chiều, đây là những gì vừa thay đổi hôm nay.",
    evening: "Chào buổi tối, cùng xem lại các bài viết mới nhất.",
    greetingDescription: "Khối chào mừng vẫn nằm ngay trên luồng bài viết, giống nhịp bố cục của timeline PHP.",
    filters: {
      all: "Tất cả",
      text: "Văn bản",
      photos: "Ảnh",
      video: "Video",
      music: "Âm nhạc",
    },
    orders: {
      all: {
        label: "Tất cả bài viết",
        description: "Hiển thị toàn bộ feed đang có.",
      },
      following: {
        label: "Người tôi theo dõi",
        description: "Ưu tiên các kết nối bạn đang theo dõi.",
      },
    },
    extraPostOne: "Home feed đã được kéo lại theo đúng thứ tự của bản PHP để stories, publisher, greeting và load-more nằm cùng một nhịp hiển thị.",
    extraPostTwo: "Bài mô phỏng này giữ cho bảng tin vẫn có đủ nội dung khi đổi filter, giúp hành vi trang gần hơn với feed Wowonder cũ.",
  }
})

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
const pageSize = 2
const page = ref(1)
const loadingMore = ref(false)

let newPostTimer: ReturnType<typeof setTimeout>

const feedPosts = computed(() => [
  ...posts,
  {
    id: 101,
    author: locale.value === "en" ? "VNSEEA Product" : "VNSEEA Product",
    role: locale.value === "en" ? "Migration note" : "Ghi chú migration",
    audience: locale.value === "en" ? "Public" : "Công khai",
    time: locale.value === "en" ? "1 hour ago" : "1 giờ trước",
    text: copy.value.extraPostOne,
    tags: ["Home", "Parity"],
    stats: { likes: 43, comments: 11, shares: 4 },
    media: "single" as const,
    comments: [
      {
        id: 1011,
        author: locale.value === "en" ? "Team Shell" : "Team Shell",
        role: locale.value === "en" ? "Frontend" : "Frontend",
        text: locale.value === "en"
          ? "The middle column now follows the same flow as the PHP feed."
          : "Cột giữa giờ đã đi đúng nhịp hiển thị của feed PHP.",
      },
    ],
  },
  {
    id: 102,
    author: locale.value === "en" ? "Community Desk" : "Bàn cộng đồng",
    role: locale.value === "en" ? "Daily recap" : "Tổng hợp hằng ngày",
    audience: locale.value === "en" ? "Members" : "Thành viên",
    time: locale.value === "en" ? "2 hours ago" : "2 giờ trước",
    text: copy.value.extraPostTwo,
    tags: ["Stories", "Filter"],
    stats: { likes: 28, comments: 7, shares: 2 },
    comments: [
      {
        id: 1021,
        author: locale.value === "en" ? "QA Review" : "QA Review",
        role: locale.value === "en" ? "Manual test" : "Manual test",
        text: locale.value === "en"
          ? "Good enough for parity checks on section order and load-more placement."
          : "Đủ để đối chiếu thứ tự section và vị trí load-more khi QA parity.",
      },
    ],
  },
])

const filteredPosts = computed(() => {
  const source = activeOrder.value === "following"
    ? feedPosts.value.filter(post => post.id !== 102)
    : feedPosts.value

  switch (activeFilter.value) {
    case "text":
      return source.filter(post => !post.media)
    case "photos":
      return source.filter(post => post.media === "double" || post.media === "single")
    case "video":
      return source.filter(post => post.id === 101 || post.id === 2)
    case "music":
      return source.filter(post => post.id === 1 || post.id === 102)
    default:
      return source
  }
})

const visiblePosts = computed(() => filteredPosts.value.slice(0, page.value * pageSize))
const allLoaded = computed(() => visiblePosts.value.length >= filteredPosts.value.length)

const greetingTitle = computed(() => {
  const hour = new Date().getHours()
  if (hour < 12) return copy.value.morning
  if (hour < 18) return copy.value.afternoon
  return copy.value.evening
})

watch([activeFilter, activeOrder], () => {
  page.value = 1
})

onMounted(() => {
  newPostTimer = setTimeout(() => {
    newPostsCount.value = 3
  }, 8000)
})

onUnmounted(() => clearTimeout(newPostTimer))

function loadNewPosts() {
  newPostsCount.value = 0
}

async function loadMore() {
  loadingMore.value = true
  await new Promise(resolve => setTimeout(resolve, 800))
  page.value += 1
  loadingMore.value = false
}
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
