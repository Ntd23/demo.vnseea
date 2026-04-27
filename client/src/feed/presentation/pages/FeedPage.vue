<template>
  <div class="space-y-5 sm:space-y-6">
    <div class="pt-4 sm:pt-5">
      <FeedStoryCarousel />
    </div>

    <div class="rounded-[1.5rem] border border-[#dbe3f2] bg-white p-3 shadow-[0_10px_26px_rgba(13,38,76,0.04)] sm:rounded-[1.85rem] sm:p-4">
      <FeedPublisherBox />
    </div>

    <Transition enter-active-class="transition duration-300 ease-out" enter-from-class="opacity-0 -translate-y-2" enter-to-class="opacity-100 translate-y-0" leave-active-class="transition duration-150" leave-to-class="opacity-0 -translate-y-2">
      <div v-if="newPostsCount > 0" class="flex justify-center">
        <button class="flex items-center gap-2 rounded-full border border-[#0000ff]/20 bg-white px-4 py-2 text-sm font-semibold text-[#0000ff] shadow-[0_4px_20px_rgba(0,0,255,0.12)] transition hover:bg-[#0000ff] hover:text-white" type="button" @click="loadNewPosts">
          <Icon name="i-ph-arrow-up-bold" class="h-4 w-4" />
          {{ t("pages.homeFeedPage.newPostsButton", { count: newPostsCount }) }}
        </button>
      </div>
    </Transition>

    <div class="space-y-0 sm:space-y-4">
      <FeedPostCard v-for="post in visiblePosts" :key="post.id" :post="post" />
    </div>

    <div class="flex justify-center py-2">
      <button v-if="!allLoaded" class="flex items-center gap-2 rounded-full border border-[#0000ff]/15 bg-white px-6 py-2.5 text-sm font-semibold text-[#0000ff]/70 shadow-[0_2px_12px_rgba(0,0,255,0.07)] transition hover:border-[#0000ff]/30 hover:text-[#0000ff]" :disabled="loadingMore" type="button" @click="loadMore">
        <Icon v-if="loadingMore" name="i-lucide-loader-2" class="h-4 w-4 animate-spin" />
        <Icon v-else name="i-ph-arrow-down-bold" class="h-4 w-4" />
        {{ loadingMore ? t("pages.homeFeedPage.loadingMore") : t("pages.homeFeedPage.loadMore") }}
      </button>
      <p v-else class="text-sm text-[#0000ff]/40">{{ t("pages.homeFeedPage.allCaughtUp") }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useFeedPage } from "../../application/composables/useFeedPage"
import FeedPublisherBox from "../components/FeedPublisherBox.vue"
import FeedPostCard from "../components/PostCard.vue"
import FeedStoryCarousel from "../components/StoryCarousel.vue"

const { t } = useI18n()

const {
  newPostsCount,
  loadingMore,
  visiblePosts,
  allLoaded,
  loadNewPosts,
  loadMore,
} = useFeedPage()
</script>

<style scoped>
.scrollbar-hide { scrollbar-width: none; }
.scrollbar-hide::-webkit-scrollbar { display: none; }
</style>
