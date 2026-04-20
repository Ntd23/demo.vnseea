<template>
  <div class="mx-auto max-w-[1280px] space-y-6 pb-10 pt-5">
    <section class="overflow-hidden rounded-[32px] border border-[#dbe3f2] bg-white shadow-[0_16px_36px_rgba(15,35,110,0.07)]">
      <div class="relative overflow-hidden px-5 py-6 sm:px-7">
        <div class="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(0,0,255,0.14),transparent_34%),radial-gradient(circle_at_bottom_left,rgba(8,145,178,0.16),transparent_32%)]" />

        <div class="relative flex flex-col gap-6">
          <div class="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div class="max-w-[780px]">
              <p class="text-[12px] font-black uppercase tracking-[0.22em] text-[#0000ff]/60">
                {{ t("pages.explorePage.heroEyebrow") }}
              </p>
              <h1 class="mt-2 text-[2rem] font-black tracking-[-0.05em] text-[#243b63] sm:text-[2.35rem]">
                {{ t("pages.explorePage.heroTitle") }}
              </h1>
              <p class="mt-3 text-[14px] leading-7 text-slate-500">
                {{ t("pages.explorePage.heroDescription") }}
              </p>
            </div>

            <div class="flex flex-col gap-3 sm:flex-row">
              <NuxtLink
                to="/search"
                class="inline-flex h-11 items-center justify-center rounded-full border border-[#dbe3f2] bg-[#f8fbff] px-4 text-[13px] font-bold text-[#243b63] transition hover:border-[#c8d6f2] hover:text-[#0000ff]"
              >
                <Icon name="i-ph-magnifying-glass-bold" class="mr-2 h-4 w-4" />
                {{ t("pages.explorePage.openSearch") }}
              </NuxtLink>

              <NuxtLink
                to="/home"
                class="inline-flex h-11 items-center justify-center rounded-full bg-[#0000ff] px-5 text-[13px] font-bold text-white shadow-[0_12px_24px_rgba(0,0,255,0.22)] transition hover:-translate-y-0.5 hover:bg-[#0000e0]"
              >
                <Icon name="i-ph-house-line-fill" class="mr-2 h-4 w-4" />
                {{ t("pages.explorePage.homeFeed") }}
              </NuxtLink>
            </div>
          </div>

          <div class="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            <article
              v-for="item in summaryCards"
              :key="item.label"
              class="rounded-[24px] border border-[#edf2fb] bg-[#fbfcff] px-4 py-4"
            >
              <div class="flex items-start justify-between gap-3">
                <div>
                  <p class="text-[11px] font-black uppercase tracking-[0.16em] text-[#0000ff]/60">
                    {{ item.label }}
                  </p>
                  <p class="mt-2 text-[1.55rem] font-black tracking-[-0.05em] text-[#243b63]">
                    {{ item.value }}
                  </p>
                </div>

                <span class="flex h-10 w-10 items-center justify-center rounded-[16px] bg-white text-[#0000ff] shadow-[0_10px_20px_rgba(15,35,110,0.08)]">
                  <Icon :name="item.icon" class="h-5 w-5" />
                </span>
              </div>

              <p class="mt-2 text-[13px] leading-6 text-slate-500">
                {{ item.description }}
              </p>
            </article>
          </div>

          <div class="rounded-[28px] border border-white/70 bg-white/75 px-4 py-4 backdrop-blur">
            <div class="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
              <div>
                <p class="text-[11px] font-black uppercase tracking-[0.18em] text-[#0000ff]/60">
                  {{ t("pages.explorePage.filterEyebrow") }}
                </p>
                <h2 class="mt-2 text-[1.4rem] font-black tracking-[-0.04em] text-[#243b63]">
                  {{ activeViewOption.label }}
                </h2>
                <p class="mt-2 max-w-[720px] text-[14px] leading-6 text-slate-500">
                  {{ activeViewOption.description }}
                </p>
              </div>

              <div class="flex flex-wrap gap-2">
                <button
                  v-for="option in exploreViewOptions"
                  :key="option.value"
                  class="inline-flex h-11 items-center justify-center rounded-full border px-4 text-[13px] font-bold transition"
                  :class="activeView === option.value
                    ? 'border-[#0000ff] bg-[#0000ff] text-white shadow-[0_10px_20px_rgba(0,0,255,0.18)]'
                    : 'border-[#dbe3f2] bg-white text-[#243b63] hover:border-[#c8d6f2] hover:text-[#0000ff]'"
                  type="button"
                  @click="setView(option.value)"
                >
                  <Icon :name="option.icon" class="mr-2 h-4 w-4" />
                  {{ option.label }}
                </button>
              </div>
            </div>

            <div class="mt-4 flex flex-wrap gap-3">
              <NuxtLink
                v-for="item in trendingHashtags"
                :key="item.slug"
                :to="item.to"
                class="inline-flex items-center gap-2 rounded-full border border-[#dbe3f2] bg-white px-4 py-2 text-[13px] font-bold text-[#243b63] transition hover:border-[#c8d6f2] hover:text-[#0000ff]"
              >
                <span>{{ formatHashtagLabel(item.label) }}</span>
                <span class="rounded-full bg-[#f3f6fd] px-2 py-0.5 text-[11px] text-slate-500">{{ item.score }}</span>
              </NuxtLink>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section
      v-if="!hasContent"
      class="rounded-[30px] border border-[#dbe3f2] bg-white px-5 py-12 shadow-[0_14px_34px_rgba(15,35,110,0.06)] sm:px-8 sm:py-16"
    >
      <div class="mx-auto max-w-2xl text-center">
        <FoundationEmptyState
          icon="i-ph-compass"
          :title="t('pages.explorePage.emptyTitle')"
          :description="t('pages.explorePage.emptyDescription')"
        />

        <div class="mt-6 flex flex-wrap justify-center gap-3">
          <button
            class="inline-flex h-11 items-center justify-center rounded-full bg-[#0000ff] px-5 text-[13px] font-bold text-white shadow-[0_12px_24px_rgba(0,0,255,0.24)] transition hover:-translate-y-0.5 hover:bg-[#0000e0]"
            type="button"
            @click="setView('all')"
          >
            {{ t("pages.explorePage.showAll") }}
          </button>

          <NuxtLink
            to="/search"
            class="inline-flex h-11 items-center justify-center rounded-full border border-[#dbe3f2] bg-[#f8fbff] px-4 text-[13px] font-bold text-[#243b63] transition hover:border-[#c8d6f2] hover:text-[#0000ff]"
          >
            {{ t("pages.explorePage.goToSearch") }}
          </NuxtLink>
        </div>
      </div>
    </section>

    <section
      v-for="section in visibleSections"
      :key="section.kind"
      class="rounded-[30px] border border-[#dbe3f2] bg-white px-5 py-5 shadow-[0_14px_32px_rgba(15,35,110,0.06)]"
    >
      <div class="flex flex-col gap-3 border-b border-[#eef2fb] pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p class="text-[11px] font-black uppercase tracking-[0.18em] text-[#0000ff]/60">
            {{ section.label }}
          </p>
          <h2 class="mt-2 text-[1.45rem] font-black tracking-[-0.04em] text-[#243b63]">
            {{ section.countLabel }}
          </h2>
          <p class="mt-2 text-[14px] leading-6 text-slate-500">
            {{ section.description }}
          </p>
        </div>

        <button
          v-if="activeView === 'all'"
          class="inline-flex h-11 items-center justify-center rounded-full border border-[#dbe3f2] bg-[#f8fbff] px-4 text-[13px] font-bold text-[#243b63] transition hover:border-[#c8d6f2] hover:text-[#0000ff]"
          type="button"
          @click="setView(section.kind)"
        >
          {{ t("pages.explorePage.onlyView", { label: section.shortLabel }) }}
        </button>
      </div>

      <div v-if="section.kind === 'users'" class="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <ExploreUserSpotlightCard
          v-for="item in recommendedUsers"
          :key="item.id"
          :user="item"
        />
      </div>

      <div v-else-if="section.kind === 'pages'" class="mt-5 grid gap-4 xl:grid-cols-2">
        <CommunityPageCard
          v-for="item in recommendedPages"
          :key="item.id"
          :page="item"
          :action-label="t('pages.explorePage.openFanpage')"
        />
      </div>

      <div v-else class="mt-5 space-y-4">
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

useSeoMeta({
  title: () =>
    activeView.value === "all"
      ? t("pages.explorePage.seoTitle")
      : t("pages.explorePage.filteredSeoTitle", { label: activeViewOption.value.label }),
  description: () =>
    activeView.value === "all"
      ? t("pages.explorePage.seoDescription")
      : t("pages.explorePage.filteredSeoDescription", { label: activeViewOption.value.label }),
})
</script>
