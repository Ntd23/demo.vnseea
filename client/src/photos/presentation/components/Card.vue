<!-- English description: Renders a mapped photo record from API-backed feed media instead of the previous mock gallery entry type. -->
<template>
  <article
    class="photo-card group overflow-hidden rounded-[24px] border border-[var(--border-light)] bg-[var(--bg-surface)] shadow-[var(--shadow-md)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[var(--shadow-lg)]"
  >
    <!-- Image — click to open lightbox -->
    <button class="block w-full text-left" type="button" @click="$emit('open', photo.id)">
      <div class="relative overflow-hidden">
        <img
          :alt="photo.title"
          :src="photo.image"
          class="w-full object-cover transition duration-500 group-hover:scale-105"
          :class="frameClass"
          loading="lazy"
        >
        <!-- Dark overlay -->
        <div class="absolute inset-0 bg-[linear-gradient(to_top,color-mix(in_srgb,var(--bg-media)_78%,transparent)_0%,transparent_55%)]" />

        <!-- Single category badge top-left -->
        <span class="absolute left-3 top-3 rounded-[10px] bg-[color-mix(in_srgb,var(--bg-media)_50%,transparent)] px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.12em] text-[var(--text-media)] backdrop-blur-sm">
          {{ photo.albumTitle }}
        </span>

        <!-- Engagement badge top-right -->
        <span class="absolute right-3 top-3 flex items-center gap-1 rounded-[10px] bg-[color-mix(in_srgb,var(--bg-media)_40%,transparent)] px-2.5 py-1 text-[11px] font-black text-[var(--text-media)] backdrop-blur-sm">
          <Icon name="i-ph-heart-fill" class="h-3 w-3 text-rose-400" />
          {{ formattedEngagement }}
        </span>

        <!-- Bottom: title + location only -->
        <div class="absolute inset-x-0 bottom-0 p-3.5 text-[var(--text-media)]">
          <p class="photo-card-title font-black leading-tight text-[1rem] sm:text-[1.05rem]">
            {{ photo.title }}
          </p>
          <p class="mt-1 text-[11.5px] font-semibold text-[var(--text-media-muted)]">
            <Icon name="i-ph-map-pin-fill" class="mr-0.5 inline h-3 w-3" />{{ photo.location }}
          </p>
        </div>
      </div>
    </button>

    <!-- Card footer: minimal — just photographer + one action -->
    <div class="flex items-center gap-3 px-4 py-3">
      <!-- Avatar initials -->
      <div
        class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[11px] font-black text-[var(--text-inverse)]"
        :style="{ background: `linear-gradient(135deg, var(--color-primary-900), var(--bg-brand))` }"
      >
        {{ photo.photographer.charAt(0) }}
      </div>

      <!-- Name + role -->
      <div class="min-w-0 flex-1">
        <p class="truncate text-[13px] font-extrabold text-[var(--text-primary)]">{{ photo.photographer }}</p>
        <p class="truncate text-[11px] text-[var(--text-tertiary)]">{{ photo.photographerRole }}</p>
      </div>

      <!-- Single CTA: open lightbox -->
      <button
        class="shrink-0 inline-flex h-8 items-center gap-1.5 rounded-full bg-[var(--bg-brand)] px-3.5 text-[12px] font-black text-[var(--text-inverse)] shadow-[var(--shadow-brand)] transition hover:-translate-y-0.5 active:scale-95"
        type="button"
        @click="$emit('open', photo.id)"
      >
        <Icon name="i-ph-arrows-out-simple-bold" class="h-3.5 w-3.5" />
        {{ openLabel }}
      </button>
    </div>
  </article>
</template>

<script setup lang="ts">
import type { PhotoRecord } from "../../application/composables/usePhotosData"
import { formatPhotoNumber, getPhotoEngagement } from "../../application/composables/usePhotosData"

const { locale } = useI18n()

const props = defineProps<{
  photo: PhotoRecord
  photographerLabel: string
  openLabel: string
  detailLabel: string
}>()

defineEmits<{ open: [id: string] }>()

const frameClass = computed(() => {
  switch (props.photo.frame) {
    case "landscape": return "aspect-[16/10]"
    case "square":    return "aspect-square"
    case "tall":      return "aspect-[4/6]"
    default:          return "aspect-[4/5]"
  }
})

const formattedEngagement = computed(() =>
  formatPhotoNumber(getPhotoEngagement(props.photo), locale.value),
)
</script>

<style scoped>
.photo-card-title {
  display: -webkit-box;
  overflow: hidden;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}
</style>
