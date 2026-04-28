<template>
  <div class="mx-auto max-w-[1440px] space-y-5 px-3 pb-16 sm:px-5 lg:px-6">
    <section
      class="overflow-hidden rounded-[28px] border border-[#dbe3f2] bg-white shadow-[0_16px_36px_rgba(15,35,110,0.07)]"
      aria-labelledby="saved-posts-hero-title"
    >
      <div class="grid gap-6 p-5 sm:p-6 xl:grid-cols-[minmax(0,1fr)_460px] xl:items-stretch">
        <div class="flex min-w-0 flex-col justify-between gap-8 rounded-[24px] bg-[linear-gradient(135deg,#f8fbff_0%,#eef5ff_100%)] p-5 ring-1 ring-[#dbe3f2] sm:p-7">
          <div class="space-y-4">
            <div class="flex flex-wrap items-center gap-2">
              <span class="inline-flex h-8 items-center rounded-full bg-white px-3 text-[12px] font-extrabold text-primary-700 ring-1 ring-primary-100">
                {{ t("pages.savedPostsPage.heroEyebrow") }}
              </span>
              <span class="inline-flex h-8 items-center rounded-full bg-primary-600 px-3 text-[12px] font-extrabold text-white">
                {{ heroMainStat.value }} {{ heroMainStat.label }}
              </span>
            </div>

            <div class="space-y-3">
              <h1
                id="saved-posts-hero-title"
                class="max-w-[760px] text-[34px] font-black leading-tight text-[var(--text-primary)] sm:text-[48px]"
              >
                {{ t("pages.savedPostsPage.heroTitle") }}
              </h1>
              <p class="max-w-xl text-[15px] font-medium leading-7 text-slate-600">
                {{ t("pages.savedPostsPage.heroDescription") }}
              </p>
            </div>
          </div>

          <div class="grid gap-3 sm:grid-cols-[auto_auto_1fr] sm:items-center">
            <NuxtLink
              to="/home"
              class="inline-flex h-12 items-center justify-center rounded-[16px] border border-secondary-200 bg-white px-5 text-[14px] font-black text-[var(--text-primary)] transition hover:border-primary-200 hover:bg-primary-50 hover:text-primary-700 active:scale-95"
            >
              <Icon name="i-ph-house-line-duotone" class="mr-2 h-5 w-5 shrink-0" />
              {{ t("pages.savedPostsPage.backToFeed") }}
            </NuxtLink>

            <button
              v-if="visibleSavedPosts.length > 0"
              type="button"
              class="inline-flex h-12 items-center justify-center rounded-[16px] bg-primary-600 px-5 text-[14px] font-black text-white shadow-[0_14px_26px_rgba(37,99,235,0.2)] transition hover:bg-primary-700 active:scale-95"
              @click="removeAll"
            >
              <Icon name="i-ph-trash-duotone" class="mr-2 h-5 w-5 shrink-0" />
              {{ t("pages.savedPostsPage.removeAll") }}
            </button>
            <NuxtLink
              v-else
              to="/explore"
              class="inline-flex h-12 items-center justify-center rounded-[16px] bg-primary-600 px-5 text-[14px] font-black text-white shadow-[0_14px_26px_rgba(37,99,235,0.2)] transition hover:bg-primary-700 active:scale-95"
            >
              <Icon name="i-ph-compass-duotone" class="mr-2 h-5 w-5 shrink-0" />
              {{ t("pages.savedPostsPage.goToExplore") }}
            </NuxtLink>
          </div>
        </div>

        <div class="grid gap-3">
          <div class="rounded-[24px] border border-[#dbe3f2] bg-[#0f172a] p-5 text-white shadow-[0_18px_40px_rgba(15,23,42,0.14)]">
            <div class="flex items-start justify-between gap-4">
              <div>
                <p class="text-[11px] font-extrabold uppercase text-white/52">
                  {{ heroMainStat.label }}
                </p>
                <p class="mt-2 text-[34px] font-black leading-none">
                  {{ heroMainStat.value }}
                </p>
                <p class="mt-3 max-w-[320px] text-[13px] font-semibold leading-6 text-white/68">
                  {{ heroMainStat.description }}
                </p>
              </div>

              <div class="flex h-14 w-14 shrink-0 items-center justify-center rounded-[18px] bg-white text-[#0f172a]">
                <Icon name="i-ph-bookmark-simple-fill" class="h-7 w-7" />
              </div>
            </div>
          </div>

          <div class="grid gap-3 sm:grid-cols-3 xl:grid-cols-1">
            <article
              v-for="item in heroSecondaryStats"
              :key="item.label"
              class="rounded-[20px] border border-[#dbe3f2] bg-white p-4"
            >
              <p class="text-[10px] font-extrabold uppercase text-slate-500">
                {{ item.label }}
              </p>
              <p class="mt-2 text-[26px] font-black leading-none text-[var(--text-primary)]">
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
import SavedPostCard from "../components/PostCard.vue"
import { useMockSavedPostsData } from "../../application/composables/useMockSavedPostsData"

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
      description: t("pages.savedPostsPage.statSavedDescription"),
    },
    {
      label: t("pages.savedPostsPage.statAuthors"),
      value: formatCount(authors.size),
      description: t("pages.savedPostsPage.statAuthorsDescription"),
    },
    {
      label: t("pages.savedPostsPage.statCollections"),
      value: formatCount(collections.size),
      description: t("pages.savedPostsPage.statCollectionsDescription"),
    },
    {
      label: t("pages.savedPostsPage.statInteractions"),
      value: formatCount(interactionCount),
      description: t("pages.savedPostsPage.statInteractionsDescription"),
    },
  ]
})

const heroMainStat = computed(() => summaryStats.value[0])

const heroSecondaryStats = computed(() => summaryStats.value.slice(1))

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
