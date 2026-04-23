<template>
  <aside class="surface-card p-5 sm:p-6">
    <div class="flex items-center justify-between gap-4">
      <div>
        <p class="text-label-primary text-secondary-500 uppercase tracking-widest">{{ t("pages.watchPage.relatedEyebrow") }}</p>
        <h2 class="mt-1 text-heading text-secondary-900">{{ t("pages.watchPage.relatedTitle") }}</h2>
      </div>
      <UBadge
        :label="videos.length.toString()"
        size="md"
        variant="subtle"
        color="primary"
        class="rounded-full px-3 font-bold"
      />
    </div>

    <div class="mt-6 space-y-4">
      <button
        v-for="video in videos"
        :key="video.id"
        class="group w-full rounded-2xl border p-2.5 text-left transition-all duration-300"
        :class="video.id === selectedId 
          ? 'border-primary-500 bg-primary-50 ring-1 ring-primary-500' 
          : 'border-secondary-100 bg-white hover:border-primary-200 hover:bg-secondary-50/50'"
        type="button"
        @click="$emit('select', video.id)"
      >
        <div class="grid grid-cols-[120px_minmax(0,1fr)] gap-4 sm:grid-cols-[160px_minmax(0,1fr)] xl:grid-cols-1">
          <div class="relative aspect-video overflow-hidden rounded-xl border border-secondary-100/50">
            <NuxtImg
              :alt="video.title"
              class="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
              :src="video.cover"
              loading="lazy"
              format="webp"
            />
            <span class="absolute bottom-2 right-2 rounded-lg bg-black/70 px-1.5 py-0.5 text-[10px] font-black text-white backdrop-blur-sm">
              {{ video.duration }}
            </span>
          </div>
          <div class="min-w-0 py-1 flex flex-col justify-center xl:justify-start">
            <h3 class="line-clamp-2 text-sm sm:text-base font-black leading-snug text-secondary-900 group-hover:text-primary-600 transition-colors">{{ video.title }}</h3>
            <p class="mt-1 text-xs font-bold text-secondary-400 uppercase tracking-tight">{{ video.author }}</p>
            <div class="mt-2 flex items-center gap-2 text-[11px] font-semibold text-secondary-400">
              <span>{{ t("pages.watchPage.viewsCount", { count: formatWatchNumber(video.views, locale) }) }}</span>
              <span class="text-secondary-200">•</span>
              <span>{{ video.date }}</span>
            </div>
            <div class="mt-3 flex flex-wrap gap-2">
              <UBadge
                :label="video.categoryLabel"
                size="xs"
                variant="soft"
                color="primary"
                class="rounded-full px-2 font-black text-[9px] uppercase"
              />
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
