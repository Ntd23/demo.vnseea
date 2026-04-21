<template>
  <article class="overflow-hidden rounded-[28px] border border-[#dbe3f2] bg-white shadow-[0_14px_32px_rgba(15,35,110,0.06)]">
    <button class="group block w-full text-left" type="button" @click="$emit('open', photo.id)">
      <div class="relative overflow-hidden">
        <img
          :alt="photo.title"
          :src="photo.image"
          class="w-full object-cover transition duration-300 group-hover:scale-[1.03]"
          :class="frameClass"
        >
        <div class="absolute inset-0 bg-[linear-gradient(180deg,rgba(15,23,42,0.04),rgba(15,23,42,0.8))]" />

        <div class="absolute left-3 top-3 flex flex-wrap gap-2">
          <span class="rounded-full bg-white/88 px-3 py-1 text-[10px] font-black uppercase tracking-[0.16em] text-[#243b63]">
            {{ photo.albumTitle }}
          </span>
          <span class="rounded-full bg-black/24 px-3 py-1 text-[10px] font-black uppercase tracking-[0.16em] text-white backdrop-blur">
            {{ photo.location }}
          </span>
        </div>

        <div class="absolute inset-x-0 bottom-0 p-4 text-white">
          <div class="flex items-end justify-between gap-3">
            <div class="min-w-0">
              <p class="truncate text-[1.05rem] font-black leading-tight sm:text-[1.15rem]">{{ photo.title }}</p>
              <p class="mt-1 truncate text-[12px] font-semibold text-white/76">
                {{ photo.photographer }} · {{ photo.timeLabel }}
              </p>
            </div>
            <div class="shrink-0 rounded-[18px] bg-black/28 px-3 py-2 text-right backdrop-blur">
              <p class="text-[10px] font-black uppercase tracking-[0.12em] text-white/70">{{ t("pages.photosPage.cardReachLabel") }}</p>
              <p class="mt-0.5 text-[13px] font-black">{{ formattedEngagement }}</p>
            </div>
          </div>
        </div>
      </div>
    </button>

    <div class="p-4">
      <div class="flex items-start justify-between gap-3">
        <div class="min-w-0">
          <p class="text-[10px] font-black uppercase tracking-[0.16em] text-slate-400">{{ photographerLabel }}</p>
          <p class="truncate text-[13px] font-extrabold text-[#243b63]">{{ photo.photographer }}</p>
          <p class="mt-1 truncate text-[12px] font-semibold text-slate-500">{{ photo.photographerRole }}</p>
        </div>

        <div class="shrink-0 rounded-[18px] bg-[#f8fbff] px-3 py-2 text-right text-[#243b63]">
          <p class="text-[10px] font-black uppercase tracking-[0.12em] text-slate-400">{{ t("pages.photosPage.cardCommentsLabel") }}</p>
          <p class="mt-0.5 text-[13px] font-black">{{ formattedComments }}</p>
        </div>
      </div>

      <div class="mt-3 flex flex-wrap gap-2">
        <span
          v-for="tag in photo.tags"
          :key="tag"
          class="rounded-full bg-[#eef4ff] px-3 py-1.5 text-[11px] font-black text-[#0000ff]"
        >
          {{ tag }}
        </span>
      </div>

      <div class="mt-4 flex flex-col gap-2 sm:flex-row">
        <button
          class="inline-flex h-10 w-full items-center justify-center gap-2 rounded-full bg-[#0000ff] px-4 text-[12px] font-black text-white shadow-[0_12px_24px_rgba(0,0,255,0.18)] sm:flex-1"
          type="button"
          @click="$emit('open', photo.id)"
        >
          <Icon name="i-ph-arrows-out-simple-bold" class="h-4 w-4" />
          {{ openLabel }}
        </button>

        <NuxtLink
          :to="photo.companionTo"
          class="inline-flex h-10 w-full items-center justify-center gap-2 rounded-full border border-[#dbe3f2] bg-white px-4 text-[12px] font-black text-[#243b63] transition hover:border-[#c8d6f2] hover:text-[#0000ff] sm:flex-1"
        >
          <Icon name="i-ph-arrow-up-right-bold" class="h-4 w-4" />
          {{ detailLabel }}
        </NuxtLink>
      </div>
    </div>
  </article>
</template>

<script setup lang="ts">
import type { MockPhoto } from "~/composables/useMockPhotosData"
import { formatPhotoNumber, getPhotoEngagement } from "~/composables/useMockPhotosData"

const { locale, t } = useI18n()

const props = defineProps<{
  photo: MockPhoto
  photographerLabel: string
  openLabel: string
  detailLabel: string
}>()

defineEmits<{ open: [id: string] }>()

const frameClass = computed(() => {
  switch (props.photo.frame) {
    case "landscape":
      return "aspect-[16/10]"
    case "square":
      return "aspect-square"
    case "tall":
      return "aspect-[4/6]"
    default:
      return "aspect-[4/5]"
  }
})

const formattedComments = computed(() =>
  formatPhotoNumber(props.photo.comments, locale.value),
)

const formattedEngagement = computed(() =>
  formatPhotoNumber(getPhotoEngagement(props.photo), locale.value),
)
</script>
