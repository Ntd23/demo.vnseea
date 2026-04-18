<template>
  <article class="overflow-hidden rounded-[30px] border border-[#dbe3f2] bg-white shadow-[0_14px_34px_rgba(15,35,110,0.08)]">
    <div class="border-b border-[#eef2fb] px-5 py-4">
      <div class="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <div class="flex flex-wrap items-center gap-2 text-[12px] font-semibold">
            <span class="inline-flex items-center rounded-full bg-[#eef3ff] px-3 py-1.5 text-[#243b63]">
              <Icon name="i-ph-bookmark-simple-fill" class="mr-1.5 h-4 w-4 text-[#0000ff]" />
              {{ entry.savedAtLabel }}
            </span>

            <NuxtLink
              :to="entry.sourceTo"
              class="inline-flex items-center rounded-full border border-[#dbe3f2] bg-[#f8fbff] px-3 py-1.5 text-[#4b5f82] transition hover:border-[#c8d6f2] hover:text-[#0000ff]"
            >
              {{ entry.sourceLabel }}
            </NuxtLink>

            <span class="inline-flex items-center rounded-full border border-[#dbe3f2] bg-white px-3 py-1.5 text-slate-500">
              {{ entry.collectionLabel }}
            </span>
          </div>

          <p class="mt-3 max-w-[760px] text-[14px] leading-6 text-slate-500">
            {{ entry.note }}
          </p>
        </div>

        <button
          class="inline-flex h-11 shrink-0 items-center justify-center rounded-full border border-rose-200 bg-rose-50 px-4 text-[13px] font-bold text-rose-600 transition hover:-translate-y-0.5 hover:border-rose-300 hover:bg-rose-100"
          type="button"
          @click="$emit('remove', entry.id)"
        >
          <Icon name="i-ph-bookmark-simple" class="mr-2 h-4 w-4" />
          Bỏ lưu
        </button>
      </div>
    </div>

    <div class="px-4 py-4 sm:px-5 sm:py-5">
      <FeedPostCard :post="entry.post" />
    </div>
  </article>
</template>

<script setup lang="ts">
import type { MockSavedPostEntry } from "~/composables/useMockSavedPostsData"

defineProps<{
  entry: MockSavedPostEntry
}>()

defineEmits<{
  remove: [id: string]
}>()
</script>
