<template>
  <div class="mx-auto max-w-[1280px] space-y-8 pb-20 pt-4 px-4 sm:px-6">
    <!-- Hero Section -->
    <section class="surface-card group overflow-hidden border-none ring-1 ring-secondary-100 shadow-2xl relative">
      <div class="relative overflow-hidden px-8 py-10 sm:px-12 sm:py-16">
        <!-- Abstract Background -->
        <div class="pointer-events-none absolute inset-0 opacity-40">
          <div class="absolute -right-20 -top-20 h-96 w-96 rounded-full bg-primary-500/10 blur-[100px]" />
          <div class="absolute -left-20 -bottom-20 h-96 w-96 rounded-full bg-sky-500/10 blur-[100px]" />
        </div>

        <div class="relative flex flex-col gap-10">
          <div class="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
            <div class="max-w-[720px] space-y-4">
              <UBadge
                variant="soft"
                color="primary"
                class="rounded-full font-black text-[10px] uppercase tracking-[0.3em] px-5 py-1.5 ring-1 ring-inset ring-primary-100"
              >
                {{ t("pages.memoriesPage.heroEyebrow") }}
              </UBadge>
              <h1 class="text-4xl sm:text-5xl font-black tracking-tight text-secondary-900 leading-[1.1]">
                {{ t("pages.memoriesPage.heroTitle") }}
              </h1>
              <p class="text-base font-medium leading-relaxed text-secondary-500">
                {{ t("pages.memoriesPage.heroDescription") }}
              </p>
            </div>

            <div class="flex flex-col gap-3 sm:flex-row">
              <UButton
                to="/home"
                size="xl"
                variant="soft"
                color="white"
                class="rounded-2xl font-black text-xs uppercase tracking-widest px-6 h-12 ring-1 ring-secondary-200 hover:ring-primary-500 transition-all bg-white shadow-sm"
              >
                <template #leading>
                  <Icon name="i-ph-house-line-duotone" class="h-5 w-5 text-primary-600" />
                </template>
                {{ t("pages.memoriesPage.homeFeed") }}
              </UButton>

              <UButton
                v-if="sharedMemoryCount > 0"
                size="xl"
                variant="solid"
                color="primary"
                class="rounded-2xl font-black text-xs uppercase tracking-widest px-8 h-12 shadow-xl shadow-primary-500/20 bg-primary-600 hover:bg-primary-700 transition-all active:scale-95"
                @click="resetSharedMemories"
              >
                <template #leading>
                  <Icon name="i-ph-arrow-counter-clockwise-bold" class="h-5 w-5" />
                </template>
                {{ t("pages.memoriesPage.resetSharing") }}
              </UButton>
            </div>
          </div>

          <!-- Summary Stats -->
          <div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <div
              v-for="item in summaryCards"
              :key="item.label"
              class="surface-card p-6 ring-1 ring-secondary-50 bg-secondary-50/10 hover:bg-white hover:ring-primary-100 hover:shadow-xl transition-all duration-500 group/stat"
            >
              <p class="text-[10px] font-black uppercase tracking-[0.3em] text-primary-500 mb-4 transition-transform group-hover/stat:translate-x-1">
                {{ item.label }}
              </p>
              <p class="text-3xl font-black tracking-tight text-secondary-900 mb-2">
                {{ item.value }}
              </p>
              <p class="text-[12px] font-semibold leading-relaxed text-secondary-400 group-hover/stat:text-secondary-500 transition-colors">
                {{ item.description }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Main Feed Section -->
    <section class="space-y-6">
      <div class="flex flex-col gap-4 border-b border-secondary-100 pb-8 sm:flex-row sm:items-center sm:justify-between px-2">
        <div class="space-y-2">
          <div class="flex items-center gap-3">
            <Icon name="i-ph-calendar-duotone" class="h-6 w-6 text-primary-600" />
            <h2 class="text-2xl font-black tracking-tight text-secondary-900">
              {{ t("pages.memoriesPage.sectionTitle", { count: memoryEntries.length }) }}
            </h2>
          </div>
          <p class="text-sm font-medium text-secondary-500 pl-9">
            {{ t("pages.memoriesPage.sectionDescription") }}
          </p>
        </div>

        <UButton
          to="/saved-posts"
          size="lg"
          variant="soft"
          color="white"
          class="rounded-xl font-black text-[10px] uppercase tracking-widest px-6 h-11 bg-white text-secondary-600 ring-1 ring-secondary-200 hover:border-primary-500 hover:text-primary-600 transition-all shadow-sm"
        >
          <template #leading>
            <Icon name="i-ph-bookmark-simple-duotone" class="h-4.5 w-4.5" />
          </template>
          {{ t("pages.memoriesPage.savedPosts") }}
        </UButton>
      </div>

      <div class="mx-auto max-w-4xl">
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
