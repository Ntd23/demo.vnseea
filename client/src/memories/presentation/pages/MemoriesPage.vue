<!-- Description: Renders the memories page with the PHP-style order of header, friendversaries, then memory posts. -->
<template>
  <div class="mx-auto max-w-[1280px] space-y-5 px-3 pb-16 sm:px-5 lg:px-6">
    <section class="rounded-[26px] border border-[#dbe3f2] bg-white px-5 py-5 shadow-[0_12px_28px_rgba(15,35,110,0.06)]">
      <div class="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div class="space-y-2">
          <p class="text-[11px] font-bold uppercase tracking-[0.08em] text-slate-500">
            {{ t("pages.memoriesPage.heroEyebrow") }}
          </p>
          <h1 class="text-[1.9rem] font-black tracking-[-0.04em] text-[var(--text-primary)] sm:text-[2.2rem]">
            {{ t("pages.memoriesPage.heroTitle") }}
          </h1>
          <p class="max-w-3xl text-[14px] leading-7 text-slate-500">
            {{ t("pages.memoriesPage.heroDescription") }}
          </p>
        </div>

        <div class="flex flex-wrap gap-3">
          <NuxtLink
            :to="appRoutes.feed"
            class="inline-flex h-11 items-center justify-center rounded-[14px] border border-[#dbe3f2] bg-white px-5 text-[13px] font-bold text-[var(--text-primary)] transition hover:border-primary-200 hover:text-primary-700"
          >
            <Icon name="i-ph-house-line-duotone" class="mr-2 h-4 w-4" />
            {{ t("pages.memoriesPage.homeFeed") }}
          </NuxtLink>
          <button
            v-if="sharedMemoryCount > 0"
            type="button"
            class="inline-flex h-11 items-center justify-center rounded-[14px] bg-primary-600 px-5 text-[13px] font-bold text-white shadow-[0_12px_24px_rgba(37,99,235,0.18)] transition hover:-translate-y-0.5 hover:bg-primary-700"
            @click="resetSharedMemories"
          >
            <Icon name="i-ph-arrow-counter-clockwise-duotone" class="mr-2 h-4 w-4" />
            {{ t("pages.memoriesPage.resetSharing") }}
          </button>
        </div>
      </div>
    </section>

    <section class="rounded-[26px] border border-[#dbe3f2] bg-white p-5 shadow-[0_12px_28px_rgba(15,35,110,0.06)]">
      <div class="space-y-2">
        <p class="text-[11px] font-bold uppercase tracking-[0.08em] text-slate-500">
          {{ t("pages.memoriesPage.statYears") }}
        </p>
        <h2 class="text-[1.45rem] font-black tracking-[-0.03em] text-[var(--text-primary)]">
          {{ t("pages.memoriesPage.sectionTitle", { count: memoryEntries.length }) }}
        </h2>
      </div>

      <div class="mt-4 grid gap-4 md:grid-cols-2">
        <article
          v-for="entry in memoryEntries"
          :key="`${entry.id}-friendversary`"
          class="rounded-[22px] border border-[#e2e8f0] bg-[#f8fafc] p-4"
        >
          <p class="text-[11px] font-bold uppercase tracking-[0.08em] text-slate-500">
            {{ entry.happenedOnLabel }}
          </p>
          <h3 class="mt-2 text-lg font-black text-[var(--text-primary)]">
            {{ entry.post.author }}
          </h3>
          <p class="mt-2 text-sm leading-6 text-slate-600">
            {{ entry.reflection }}
          </p>
        </article>
      </div>
    </section>

    <section class="overflow-hidden rounded-[26px] border border-[#dbe3f2] bg-white shadow-[0_12px_28px_rgba(15,35,110,0.06)]">
      <div class="border-b border-[#eef2fb] px-5 py-4">
        <p class="text-[11px] font-bold uppercase tracking-[0.08em] text-slate-500">
          {{ t("pages.memoriesPage.statMemories") }}
        </p>
        <h2 class="mt-2 text-[1.45rem] font-black tracking-[-0.03em] text-[var(--text-primary)]">
          {{ t("pages.memoriesPage.sectionTitle", { count: memoryEntries.length }) }}
        </h2>
        <p class="mt-1 text-[14px] leading-6 text-slate-500">
          {{ t("pages.memoriesPage.sectionDescription") }}
        </p>
      </div>

      <div class="mx-auto max-w-4xl px-4 py-5 sm:px-5">
        <MemoriesMemoryFeed
          :entries="memoryEntries"
          :shared-ids="sharedMemoryIds"
          @share="shareMemory"
        />
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { appRoutes } from "#shared-kernel/application/constants/route-registry"
import MemoriesMemoryFeed from "../components/MemoryFeed.vue"
import { useMockMemoriesData } from "../../application/composables/useMockMemoriesData"

const { memoryEntries } = useMockMemoriesData()
const { t } = useI18n()

const sharedMemoryIds = ref<string[]>([])

const sharedMemoryCount = computed(() => sharedMemoryIds.value.length)

function shareMemory(id: string) {
  if (sharedMemoryIds.value.includes(id)) return
  sharedMemoryIds.value = [...sharedMemoryIds.value, id]
}

function resetSharedMemories() {
  sharedMemoryIds.value = []
}

useSeoMeta({
  title: () => t("pages.memoriesPage.seoTitle"),
  description: () => t("pages.memoriesPage.seoDescription"),
})
</script>
