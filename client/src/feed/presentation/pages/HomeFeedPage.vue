<template>
  <div class="home-feed">
    <!-- Stories -->
    <div class="home-feed__stories">
      <FeedStoryCarousel />
    </div>

    <!-- Publisher -->
    <div class="home-feed__publisher">
      <FeedPublisherBox />
    </div>

    <!-- New posts banner -->
    <Transition enter-active-class="transition duration-300 ease-out" enter-from-class="opacity-0 -translate-y-2" enter-to-class="opacity-100 translate-y-0" leave-active-class="transition duration-150" leave-to-class="opacity-0 -translate-y-2">
      <div v-if="newPostsCount > 0" class="home-feed__new-posts">
        <button class="home-feed__new-posts-btn" type="button" @click="loadNewPosts">
          <Icon name="i-ph-arrow-up-bold" class="h-4 w-4" />
          {{ t("pages.homeFeedPage.newPostsButton", { count: newPostsCount }) }}
        </button>
      </div>
    </Transition>

    <!-- Posts -->
    <div class="home-feed__posts">
      <FeedPostCard v-for="post in visiblePosts" :key="post.id" :post="post" />
    </div>

    <!-- Load more -->
    <div class="home-feed__load-more">
      <button v-if="!allLoaded" class="home-feed__load-more-btn" :disabled="loadingMore" type="button" @click="loadMore">
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

const { t } = useI18n()

const { posts } = useMockSocialData()

const newPostsCount = ref(0)
let newPostTimer: ReturnType<typeof setTimeout>
onMounted(() => { newPostTimer = setTimeout(() => { newPostsCount.value = 3 }, 8000) })
onUnmounted(() => clearTimeout(newPostTimer))
const loadNewPosts = () => { newPostsCount.value = 0 }
const pageSize = 2
const page = ref(1)
const loadingMore = ref(false)
const visiblePosts = computed(() => posts.slice(0, page.value * pageSize))
const allLoaded = computed(() => visiblePosts.value.length >= posts.length)
const loadMore = async () => { loadingMore.value = true; await new Promise(r => setTimeout(r, 800)); page.value++; loadingMore.value = false }
</script>

<style scoped>
.home-feed {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding-top: 8px;
}

.home-feed__stories {
  /* no extra wrapper needed */
}

.home-feed__publisher {
  /* publisher manages its own card styling */
}

.home-feed__new-posts {
  display: flex;
  justify-content: center;
}

.home-feed__new-posts-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 18px;
  border-radius: 999px;
  border: 1px solid rgba(0, 0, 255, 0.15);
  background: #ffffff;
  color: #0000ff;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  box-shadow: 0 4px 16px rgba(0, 0, 255, 0.1);
  transition: all 0.15s ease;
}

.home-feed__new-posts-btn:hover {
  background: #0000ff;
  color: #ffffff;
  border-color: #0000ff;
}

.home-feed__posts {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.home-feed__load-more {
  display: flex;
  justify-content: center;
  padding: 8px 0 24px;
}

.home-feed__load-more-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 10px 22px;
  border-radius: 999px;
  border: 1px solid rgba(0, 0, 255, 0.1);
  background: #ffffff;
  color: rgba(0, 0, 255, 0.6);
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s ease;
}

.home-feed__load-more-btn:hover {
  border-color: rgba(0, 0, 255, 0.25);
  color: #0000ff;
}

.home-feed__load-more-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.home-feed__all-loaded {
  font-size: 13px;
  color: rgba(0, 0, 255, 0.35);
  font-weight: 500;
}
</style>
