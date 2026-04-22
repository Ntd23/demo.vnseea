<template>
  <div class="mx-auto max-w-[1280px] space-y-6 pb-10">
    <section class="overflow-hidden rounded-[32px] border border-[#dbe3f2] bg-white shadow-[0_16px_36px_rgba(15,35,110,0.07)]">
      <div class="relative overflow-hidden px-5 py-6 sm:px-7">
        <div class="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(0,0,255,0.12),transparent_32%),radial-gradient(circle_at_bottom_left,rgba(56,189,248,0.14),transparent_30%)]" />

        <div class="relative flex flex-col gap-6">
          <div class="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div class="max-w-[780px]">
              <p class="text-[12px] font-black uppercase tracking-[0.22em] text-[#0000ff]/60">
                {{ t("pages.memoriesPage.heroEyebrow") }}
              </p>
              <h1 class="mt-2 text-[2rem] font-black tracking-[-0.05em] text-[#243b63] sm:text-[2.35rem]">
                {{ t("pages.memoriesPage.heroTitle") }}
              </h1>
              <p class="mt-3 text-[14px] leading-7 text-slate-500">
                {{ t("pages.memoriesPage.heroDescription") }}
              </p>
            </div>

            <div class="flex flex-col gap-3 sm:flex-row">
              <NuxtLink
                to="/home"
                class="inline-flex h-11 items-center justify-center rounded-full border border-[#dbe3f2] bg-[#f8fbff] px-4 text-[13px] font-bold text-[#243b63] transition hover:border-[#c8d6f2] hover:text-[#0000ff]"
              >
                <Icon name="i-ph-house-line-fill" class="mr-2 h-4 w-4" />
                {{ t("pages.memoriesPage.homeFeed") }}
              </NuxtLink>

              <button
                v-if="sharedMemoryCount > 0"
                class="inline-flex h-11 items-center justify-center rounded-full bg-[#0000ff] px-5 text-[13px] font-bold text-white shadow-[0_12px_24px_rgba(0,0,255,0.22)] transition hover:-translate-y-0.5 hover:bg-[#0000e0]"
                type="button"
                @click="resetSharedMemories"
              >
                <Icon name="i-ph-arrow-counter-clockwise-bold" class="mr-2 h-4 w-4" />
                {{ t("pages.memoriesPage.resetSharing") }}
              </button>
            </div>
          </div>

          <div class="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <article
              v-for="item in summaryCards"
              :key="item.label"
              class="rounded-[24px] border border-[#edf2fb] bg-[#fbfcff] px-4 py-4"
            >
              <p class="text-[11px] font-black uppercase tracking-[0.16em] text-[#0000ff]/60">
                {{ item.label }}
              </p>
              <p class="mt-2 text-[1.55rem] font-black tracking-[-0.05em] text-[#243b63]">
                {{ item.value }}
              </p>
              <p class="mt-2 text-[13px] leading-6 text-slate-500">
                {{ item.description }}
              </p>
            </article>
          </div>
        </div>
      </div>
    </section>

    <section class="rounded-[30px] border border-[#dbe3f2] bg-white px-5 py-5 shadow-[0_14px_32px_rgba(15,35,110,0.06)]">
      <div class="flex flex-col gap-3 border-b border-[#eef2fb] pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p class="text-[11px] font-black uppercase tracking-[0.18em] text-[#0000ff]/60">
            {{ t("pages.memoriesPage.sectionEyebrow") }}
          </p>
          <h2 class="mt-2 text-[1.45rem] font-black tracking-[-0.04em] text-[#243b63]">
            {{ t("pages.memoriesPage.sectionTitle", { count: memoryEntries.length }) }}
          </h2>
          <p class="mt-2 text-[14px] leading-6 text-slate-500">
            {{ t("pages.memoriesPage.sectionDescription") }}
          </p>
        </div>

        <NuxtLink
          to="/saved-posts"
          class="inline-flex h-11 items-center justify-center rounded-full border border-[#dbe3f2] bg-[#f8fbff] px-4 text-[13px] font-bold text-[#243b63] transition hover:border-[#c8d6f2] hover:text-[#0000ff]"
        >
          <Icon name="i-ph-bookmark-simple-bold" class="mr-2 h-4 w-4" />
          {{ t("pages.memoriesPage.savedPosts") }}
        </NuxtLink>
      </div>

      <div class="mt-5 space-y-5">
        <MemoriesMemoryCard
          v-for="item in memoryEntries"
          :key="item.id"
          :entry="item"
          :shared="sharedMemoryIds.includes(item.id)"
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
