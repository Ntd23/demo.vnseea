<template>
  <article class="overflow-hidden rounded-[30px] border border-[#dbe3f2] bg-white shadow-[0_14px_34px_rgba(15,35,110,0.08)]">
    <div class="border-b border-[#eef2fb] px-5 py-4">
      <div class="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <div class="flex flex-wrap items-center gap-2 text-[12px] font-semibold">
            <span class="inline-flex items-center rounded-full bg-[#eef3ff] px-3 py-1.5 text-[#243b63]">
              <Icon name="i-ph-clock-counter-clockwise-bold" class="mr-1.5 h-4 w-4 text-[#0000ff]" />
              {{ entry.memoryLabel }}
            </span>

            <span class="inline-flex items-center rounded-full border border-[#dbe3f2] bg-white px-3 py-1.5 text-slate-500">
              {{ entry.happenedOnLabel }}
            </span>
          </div>

          <p class="mt-3 max-w-[760px] text-[14px] leading-6 text-slate-500">
            {{ entry.reflection }}
          </p>
        </div>

        <button
          class="inline-flex h-11 shrink-0 items-center justify-center rounded-full bg-[#0000ff] px-4 text-[13px] font-bold text-white shadow-[0_12px_24px_rgba(0,0,255,0.22)] transition hover:-translate-y-0.5 hover:bg-[#0000e0]"
          type="button"
          @click="$emit('share', entry.id)"
        >
          <Icon :name="shared ? 'i-ph-check-bold' : 'i-ph-share-network-bold'" class="mr-2 h-4 w-4" />
          {{ shared ? t("pages.memoriesPage.sharedAction") : t("pages.memoriesPage.shareAction") }}
        </button>
      </div>
    </div>

    <div class="px-4 py-4 sm:px-5 sm:py-5">
      <FeedPostCard :post="entry.post" />
    </div>
  </article>
</template>

<script setup lang="ts">
import type { MockMemoryEntry } from "~/composables/useMockMemoriesData"

defineProps<{
  entry: MockMemoryEntry
  shared: boolean
}>()

const { t } = useI18n()

defineEmits<{
  share: [id: string]
}>()
</script>
