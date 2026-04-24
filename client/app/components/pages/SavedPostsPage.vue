<template>
  <div class="mx-auto max-w-[1280px] space-y-10 pb-24 px-4 sm:px-6 pt-4">
    <!-- Hero Section -->
    <section class="surface-card overflow-hidden ring-1 ring-secondary-200/50 shadow-2xl bg-gradient-to-br from-secondary-950 via-secondary-900 to-primary-950 text-white relative group/hero">
      <!-- Premium Decorations -->
      <div class="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(var(--color-primary-500-rgb),0.15),transparent_40%),radial-gradient(circle_at_bottom_left,rgba(0,0,0,0.2),transparent_40%)]" />
      <div class="absolute top-0 right-0 w-80 h-80 bg-primary-500/10 rounded-full blur-[100px] -mr-40 -mt-40 pointer-events-none transition-transform duration-1000 group-hover/hero:scale-110" />

      <div class="relative px-8 py-14 sm:px-12 lg:px-16 space-y-14">
        <div class="flex flex-col gap-10 lg:flex-row lg:items-end lg:justify-between">
          <div class="max-w-[820px] space-y-6">
            <p class="text-[10px] font-black uppercase tracking-[0.4em] text-primary-400 pl-1">
              {{ t("pages.savedPostsPage.heroEyebrow") }}
            </p>
            <h1 class="text-5xl sm:text-6xl font-black leading-none tracking-tight text-white italic">
              {{ t("pages.savedPostsPage.heroTitle") }}
            </h1>
            <p class="text-base font-medium leading-relaxed text-secondary-300 sm:text-lg pl-0.5 max-w-2xl italic">
              "{{ t("pages.savedPostsPage.heroDescription") }}"
            </p>
          </div>

          <div class="flex flex-wrap gap-4 pt-4 lg:pt-0">
            <UButton
              to="/home"
              size="xl"
              class="h-14 rounded-2xl bg-white/5 text-white font-black text-[11px] uppercase tracking-widest ring-1 ring-white/20 hover:bg-white/10 backdrop-blur-xl transition-all active:scale-95 px-8"
            >
              <template #leading>
                <Icon name="i-ph-house-line-duotone" class="h-5 w-5" />
              </template>
              {{ t("pages.savedPostsPage.backToFeed") }}
            </UButton>

            <UButton
              v-if="visibleSavedPosts.length > 0"
              size="xl"
              class="h-14 rounded-2xl bg-red-600 text-white font-black text-[11px] uppercase tracking-widest shadow-2xl shadow-red-500/20 transition-all hover:bg-red-700 active:scale-95 px-8"
              @click="removeAll"
            >
              <template #leading>
                <Icon name="i-ph-trash-duotone" class="h-5 w-5" />
              </template>
              {{ t("pages.savedPostsPage.removeAll") }}
            </UButton>
          </div>
        </div>

        <div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <article
            v-for="item in summaryStats"
            :key="item.label"
            class="group/stat surface-card rounded-[2rem] border border-white/10 bg-white/5 p-8 backdrop-blur-3xl ring-1 ring-white/10 transition-all duration-500 hover:bg-white/10 hover:ring-primary-400/30"
          >
            <div class="flex items-center justify-between">
              <p class="text-[9px] font-black uppercase tracking-[0.4em] text-white/40 group-hover/stat:text-primary-300 transition-colors">
                {{ item.label }}
              </p>
              <Icon :name="item.icon" class="h-4 w-4 text-white/20 group-hover/stat:text-primary-400 transition-all" />
            </div>
            
            <p class="mt-8 text-4xl font-black text-white leading-none tracking-tighter">
              {{ item.value }}
            </p>
            <p class="mt-4 text-[10px] font-bold text-white/30 group-hover/stat:text-white/50 italic line-clamp-1">
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
      class="surface-card overflow-hidden ring-1 ring-secondary-200/50 shadow-2xl bg-white group/list relative"
    >
      <div class="absolute inset-0 bg-gradient-to-b from-primary-500/5 to-transparent pointer-events-none opacity-0 group-hover/list:opacity-100 transition-opacity duration-1000" />
      
      <div class="relative z-10 flex flex-col gap-8 border-b border-secondary-100/50 p-10 sm:p-12 sm:flex-row sm:items-center sm:justify-between">
        <div class="space-y-4">
          <p class="text-[10px] font-black uppercase tracking-[0.4em] text-[var(--text-primary)] pl-1">
            {{ t("pages.savedPostsPage.listEyebrow") }}
          </p>
          <h2 class="text-4xl font-black text-[var(--text-primary)] tracking-tight leading-none">
            {{ t("pages.savedPostsPage.listTitle", { count: visibleSavedPosts.length }) }}
          </h2>
          <p class="text-base font-medium leading-relaxed text-[var(--text-primary)] italic max-w-2xl px-0.5 opacity-70">
            {{ t("pages.savedPostsPage.listDescription") }}
          </p>
        </div>

        <UButton
          to="/search"
          size="xl"
          class="h-14 rounded-2xl bg-primary-600 text-white font-black text-[11px] uppercase tracking-widest shadow-xl shadow-primary-600/20 transition-all hover:bg-primary-700 active:scale-95 px-10"
        >
          <template #leading>
            <Icon name="i-ph-magnifying-glass-duotone" class="h-5 w-5" />
          </template>
          {{ t("pages.savedPostsPage.findMore") }}
        </UButton>
      </div>

      <div class="relative z-10 divide-y divide-secondary-100/30">
        <div 
          v-for="item in visibleSavedPosts" 
          :key="item.id"
          class="p-6 sm:p-12 transition-all hover:bg-primary-50/10 group/item"
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
