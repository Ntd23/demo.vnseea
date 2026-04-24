<template>
  <div class="mx-auto max-w-[1280px] space-y-6 px-4 pb-16 pt-4 sm:px-6">
    <section
      class="saved-posts-hero relative overflow-hidden rounded-[32px] px-6 py-7 text-white shadow-[var(--shadow-xl)] sm:px-8 lg:px-10"
      aria-labelledby="saved-posts-hero-title"
    >
      <div class="absolute inset-0 saved-posts-hero-bg" />
      <div class="pointer-events-none absolute inset-0 opacity-20 saved-posts-hero-grid" />
      <div class="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-[linear-gradient(180deg,transparent_0%,rgba(0,0,0,0.12)_100%)]" />

      <div class="relative z-10">
        <div class="grid gap-7 lg:grid-cols-[minmax(0,1fr)_340px] lg:items-stretch">
          <div class="max-w-[760px]">
            <div class="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 backdrop-blur-[4px]">
              <span class="inline-flex h-6 w-6 items-center justify-center rounded-full bg-white/15">
                <Icon name="i-ph-bookmark-simple-fill" class="h-3.5 w-3.5 text-[#fde7b2]" />
              </span>
              <p class="text-[11px] font-bold uppercase tracking-[0.14em] text-white/70">
                {{ t("pages.savedPostsPage.heroEyebrow") }}
              </p>
            </div>

            <h1
              id="saved-posts-hero-title"
              class="mt-5 font-['Be_Vietnam_Pro',sans-serif] text-[2.15rem] font-black leading-[0.98] tracking-[-0.04em] text-white sm:text-[2.9rem] lg:text-[3.15rem]"
            >
              {{ t("pages.savedPostsPage.heroTitle") }}
            </h1>
            <p class="mt-4 max-w-[620px] text-[14.5px] leading-[1.75] text-white/80 sm:text-[16px]">
              {{ t("pages.savedPostsPage.heroDescription") }}
            </p>
          </div>

          <div class="rounded-[24px] border border-white/14 bg-white/10 p-4 backdrop-blur-[6px] lg:self-end">
            <div class="flex items-start gap-3">
              <span class="flex h-11 w-11 shrink-0 items-center justify-center rounded-[16px] bg-white text-[var(--color-primary-700)] shadow-[0_8px_24px_rgba(0,0,0,0.18)]">
                <Icon name="i-ph-bookmarks-fill" class="h-5 w-5" />
              </span>
              <div class="min-w-0">
                <p class="text-[11px] font-bold uppercase tracking-[0.12em] text-white/60">
                  {{ t("pages.savedPostsPage.listEyebrow") }}
                </p>
                <p class="mt-1 font-['Be_Vietnam_Pro',sans-serif] text-[1.65rem] font-black leading-none text-white">
                  {{ formatCount(visibleSavedPosts.length) }}
                </p>
                <p class="mt-1.5 text-[12.5px] leading-[1.5] text-white/70">
                  {{ t("pages.savedPostsPage.listDescription") }}
                </p>
              </div>
            </div>

            <div class="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-1">
              <UButton
                to="/home"
                color="neutral"
                variant="solid"
                size="lg"
                class="h-11 justify-center rounded-[var(--radius-full)] bg-[#fde7b2] px-5 text-[13.5px] font-bold text-[#27345f] shadow-[0_4px_16px_rgba(0,0,0,0.22)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(0,0,0,0.28)]"
              >
                <Icon name="i-ph-house-line-fill" class="h-4 w-4" />
                {{ t("pages.savedPostsPage.backToFeed") }}
              </UButton>

              <UButton
                v-if="visibleSavedPosts.length > 0"
                type="button"
                color="neutral"
                variant="solid"
                size="lg"
                class="h-11 justify-center rounded-[var(--radius-full)] bg-white px-5 text-[13.5px] font-bold text-red-600 shadow-[0_4px_16px_rgba(0,0,0,0.18)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-red-50 hover:shadow-[0_8px_24px_rgba(0,0,0,0.24)]"
                @click="removeAll"
              >
                <Icon name="i-ph-trash-fill" class="h-4 w-4" />
                {{ t("pages.savedPostsPage.removeAll") }}
              </UButton>
            </div>
          </div>
        </div>

        <div class="mt-7 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <article
            v-for="item in summaryStats"
            :key="item.label"
            class="rounded-[20px] border border-white/12 bg-white/10 p-3 backdrop-blur-[6px] sm:p-4"
          >
            <div class="flex items-center gap-2">
              <Icon :name="item.icon" class="h-3.5 w-3.5 text-white/60" />
              <p class="text-[10px] font-bold uppercase tracking-[0.12em] text-white/60">
                {{ item.label }}
              </p>
            </div>

            <p class="mt-1.5 font-['Be_Vietnam_Pro',sans-serif] text-[1.65rem] font-black leading-none text-white sm:text-[2rem]">
              {{ item.value }}
            </p>
            <p class="mt-1 hidden text-[12px] leading-[1.5] text-white/70 sm:block">
              {{ item.description }}
            </p>
          </article>
        </div>
      </div>
    </section>

    <!-- Empty State -->
    <section
      v-if="visibleSavedPosts.length === 0"
      class="surface-card p-20 sm:p-28 ring-1 ring-secondary-200/50 shadow-2xl bg-white relative overflow-hidden"
    >
      <div class="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(var(--color-primary-500-rgb),0.05)_0%,_transparent_70%)]" />
      
      <div class="relative z-10 mx-auto max-w-2xl text-center">
        <div class="flex h-24 w-24 items-center justify-center rounded-[2.5rem] bg-secondary-50 text-secondary-300 ring-4 ring-secondary-50/50 mx-auto mb-10">
          <Icon name="i-ph-bookmark-simple-duotone" class="h-12 w-12" />
        </div>

        <h2 class="text-3xl font-black tracking-tight text-[var(--text-primary)] leading-tight">
          {{ t('pages.savedPostsPage.emptyTitle') }}
        </h2>
        <p class="mt-4 text-base font-medium leading-relaxed text-[var(--text-primary)] max-w-md mx-auto">
          {{ t('pages.savedPostsPage.emptyDescription') }}
        </p>

        <div class="mt-12 flex flex-wrap justify-center gap-4">
          <UButton
            size="xl"
            class="h-14 rounded-2xl bg-primary-600 text-white font-black text-[11px] uppercase tracking-widest shadow-xl shadow-primary-600/20 transition-all active:scale-95 px-12"
            @click="restoreMockData"
          >
            <template #leading>
              <Icon name="i-ph-arrow-counter-clockwise-bold" class="h-5 w-5" />
            </template>
            {{ t("pages.savedPostsPage.restoreMock") }}
          </UButton>

          <UButton
            to="/explore"
            size="xl"
            class="h-14 rounded-2xl bg-white text-[var(--text-primary)] ring-1 ring-secondary-200 hover:bg-secondary-50 hover:text-secondary-900 font-black text-[11px] uppercase tracking-widest transition-all active:scale-95 px-10"
          >
            <template #leading>
              <Icon name="i-ph-compass-duotone" class="h-5 w-5" />
            </template>
            {{ t("pages.savedPostsPage.goToExplore") }}
          </UButton>
        </div>
      </div>
    </section>

    <!-- List Section -->
    <section
      v-else
      class="overflow-hidden rounded-[28px] border border-[var(--border-default)] bg-white shadow-[var(--shadow-lg)]"
    >
      <div class="flex flex-col gap-4 border-b border-[var(--border-light)] px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div class="min-w-0">
          <div class="flex items-center gap-2">
            <span class="inline-flex h-5 w-5 items-center justify-center rounded-[7px] bg-[var(--color-primary-50)]">
              <Icon name="i-ph-bookmarks-fill" class="h-3 w-3 text-[var(--color-primary-600)]" />
            </span>
            <p class="text-[10.5px] font-bold uppercase tracking-[0.12em] text-[var(--text-tertiary)]">
              {{ t("pages.savedPostsPage.listEyebrow") }}
            </p>
          </div>
          <h2 class="mt-1 text-[1.55rem] font-extrabold tracking-[-0.03em] text-[var(--text-primary)] sm:text-[1.9rem]">
            {{ t("pages.savedPostsPage.listTitle", { count: visibleSavedPosts.length }) }}
          </h2>
          <p class="mt-1.5 max-w-2xl text-[13.5px] leading-[1.65] text-[var(--text-secondary)]">
            {{ t("pages.savedPostsPage.listDescription") }}
          </p>
        </div>

        <UButton
          to="/search"
          color="primary"
          variant="solid"
          size="lg"
          class="h-11 shrink-0 rounded-[var(--radius-full)] px-5 text-[13.5px] font-bold shadow-[var(--shadow-brand)] transition-all duration-200 hover:-translate-y-0.5"
        >
          <Icon name="i-ph-magnifying-glass-bold" class="h-4 w-4" />
          {{ t("pages.savedPostsPage.findMore") }}
        </UButton>
      </div>

      <div class="divide-y divide-[var(--border-light)]">
        <div 
          v-for="item in visibleSavedPosts" 
          :key="item.id"
          class="p-4 transition-all hover:bg-[var(--color-primary-50)]/40 sm:p-5"
        >
          <SavedPostCard
            :entry="item"
            @remove="removeSavedPost"
          />
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
const { savedPosts } = useMockSavedPostsData()
const { t, locale } = useI18n()

const removedIds = ref<string[]>([])

const visibleSavedPosts = computed(() =>
  savedPosts.value.filter(item => !removedIds.value.includes(item.id)),
)

const formatCount = (value: number) =>
  value.toLocaleString(locale.value === "vi" ? "vi-VN" : "en-US")

const summaryStats = computed(() => {
  const authors = new Set(visibleSavedPosts.value.map(item => item.post.author))
  const collections = new Set(visibleSavedPosts.value.map(item => item.collectionLabel))
  const interactionCount = visibleSavedPosts.value.reduce(
    (sum, item) => sum + item.post.stats.likes + item.post.stats.comments + item.post.stats.shares,
    0,
  )

  return [
    {
      label: t("pages.savedPostsPage.statSaved"),
      value: formatCount(visibleSavedPosts.value.length),
      icon: "i-ph-bookmarks-duotone",
      description: t("pages.savedPostsPage.statSavedDescription"),
    },
    {
      label: t("pages.savedPostsPage.statAuthors"),
      value: formatCount(authors.size),
      icon: "i-ph-users-three-duotone",
      description: t("pages.savedPostsPage.statAuthorsDescription"),
    },
    {
      label: t("pages.savedPostsPage.statCollections"),
      value: formatCount(collections.size),
      icon: "i-ph-folder-star-duotone",
      description: t("pages.savedPostsPage.statCollectionsDescription"),
    },
    {
      label: t("pages.savedPostsPage.statInteractions"),
      value: formatCount(interactionCount),
      icon: "i-ph-sparkle-duotone",
      description: t("pages.savedPostsPage.statInteractionsDescription"),
    },
  ]
})

function removeSavedPost(id: string) {
  if (removedIds.value.includes(id)) return
  removedIds.value = [...removedIds.value, id]
}

function removeAll() {
  removedIds.value = savedPosts.value.map(item => item.id)
}

function restoreMockData() {
  removedIds.value = []
}

useSeoMeta({
  title: () => t("pages.savedPostsPage.seoTitle"),
  description: () => t("pages.savedPostsPage.seoDescription"),
})
</script>

<style scoped>
.saved-posts-hero-bg {
  background: linear-gradient(135deg, #1a1f8e 0%, #2d3ed4 30%, #4f46e5 62%, #7c3aed 100%);
}

.saved-posts-hero-grid {
  background-image:
    linear-gradient(rgba(255,255,255,0.07) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255,255,255,0.07) 1px, transparent 1px);
  background-size: 40px 40px;
}
</style>
