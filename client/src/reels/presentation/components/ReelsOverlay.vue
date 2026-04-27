<template>
  <div class="pointer-events-none absolute inset-0 flex items-end">
    <div class="grid w-full grid-cols-[minmax(0,1fr)_56px] items-end gap-2 px-3 pb-[calc(1rem+env(safe-area-inset-bottom,0px))] sm:grid-cols-[minmax(0,1fr)_76px] sm:gap-3 sm:px-5 sm:pb-6">
      <div class="pointer-events-auto min-w-0 pb-1 sm:pb-2">
        <div class="flex min-w-0 items-center gap-3">
          <UAvatar
            :src="reel.avatar"
            :alt="reel.author"
            size="md"
            class="shrink-0 rounded-full ring-2 ring-primary-500"
          />

          <div class="min-w-0">
            <div class="flex min-w-0 items-center gap-2">
              <p class="truncate text-[14px] font-extrabold text-white">
                {{ reel.author }}
              </p>
              <button
                class="shrink-0 rounded-full border border-white/16 bg-white/14 px-2.5 py-1 text-[11px] font-bold text-white backdrop-blur-md transition hover:bg-white hover:text-[var(--text-primary)] sm:px-3"
                type="button"
              >
                {{ $t("pages.reelsPage.follow") }}
              </button>
            </div>
            <p class="mt-0.5 truncate text-[12px] font-semibold text-white/62">
              {{ reel.subtitle }}
            </p>
          </div>
        </div>

        <h2 class="mt-3 line-clamp-2 max-w-[min(100%,360px)] text-[1.18rem] font-black leading-[1.08] text-white drop-shadow-[0_2px_16px_rgba(0,0,0,0.55)] sm:mt-4 sm:text-[1.65rem]">
          {{ reel.title }}
        </h2>
        <p class="mt-1.5 line-clamp-2 max-w-[min(100%,340px)] text-[12px] font-medium leading-[1.45] text-white/78 drop-shadow-[0_2px_14px_rgba(0,0,0,0.55)] sm:mt-2 sm:text-[13px] sm:leading-[1.55]">
          {{ reel.description }}
        </p>

        <div class="mt-2.5 flex max-w-[min(100%,340px)] items-center gap-2 rounded-full border border-white/10 bg-black/28 px-3 py-1.5 text-[11px] font-semibold text-white/75 backdrop-blur-md sm:mt-3 sm:py-2 sm:text-[12px]">
          <Icon name="i-ph-music-notes-fill" class="h-3.5 w-3.5 shrink-0 text-primary-300" />
          <span class="truncate">{{ reel.music }}</span>
        </div>

        <div class="mt-2.5 hidden flex-wrap gap-2 min-[390px]:flex sm:mt-3">
          <span
            v-for="tag in reel.tags"
            :key="tag"
            class="rounded-full bg-white/12 px-3 py-1 text-[11px] font-bold text-white/86 backdrop-blur-md"
          >
            {{ tag }}
          </span>
        </div>
      </div>

      <div class="pointer-events-auto flex flex-col items-center gap-2 pb-1 sm:gap-3">
        <button
          v-for="item in actionItems"
          :key="item.label"
          class="group/action flex w-12 flex-col items-center gap-1 sm:w-[64px] sm:gap-1.5"
          type="button"
          :aria-label="item.label"
        >
          <span class="flex h-10 w-10 items-center justify-center rounded-full border border-white/12 bg-black/36 text-white shadow-[0_8px_26px_rgba(0,0,0,0.25)] backdrop-blur-md transition-all duration-200 group-hover/action:-translate-y-0.5 group-hover/action:bg-white group-hover/action:text-[var(--text-primary)] sm:h-12 sm:w-12">
            <Icon :name="item.icon" class="h-4.5 w-4.5 sm:h-5.5 sm:w-5.5" />
          </span>
          <span class="max-w-12 truncate text-center text-[10px] font-extrabold leading-none text-white drop-shadow-[0_2px_10px_rgba(0,0,0,0.65)] sm:max-w-[64px] sm:text-[11px]">
            {{ item.value }}
          </span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { formatReelCompact } from "../../domain/services/reels-format.service"
import type { Reel } from "../../domain/types/reels.types"

const props = defineProps<{
  reel: Reel
}>()

const { t, locale } = useI18n()

const formatCompact = (value: number) => formatReelCompact(value, locale.value)

const actionItems = computed(() => [
  {
    label: t("pages.reelsPage.like"),
    value: formatCompact(props.reel.likes),
    icon: "i-ph-heart-fill",
  },
  {
    label: t("pages.reelsPage.comment"),
    value: formatCompact(props.reel.comments),
    icon: "i-ph-chat-circle-text-fill",
  },
  {
    label: t("pages.reelsPage.share"),
    value: formatCompact(props.reel.shares),
    icon: "i-ph-share-network-fill",
  },
  {
    label: t("pages.reelsPage.save"),
    value: t("pages.reelsPage.save"),
    icon: "i-ph-bookmark-simple-fill",
  },
])
</script>
