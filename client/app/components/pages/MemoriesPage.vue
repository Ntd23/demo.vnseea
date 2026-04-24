<template>
  <div class="mx-auto max-w-[1320px] space-y-5 px-3 pb-16 sm:px-5 lg:px-6">
    <section
      class="overflow-hidden rounded-[24px] border border-[#dbe3f2] bg-white shadow-[0_10px_28px_rgba(15,35,110,0.05)]"
      aria-labelledby="memories-hero-title"
    >
      <div class="grid gap-6 p-5 sm:p-6 lg:grid-cols-[minmax(0,1fr)_420px] lg:items-center">
        <div class="max-w-3xl space-y-4">
          <p class="inline-flex h-8 items-center rounded-full bg-primary-50 px-3 text-[12px] font-extrabold text-primary-700 ring-1 ring-primary-100">
            {{ t("pages.memoriesPage.heroEyebrow") }}
          </p>
          <div class="space-y-3">
            <h1
              id="memories-hero-title"
              class="text-[30px] font-black leading-tight text-[var(--text-primary)] sm:text-[38px]"
            >
              {{ t("pages.memoriesPage.heroTitle") }}
            </h1>
            <p class="max-w-2xl text-[14px] font-medium leading-7 text-slate-600 sm:text-[15px]">
              {{ t("pages.memoriesPage.heroDescription") }}
            </p>
          </div>

          <div class="flex flex-col gap-2 pt-1 sm:flex-row">
            <NuxtLink
              to="/home"
              class="inline-flex h-11 items-center justify-center rounded-[14px] border border-secondary-200 bg-white px-4 text-[13px] font-extrabold text-[var(--text-primary)] transition hover:border-primary-200 hover:bg-primary-50 hover:text-primary-700 active:scale-95"
            >
              <Icon name="i-ph-house-line-duotone" class="mr-2 h-4.5 w-4.5 shrink-0" />
              {{ t("pages.memoriesPage.homeFeed") }}
            </NuxtLink>

            <NuxtLink
              to="/saved-posts"
              class="inline-flex h-11 items-center justify-center rounded-[14px] bg-primary-600 px-5 text-[13px] font-extrabold text-white shadow-[0_12px_24px_rgba(37,99,235,0.18)] transition hover:bg-primary-700 active:scale-95"
            >
              <Icon name="i-ph-bookmark-simple-duotone" class="mr-2 h-4.5 w-4.5 shrink-0" />
              {{ t("pages.memoriesPage.savedPosts") }}
            </NuxtLink>
          </div>
        </div>

        <div class="grid grid-cols-2 gap-x-5 gap-y-5 border-t border-secondary-100 pt-5 lg:border-l lg:border-t-0 lg:pl-6 lg:pt-0">
          <article
            v-for="item in summaryCards"
            :key="item.label"
            class="min-w-0"
          >
            <p class="text-[11px] font-extrabold uppercase text-slate-500">
              {{ item.label }}
            </p>
            <p class="mt-2 text-[28px] font-black leading-none text-[var(--text-primary)]">
              {{ item.value }}
            </p>
            <p class="mt-2 text-[12px] font-medium leading-5 text-slate-500">
              {{ item.description }}
            </p>
          </article>
        </div>
      </div>
    </section>

    <!-- Main Feed Section -->
    <section class="overflow-hidden rounded-[24px] border border-[#dbe3f2] bg-white shadow-[0_12px_32px_rgba(15,35,110,0.06)]">
      <div class="flex flex-col gap-4 border-b border-secondary-100 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
        <div class="space-y-1">
          <p class="text-[11px] font-extrabold uppercase text-slate-500">
            {{ t("pages.memoriesPage.statMemories") }}
          </p>
          <h2 class="text-[22px] font-black leading-tight text-[var(--text-primary)] sm:text-[26px]">
            {{ t("pages.memoriesPage.sectionTitle", { count: memoryEntries.length }) }}
          </h2>
          <p class="max-w-2xl text-[13px] font-medium leading-6 text-slate-500">
            {{ t("pages.memoriesPage.sectionDescription") }}
          </p>
        </div>

        <button
          v-if="sharedMemoryCount > 0"
          type="button"
          class="inline-flex h-10 shrink-0 items-center justify-center rounded-[14px] border border-secondary-200 bg-secondary-50 px-4 text-[12px] font-extrabold text-[var(--text-primary)] transition hover:border-primary-200 hover:bg-white hover:text-primary-700 active:scale-95"
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
