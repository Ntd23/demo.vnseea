<template>
  <div class="mx-auto max-w-[1440px] space-y-5 px-3 pb-16 sm:px-5 lg:px-6">
    <section
      class="overflow-hidden rounded-[28px] border border-[#dbe3f2] bg-white shadow-[0_16px_36px_rgba(15,35,110,0.07)]"
      aria-labelledby="memories-hero-title"
    >
      <div class="grid gap-6 p-5 sm:p-6 xl:grid-cols-[minmax(0,1fr)_460px] xl:items-stretch">
        <div class="flex min-w-0 flex-col justify-between gap-8 rounded-[24px] bg-[linear-gradient(135deg,#f8fbff_0%,#eef5ff_100%)] p-5 ring-1 ring-[#dbe3f2] sm:p-7">
          <div class="space-y-4">
            <div class="flex flex-wrap items-center gap-2">
              <span class="inline-flex h-8 items-center rounded-full bg-white px-3 text-[12px] font-semibold text-primary-700 ring-1 ring-primary-100">
                {{ t("pages.memoriesPage.heroEyebrow") }}
              </span>
              <span class="inline-flex h-8 items-center rounded-full bg-primary-600 px-3 text-[12px] font-semibold text-white">
                {{ heroMainStat.value }} {{ heroMainStat.label }}
              </span>
            </div>

            <div class="space-y-3">
              <h1
                id="memories-hero-title"
                class="max-w-[760px] text-[34px] font-extrabold leading-tight text-[var(--text-primary)] sm:text-[48px]"
              >
                {{ t("pages.memoriesPage.heroTitle") }}
              </h1>
              <p class="max-w-xl text-[15px] font-medium leading-7 text-slate-600">
                {{ t("pages.memoriesPage.heroDescription") }}
              </p>
            </div>
          </div>

          <div class="grid gap-3 sm:grid-cols-[auto_auto_1fr] sm:items-center">
            <NuxtLink
              :to="appRoutes.feed"
              class="inline-flex h-12 items-center justify-center rounded-[12px] border border-secondary-200 bg-white px-5 text-[14px] font-semibold text-[var(--text-primary)] transition hover:border-primary-200 hover:bg-primary-50 hover:text-primary-700 active:scale-95"
            >
              <Icon name="i-ph-house-line-duotone" class="mr-2 h-5 w-5 shrink-0" />
              {{ t("pages.memoriesPage.homeFeed") }}
            </NuxtLink>

            <NuxtLink
              :to="appRoutes.savedPosts"
              class="inline-flex h-12 items-center justify-center rounded-[12px] bg-primary-600 px-5 text-[14px] font-semibold text-white shadow-[0_4px_14px_rgba(0,0,255,0.2)] transition hover:bg-primary-700 active:scale-95"
            >
              <Icon name="i-ph-bookmark-simple-duotone" class="mr-2 h-5 w-5 shrink-0" />
              {{ t("pages.memoriesPage.savedPosts") }}
            </NuxtLink>
          </div>
        </div>

        <div class="grid gap-3">
          <div class="rounded-[24px] border border-[#dbe3f2] bg-[#0f172a] p-5 text-white shadow-[0_18px_40px_rgba(15,23,42,0.14)]">
            <div class="flex items-start justify-between gap-4">
              <div>
                <p class="text-[11px] font-semibold uppercase tracking-[0.06em] text-white/52">
                  {{ heroMainStat.label }}
                </p>
                <p class="mt-2 text-[34px] font-extrabold leading-none">
                  {{ heroMainStat.value }}
                </p>
                <p class="mt-3 max-w-[320px] text-[13px] font-semibold leading-6 text-white/68">
                  {{ heroMainStat.description }}
                </p>
              </div>

              <div class="flex h-14 w-14 shrink-0 items-center justify-center rounded-[18px] bg-white text-[#0f172a]">
                <Icon name="i-ph-clock-counter-clockwise-fill" class="h-7 w-7" />
              </div>
            </div>
          </div>

          <div class="grid gap-3 sm:grid-cols-3 xl:grid-cols-1">
            <article
              v-for="item in heroSecondaryStats"
              :key="item.label"
              class="rounded-[20px] border border-[#dbe3f2] bg-white p-4"
            >
              <p class="text-[10px] font-semibold uppercase tracking-[0.06em] text-slate-400">
                {{ item.label }}
              </p>
              <p class="mt-2 text-[26px] font-extrabold leading-none text-[var(--text-primary)]">
                {{ item.value }}
              </p>
              <p class="mt-2 text-[12px] font-semibold leading-5 text-slate-500">
                {{ item.description }}
              </p>
            </article>
          </div>
        </div>
      </div>
    </section>

    <!-- Main Feed Section -->
    <section class="overflow-hidden rounded-[24px] border border-[#dbe3f2] bg-white shadow-[0_12px_32px_rgba(15,35,110,0.06)]">
      <div class="flex flex-col gap-4 border-b border-secondary-100 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
        <div class="space-y-1">
          <p class="text-[11px] font-semibold uppercase tracking-[0.06em] text-slate-400">
            {{ t("pages.memoriesPage.statMemories") }}
          </p>
          <h2 class="text-[22px] font-extrabold leading-tight text-[var(--text-primary)] sm:text-[26px]">
            {{ t("pages.memoriesPage.sectionTitle", { count: memoryEntries.length }) }}
          </h2>
          <p class="max-w-2xl text-[13px] font-medium leading-6 text-slate-500">
            {{ t("pages.memoriesPage.sectionDescription") }}
          </p>
        </div>

        <button
          v-if="sharedMemoryCount > 0"
          type="button"
          class="inline-flex h-10 shrink-0 items-center justify-center rounded-[12px] border border-secondary-200 bg-secondary-50 px-4 text-[12px] font-semibold text-[var(--text-primary)] transition hover:border-primary-200 hover:bg-white hover:text-primary-700 active:scale-95"
          @click="resetSharedMemories"
        >
          <Icon name="i-ph-arrow-counter-clockwise-duotone" class="mr-2 h-4 w-4 shrink-0" />
          {{ t("pages.memoriesPage.resetSharing") }}
        </button>
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
const { t, locale } = useI18n()

const sharedMemoryIds = ref<string[]>([])

const sharedMemoryCount = computed(() => sharedMemoryIds.value.length)
const formatCount = (value: number) =>
  value.toLocaleString(locale.value === "vi" ? "vi-VN" : "en-US")

const summaryCards = computed(() => {
  const interactionCount = memoryEntries.value.reduce(
    (sum, item) => sum + item.post.stats.likes + item.post.stats.comments + item.post.stats.shares,
    0,
  )

  return [
    {
      label: t("pages.memoriesPage.statMemories"),
      value: formatCount(memoryEntries.value.length),
      description: t("pages.memoriesPage.statMemoriesDescription"),
    },
    {
      label: t("pages.memoriesPage.statYears"),
      value: formatCount(new Set(memoryEntries.value.map(item => item.yearOffset)).size),
      description: t("pages.memoriesPage.statYearsDescription"),
    },
    {
      label: t("pages.memoriesPage.statShared"),
      value: formatCount(sharedMemoryCount.value),
      description: t("pages.memoriesPage.statSharedDescription"),
    },
    {
      label: t("pages.memoriesPage.statInteractions"),
      value: formatCount(interactionCount),
      description: t("pages.memoriesPage.statInteractionsDescription"),
    },
  ]
})

const heroMainStat = computed(() => summaryCards.value[0])
const heroSecondaryStats = computed(() => summaryCards.value.slice(1))

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
