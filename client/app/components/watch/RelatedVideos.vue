<template>
  <aside class="rounded-[26px] border border-[var(--border-default)] bg-white p-3.5 shadow-[var(--shadow-md)] sm:rounded-[30px] sm:p-4">
    <div class="flex items-center justify-between gap-3">
      <div>
        <p class="text-label-secondary text-[var(--text-tertiary)]">{{ t("pages.watchPage.relatedEyebrow") }}</p>
        <h2 class="mt-1 text-heading text-[var(--text-primary)]">{{ t("pages.watchPage.relatedTitle") }}</h2>
      </div>
      <span class="rounded-[var(--radius-full)] bg-[var(--color-primary-50)] px-3 py-1.5 text-[12px] font-extrabold text-[var(--color-primary-600)]">
        {{ videos.length }}
      </span>
    </div>

    <div class="mt-4 space-y-3">
      <button
        v-for="video in videos"
        :key="video.id"
        class="w-full rounded-[20px] border p-2 text-left transition sm:rounded-[22px]"
        :class="video.id === selectedId ? 'border-[var(--border-strong)] bg-[var(--color-primary-50)]' : 'border-[var(--border-default)] bg-white hover:bg-[var(--bg-surface-hover)]'"
        type="button"
        @click="$emit('select', video.id)"
      >
        <div class="grid grid-cols-[112px_minmax(0,1fr)] gap-3 sm:grid-cols-[140px_minmax(0,1fr)] xl:grid-cols-1">
          <div class="relative h-24 overflow-hidden rounded-[18px] sm:h-full xl:h-28">
            <img :alt="video.title" class="h-full w-full object-cover" :src="video.cover">
            <span class="absolute bottom-2 right-2 rounded-[var(--radius-full)] bg-black/60 px-2 py-1 text-[11px] font-bold text-white">
              {{ video.duration }}
            </span>
          </div>
          <div class="min-w-0">
            <h3 class="line-clamp-2 text-[14px] font-extrabold leading-5 text-[var(--text-primary)]">{{ video.title }}</h3>
            <p class="mt-1 text-[12px] font-semibold text-[var(--text-secondary)]">{{ video.author }}</p>
            <p class="mt-1 text-[12px] font-semibold text-[var(--text-tertiary)]">{{ t("pages.watchPage.viewsCount", { count: formatWatchNumber(video.views, locale) }) }} · {{ video.date }}</p>
            <div class="mt-2 flex flex-wrap gap-1.5">
              <span class="rounded-[var(--radius-full)] bg-[var(--color-primary-50)] px-2 py-1 text-[10px] font-black text-[var(--color-primary-600)]">{{ video.categoryLabel }}</span>
            </div>
          </div>
        </div>
      </button>
    </div>
  </aside>
</template>

<script setup lang="ts">
import type { WatchVideo } from "~/composables/useMockWatchData"
import { formatWatchNumber } from "~/composables/useMockWatchData"

const { t, locale } = useI18n()

defineProps<{
  videos: ReadonlyArray<WatchVideo>
  selectedId: string
}>()

defineEmits<{ select: [id: string] }>()
</script>
