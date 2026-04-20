<template>
  <section class="rounded-[30px] border border-[var(--border-default)] bg-white p-5 shadow-[var(--shadow-md)]">
    <div class="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
      <div class="min-w-0">
        <h2 class="text-2xl font-black leading-tight text-[var(--text-primary)] sm:text-3xl">{{ video.title }}</h2>
        <p class="mt-2 text-[14px] font-semibold text-[var(--text-secondary)]">
          {{ t("pages.watchPage.viewsCount", { count: formatWatchNumber(video.views, locale) }) }} · {{ video.date }}
        </p>
      </div>

      <div class="flex flex-wrap gap-2">
        <button
          class="inline-flex h-11 items-center gap-2 rounded-[var(--radius-full)] px-4 text-[13px] font-extrabold transition"
          :class="liked ? 'bg-[var(--color-primary-500)] text-white shadow-[var(--shadow-brand)]' : 'bg-[var(--bg-surface-hover)] text-[var(--text-secondary)] hover:bg-[var(--color-primary-50)] hover:text-[var(--color-primary-600)]'"
          type="button"
          @click="$emit('like')"
        >
          <Icon name="i-ph-thumbs-up-fill" class="h-4 w-4" />
          {{ formatWatchNumber(video.likes + localLikes) }}
        </button>
        <button
          class="inline-flex h-11 items-center gap-2 rounded-[var(--radius-full)] bg-[var(--bg-surface-hover)] px-4 text-[13px] font-extrabold text-[var(--text-secondary)] transition hover:bg-[var(--color-primary-50)] hover:text-[var(--color-primary-600)]"
          type="button"
          @click="$emit('share')"
        >
          <Icon name="i-ph-share-network-fill" class="h-4 w-4" />
          {{ t("pages.watchPage.share") }}
        </button>
      </div>
    </div>

    <div class="mt-5 flex items-center gap-3 rounded-[24px] bg-[var(--bg-surface-hover)] p-4">
      <div class="flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-[13px] font-black text-white" :style="{ background: video.authorGradient }">
        {{ video.authorInitials }}
      </div>
      <div class="min-w-0">
        <p class="truncate text-[15px] font-extrabold text-[var(--text-primary)]">{{ video.author }}</p>
        <p class="text-[12px] font-semibold text-[var(--text-tertiary)]">{{ t("pages.watchPage.creatorMeta") }}</p>
      </div>
    </div>

    <p class="mt-5 text-[15px] font-semibold leading-7 text-[var(--text-secondary)]">{{ video.description }}</p>
    <div class="mt-4 flex flex-wrap gap-2">
      <span v-for="tag in video.tags" :key="tag" class="rounded-[var(--radius-full)] bg-[var(--color-primary-50)] px-3 py-1.5 text-[12px] font-extrabold text-[var(--color-primary-600)]">
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
