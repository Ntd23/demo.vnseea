<template>
  <div class="mx-auto max-w-[1280px] space-y-8 pb-20">
    <section class="surface-card overflow-hidden ring-1 ring-secondary-200/50 shadow-2xl relative group/hero">
      <div class="relative overflow-hidden px-8 py-10 sm:px-10 sm:py-12">
        <!-- Premium Decorations -->
        <div class="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(37,99,235,0.12),transparent_40%),radial-gradient(circle_at_bottom_left,rgba(5,150,105,0.08),transparent_35%)]" />
        <div class="absolute top-0 right-0 w-80 h-80 bg-primary-500/10 rounded-full blur-[100px] -mr-40 -mt-40 pointer-events-none transition-transform duration-1000 group-hover/hero:scale-110" />

        <div class="relative z-10 flex flex-col gap-10">
          <div class="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
            <div class="max-w-3xl space-y-3">
              <p class="text-[10px] font-black uppercase tracking-[0.4em] text-primary-500 pl-1">
                {{ t("pages.explorePage.heroEyebrow") }}
              </p>
              <h1 class="text-4xl sm:text-5xl font-black tracking-tight text-secondary-900 leading-[1.1]">
                {{ t("pages.explorePage.heroTitle") }}
              </h1>
              <p class="text-[15px] font-medium leading-relaxed text-secondary-500 max-w-2xl pl-0.5">
                {{ t("pages.explorePage.heroDescription") }}
              </p>
            </div>

            <div class="flex flex-col gap-4 sm:flex-row">
              <NuxtLink
                to="/search"
                class="inline-flex h-12 items-center justify-center rounded-2xl border border-secondary-100 bg-white/60 px-6 text-[11px] font-black uppercase tracking-widest text-secondary-600 backdrop-blur-xl transition-all hover:bg-white hover:text-primary-600 hover:border-primary-100 hover:shadow-lg active:scale-95 px-6"
              >
                <Icon name="i-ph-magnifying-glass-duotone" class="mr-2.5 h-4.5 w-4.5" />
                {{ t("pages.explorePage.openSearch") }}
              </NuxtLink>

              <NuxtLink
                to="/home"
                class="inline-flex h-12 items-center justify-center rounded-2xl bg-primary-600 px-8 text-[11px] font-black uppercase tracking-widest text-white shadow-2xl shadow-primary-500/30 transition-all hover:-translate-y-0.5 hover:bg-primary-700 active:scale-95"
              >
                <Icon name="i-ph-house-line-duotone" class="mr-2.5 h-4.5 w-4.5" />
                {{ t("pages.explorePage.homeFeed") }}
              </NuxtLink>
            </div>
          </div>

          <div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            <article
              v-for="item in summaryCards"
              :key="item.label"
              class="surface-card p-5 bg-secondary-50/50 hover:bg-white ring-1 ring-secondary-100 transition-all duration-500 group/card"
            >
              <div class="flex items-start justify-between gap-4">
                <div class="space-y-1">
                  <p class="text-[9px] font-black uppercase tracking-[0.4em] text-primary-500 pl-1">
                    {{ item.label }}
                  </p>
                  <p class="text-3xl font-black tracking-tight text-secondary-900">
                    {{ item.value }}
                  </p>
                </div>

                <div class="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-primary-600 shadow-sm ring-1 ring-secondary-100 transition-transform duration-500 group-hover/card:scale-110 group-hover/card:rotate-6">
                  <Icon :name="item.icon.includes('duotone') ? item.icon : item.icon.replace('-bold', '-duotone')" class="h-6 w-6" />
                </div>
              </div>

              <p class="mt-4 text-[13px] font-medium leading-relaxed text-secondary-500 italic px-1">
                {{ item.description }}
              </p>
            </article>
          </div>

          <!-- Quick Filters Section -->
          <div class="surface-card p-6 bg-white/60 backdrop-blur-xl ring-1 ring-secondary-100 shadow-sm">
            <div class="flex flex-col gap-6 xl:flex-row xl:items-start xl:justify-between">
              <div class="space-y-2">
                <p class="text-[10px] font-black uppercase tracking-[0.4em] text-primary-500 pl-1">
                  {{ t("pages.explorePage.filterEyebrow") }}
                </p>
                <h2 class="text-2xl font-black tracking-tight text-secondary-900 leading-none">
                  {{ activeViewOption.label }}
                </h2>
                <p class="text-[13px] font-medium leading-relaxed text-secondary-500 max-w-2xl px-0.5">
                  {{ activeViewOption.description }}
                </p>
              </div>

              <div class="flex flex-wrap gap-2.5">
                <button
                  v-for="option in exploreViewOptions"
                  :key="option.value"
                  class="h-11 inline-flex items-center justify-center rounded-2xl border px-5 text-[11px] font-black uppercase tracking-widest transition-all active:scale-95"
                  :class="activeView === option.value
                    ? 'border-primary-100 bg-primary-50 text-primary-600 shadow-sm'
                    : 'border-secondary-100 bg-white text-secondary-500 hover:border-primary-100 hover:text-primary-600'"
                  type="button"
                  @click="setView(option.value)"
                >
                  <Icon :name="option.icon.includes('duotone') ? option.icon : option.icon.replace('-bold', '-duotone')" class="mr-2.5 h-4 w-4" />
                  {{ option.label }}
                </button>
              </div>
            </div>

            <div class="mt-6 pt-6 border-t border-secondary-100/50 flex flex-wrap gap-2.5">
              <NuxtLink
                v-for="item in trendingHashtags"
                :key="item.slug"
                :to="item.to"
                class="inline-flex items-center gap-2.5 rounded-xl border border-secondary-100 bg-white/40 px-4 py-2 text-[10px] font-black uppercase tracking-widest text-secondary-500 transition-all hover:bg-primary-50 hover:text-primary-600 hover:border-primary-100 hover:-translate-y-0.5"
              >
                <span>{{ formatHashtagLabel(item.label) }}</span>
                <span class="rounded-lg bg-secondary-100/50 px-2.5 py-1 text-[9px] font-black text-secondary-400 transition-colors group-hover:bg-primary-100 group-hover:text-primary-500">{{ item.score }}</span>
              </NuxtLink>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section
      v-if="!hasContent"
      class="surface-card px-8 py-16 sm:px-10 sm:py-20 ring-1 ring-secondary-200/50 shadow-2xl"
    >
      <div class="mx-auto max-w-2xl text-center space-y-10">
        <FoundationEmptyState
          icon="i-ph-compass-duotone"
          :title="t('pages.explorePage.emptyTitle')"
          :description="t('pages.explorePage.emptyDescription')"
        />

        <div class="flex flex-wrap justify-center gap-4">
          <button
            class="h-12 inline-flex items-center justify-center rounded-2xl bg-primary-600 px-8 text-[11px] font-black uppercase tracking-widest text-white shadow-2xl shadow-primary-500/30 transition-all hover:-translate-y-0.5 hover:bg-primary-700 active:scale-95"
            type="button"
            @click="setView('all')"
          >
            {{ t("pages.explorePage.showAll") }}
          </button>

          <NuxtLink
            to="/search"
            class="h-12 inline-flex items-center justify-center rounded-2xl border border-secondary-100 bg-white px-6 text-[11px] font-black uppercase tracking-widest text-secondary-600 transition-all hover:bg-white hover:text-primary-600 hover:border-primary-100 hover:shadow-lg active:scale-95"
          >
            {{ t("pages.explorePage.goToSearch") }}
          </NuxtLink>
        </div>
      </div>
    </section>

    <section
      v-for="section in visibleSections"
      :key="section.kind"
      class="surface-card p-6 sm:p-8 ring-1 ring-secondary-200/50 shadow-2xl space-y-8"
    >
      <div class="flex flex-col gap-6 border-b border-secondary-100/50 pb-8 sm:flex-row sm:items-center sm:justify-between">
        <div class="space-y-2">
          <p class="text-[9px] font-black uppercase tracking-[0.4em] text-primary-500 pl-1">
            {{ section.label }}
          </p>
          <h2 class="text-3xl font-black tracking-tight text-secondary-900 leading-none">
            {{ section.countLabel }}
          </h2>
          <p class="text-[13px] font-medium leading-relaxed text-secondary-500 max-w-2xl px-0.5 italic">
            {{ section.description }}
          </p>
        </div>

        <button
          v-if="activeView === 'all'"
          class="h-10 inline-flex items-center justify-center rounded-xl border border-secondary-100 bg-secondary-50/50 px-5 text-[10px] font-black uppercase tracking-widest text-secondary-500 transition-all hover:bg-white hover:text-primary-600 hover:border-primary-100 hover:shadow-md active:scale-95"
          type="button"
          @click="setView(section.kind)"
        >
          {{ t("pages.explorePage.onlyView", { label: section.shortLabel }) }}
        </button>
      </div>

      <div v-if="section.kind === 'users'" class="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        <ExploreUserSpotlightCard
          v-for="item in recommendedUsers"
          :key="item.id"
          :user="item"
        />
      </div>

      <div v-else-if="section.kind === 'pages'" class="mt-8 grid gap-8 xl:grid-cols-2">
        <CommunityPageCard
          v-for="item in recommendedPages"
          :key="item.id"
          :page="item"
          :action-label="t('pages.explorePage.openFanpage')"
        />
      </div>

      <div v-else class="mt-8 space-y-6">
        <FeedPostCard
          v-for="item in recommendedPosts"
          :key="item.id"
          :post="item"
        />
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { formatHashtagLabel } from "~/composables/useMockHashtagData"
import type { ExploreView } from "~/composables/useMockExploreData"

type ExploreSection = {
  kind: Exclude<ExploreView, "all">
  label: string
  shortLabel: string
  description: string
  countLabel: string
}

function readQueryValue(value: unknown) {
  if (Array.isArray(value)) return String(value[0] || "")
  return typeof value === "string" ? value : ""
}

const route = useRoute()
const router = useRouter()
const { t } = useI18n()

const {
  exploreViewOptions,
  summaryCards,
  recommendedPosts,
  recommendedUsers,
  recommendedPages,
  trendingHashtags,
} = useMockExploreData()

const normalizeView = (value: string): ExploreView =>
  exploreViewOptions.value.some(option => option.value === value)
    ? value as ExploreView
    : "all"

const activeView = computed<ExploreView>(() =>
  normalizeView(readQueryValue(route.query.view)),
)

const activeViewOption = computed(() =>
  exploreViewOptions.value.find(option => option.value === activeView.value) ?? exploreViewOptions.value[0],
)

const sections = computed<ExploreSection[]>(() => [
  {
    kind: "posts",
    label: t("pages.explorePage.sectionPostsLabel"),
    shortLabel: t("pages.explorePage.sectionPostsShort"),
    description: t("pages.explorePage.sectionPostsDescription"),
    countLabel: t("pages.explorePage.sectionPostsCount", { count: recommendedPosts.value.length }),
  },
  {
    kind: "users",
    label: t("pages.explorePage.sectionUsersLabel"),
    shortLabel: t("pages.explorePage.sectionUsersShort"),
    description: t("pages.explorePage.sectionUsersDescription"),
    countLabel: t("pages.explorePage.sectionUsersCount", { count: recommendedUsers.value.length }),
  },
  {
    kind: "pages",
    label: t("pages.explorePage.sectionPagesLabel"),
    shortLabel: t("pages.explorePage.sectionPagesShort"),
    description: t("pages.explorePage.sectionPagesDescription"),
    countLabel: t("pages.explorePage.sectionPagesCount", { count: recommendedPages.value.length }),
  },
])

const visibleSections = computed(() =>
  activeView.value === "all"
    ? sections.value
    : sections.value.filter(section => section.kind === activeView.value),
)

const hasContent = computed(() =>
  visibleSections.value.some((section) => {
    if (section.kind === "posts") return recommendedPosts.value.length > 0
    if (section.kind === "users") return recommendedUsers.value.length > 0
    return recommendedPages.value.length > 0
  }),
)

function setView(view: ExploreView) {
  const nextQuery = { ...route.query }

  if (view === "all") {
    delete nextQuery.view
  }
  else {
    nextQuery.view = view
  }

  router.replace({ query: nextQuery })
}
</script>
