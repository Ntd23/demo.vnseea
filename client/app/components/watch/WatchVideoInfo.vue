<template>
  <section class="rounded-[26px] border border-[var(--border-default)] bg-white p-4 shadow-[var(--shadow-md)] sm:rounded-[30px] sm:p-5">
    <div class="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
      <div class="min-w-0">
        <h2 class="text-[1.7rem] font-black leading-[1.1] text-[var(--text-primary)] sm:text-3xl">{{ video.title }}</h2>
        <p class="mt-2 text-[14px] font-semibold text-[var(--text-secondary)]">
          {{ t("pages.watchPage.viewsCount", { count: formatWatchNumber(video.views, locale) }) }} · {{ video.date }}
        </p>
      </div>

      <div class="scrollbar-hide -mx-1 flex gap-2 overflow-x-auto px-1 pb-1 sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0 sm:pb-0">
        <button
          class="inline-flex h-10 shrink-0 items-center gap-2 rounded-[var(--radius-full)] px-3.5 text-[12.5px] font-extrabold transition sm:h-11 sm:px-4 sm:text-[13px]"
          :class="liked ? 'bg-[var(--color-primary-500)] text-white shadow-[var(--shadow-brand)]' : 'bg-[var(--bg-surface-hover)] text-[var(--text-secondary)] hover:bg-[var(--color-primary-50)] hover:text-[var(--color-primary-600)]'"
          type="button"
          @click="$emit('like')"
        >
          <Icon name="i-ph-thumbs-up-fill" class="h-4 w-4" />
          {{ formatWatchNumber(video.likes + localLikes) }}
        </button>
        <button
          class="inline-flex h-10 shrink-0 items-center gap-2 rounded-[var(--radius-full)] bg-[var(--bg-surface-hover)] px-3.5 text-[12.5px] font-extrabold text-[var(--text-secondary)] transition hover:bg-[var(--color-primary-50)] hover:text-[var(--color-primary-600)] sm:h-11 sm:px-4 sm:text-[13px]"
          type="button"
          @click="$emit('share')"
        >
          <Icon name="i-ph-share-network-fill" class="h-4 w-4" />
          {{ t("pages.watchPage.share") }}
        </button>
      </div>
    </div>

    <div class="mt-4 flex items-center gap-3 rounded-[22px] bg-[var(--bg-surface-hover)] p-3.5 sm:mt-5 sm:rounded-[24px] sm:p-4">
      <div class="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-[12px] font-black text-white sm:h-12 sm:w-12 sm:text-[13px]" :style="{ background: video.authorGradient }">
        {{ video.authorInitials }}
      </div>
      <div class="min-w-0">
        <p class="truncate text-[14px] font-extrabold text-[var(--text-primary)] sm:text-[15px]">{{ video.author }}</p>
        <p class="text-[12px] font-semibold text-[var(--text-tertiary)]">{{ t("pages.watchPage.creatorMeta") }}</p>
      </div>
    </div>

    <p class="mt-4 text-[14px] font-semibold leading-6 text-[var(--text-secondary)] sm:mt-5 sm:text-[15px] sm:leading-7">{{ video.description }}</p>
    <div class="mt-4 flex flex-wrap gap-2">
      <span v-for="tag in video.tags" :key="tag" class="rounded-[var(--radius-full)] bg-[var(--color-primary-50)] px-3 py-1.5 text-[11px] font-extrabold text-[var(--color-primary-600)] sm:text-[12px]">
        {{ tag }}
      </span>
    </div>

    <div v-if="shareMessage" class="mt-4 rounded-[18px] bg-[var(--color-primary-50)] px-4 py-3 text-[13px] font-bold text-[var(--color-primary-600)]">
      {{ shareMessage }}
    </div>
  </section>
</template>

<script setup lang="ts">
import type { WatchVideo } from "~/composables/useMockWatchData"
import { formatWatchNumber } from "~/composables/useMockWatchData"

const { t, locale } = useI18n()

defineProps<{
  video: WatchVideo
  liked: boolean
  localLikes: number
  shareMessage: string
}>()

defineEmits<{ like: []; share: [] }>()
</script>

<style scoped>
.scrollbar-hide {
  scrollbar-width: none;
}

.scrollbar-hide::-webkit-scrollbar {
  display: none;
}
</style>
