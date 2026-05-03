<!-- Description: Renders popular posts as a ranked content list with sidebar, matching the legacy feed-media emphasis. -->
<template>
  <div class="mx-auto max-w-[1280px] space-y-5 px-3 pb-16 sm:px-5 lg:px-6">
    <section class="rounded-[26px] border border-[#dbe3f2] bg-white px-5 py-5 shadow-[0_12px_28px_rgba(15,35,110,0.06)]">
      <div class="space-y-4">
        <div class="space-y-2">
          <p class="text-[11px] font-bold uppercase tracking-[0.08em] text-slate-500">
            {{ t('pages.popularPage.heroEyebrow') }}
          </p>
          <h1 class="text-[1.9rem] font-black tracking-[-0.04em] text-[var(--text-primary)] sm:text-[2.2rem]">
            {{ t('pages.popularPage.heroTitle') }}
          </h1>
          <p class="max-w-3xl text-[14px] leading-7 text-slate-500">
            {{ t('pages.popularPage.heroDescription') }}
          </p>
        </div>

        <div class="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <article
            v-for="item in summaryCards"
            :key="item.label"
            class="rounded-[18px] border border-[#e2e8f0] bg-[#f8fafc] p-4"
          >
            <p class="text-[11px] font-bold uppercase tracking-[0.08em] text-slate-500">{{ item.label }}</p>
            <p class="mt-2 text-[1.55rem] font-black text-[var(--text-primary)]">{{ item.value }}</p>
            <p class="mt-2 text-[13px] leading-6 text-slate-500">{{ item.description }}</p>
          </article>
        </div>
      </div>
    </section>

    <PopularFilters
      v-model:search="search"
      v-model:selected-category="selectedCategory"
      :categories="categories"
      :placeholder="t('pages.popularPage.searchPlaceholder')"
    />

    <div class="grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start">
      <section class="overflow-hidden rounded-[26px] border border-[#dbe3f2] bg-white shadow-[0_12px_28px_rgba(15,35,110,0.06)]">
        <div class="flex flex-col gap-4 border-b border-[#eef2fb] px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div class="space-y-1">
            <p class="text-[11px] font-bold uppercase tracking-[0.08em] text-slate-500">
              {{ t("pages.popularPage.resultEyebrow") }}
            </p>
            <h2 class="text-[1.45rem] font-black tracking-[-0.03em] text-[var(--text-primary)]">
              {{ resultHeading }}
            </h2>
            <p class="text-[14px] leading-6 text-slate-500">
              {{ t("pages.popularPage.resultCount", { count: rankedPosts.length }) }}
            </p>
          </div>

          <button
            class="inline-flex h-10 items-center justify-center rounded-[14px] border border-[#dbe3f2] bg-white px-4 text-[13px] font-bold text-[var(--text-primary)] transition hover:border-primary-200 hover:text-primary-700"
            type="button"
            @click="resetFilters"
          >
            <Icon name="i-ph-arrow-counter-clockwise-duotone" class="mr-2 h-4 w-4" />
            {{ t("pages.popularPage.resetFilters") }}
          </button>
        </div>

        <div v-if="rankedPosts.length === 0" class="px-6 py-14">
          <FoundationEmptyState
            icon="i-ph-fire-duotone"
            :title="t('pages.popularPage.emptyTitle')"
            :description="t('pages.popularPage.emptyDescription')"
          />
        </div>

        <div v-else class="divide-y divide-[#eef2fb]">
          <article v-for="(post, index) in rankedPosts" :key="post.id" class="space-y-4 p-4 sm:p-5">
            <div class="flex items-center gap-3 rounded-[18px] border border-[#e2e8f0] bg-[#f8fafc] px-4 py-3">
              <div
                class="flex h-12 w-12 items-center justify-center rounded-[14px] text-sm font-black text-white"
                :class="rankClass(index)"
              >
                {{ formatRank(index + 1) }}
              </div>
              <div class="min-w-0 flex-1">
                <p class="text-sm font-black text-[var(--text-primary)]">{{ categoryLabelMap[post.category] }}</p>
                <p class="text-xs text-slate-500">{{ post.trendLabel }}</p>
              </div>
              <p class="text-sm font-bold text-slate-500">
                {{ t("pages.popularPage.scoreCount", { count: formatPopularNumber(getPopularPostScore(post), locale.value) }) }}
              </p>
            </div>

            <FeedPostCard :post="post" />
          </article>
        </div>
      </section>

      <PopularSidebar
        :hashtags="topHashtags"
        :hashtags-eyebrow="t('pages.popularPage.sidebarHashtagsEyebrow')"
        :hashtags-title="t('pages.popularPage.sidebarHashtagsTitle')"
        :creators="topCreators"
        :creators-eyebrow="t('pages.popularPage.sidebarCreatorsEyebrow')"
        :creators-title="t('pages.popularPage.sidebarCreatorsTitle')"
        :quick-links="quickLinks"
        :links-eyebrow="t('pages.popularPage.sidebarLinksEyebrow')"
        :links-title="t('pages.popularPage.sidebarLinksTitle')"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import FoundationEmptyState from "../../../foundation/presentation/components/EmptyState.vue"
import FeedPostCard from "../../../feed/presentation/components/PostCard.vue"
import { createHashtagPath, formatHashtagLabel } from "../../../feed/application/composables/useMockHashtagData"
import PopularFilters from "../components/Filters.vue"
import PopularSidebar from "../components/Sidebar.vue"
import type { PopularCategoryKey, PopularPost } from "../../application/composables/useMockPopularData"
import { formatPopularNumber, getPopularPostScore, useMockPopularData } from "../../application/composables/useMockPopularData"

const accentPalette = [
  "linear-gradient(135deg,#2563eb 0%,#60a5fa 100%)",
  "linear-gradient(135deg,#0369a1 0%,#38bdf8 100%)",
  "linear-gradient(135deg,#7c3aed 0%,#c084fc 100%)",
  "linear-gradient(135deg,#ea580c 0%,#fb923c 100%)",
]

const { t, locale } = useI18n()
const { categories, posts, quickLinks } = useMockPopularData()

useSeoMeta({
  title: () => t("pages.popularPage.seoTitle"),
  description: () => t("pages.popularPage.seoDescription"),
})

const search = ref("")
const selectedCategory = ref<PopularCategoryKey>("all")

const filteredPosts = computed(() => {
  const keyword = search.value.trim().toLowerCase()

  return posts.value.filter((post) => {
    const matchesCategory = selectedCategory.value === "all" || post.category === selectedCategory.value
    const matchesKeyword = keyword.length === 0 || [
      post.author,
      post.role,
      post.text,
      post.trendLabel,
      ...post.tags,
    ].some(field => field.toLowerCase().includes(keyword))

    return matchesCategory && matchesKeyword
  })
})

const rankedPosts = computed(() =>
  filteredPosts.value
    .slice()
    .sort((left, right) => getPopularPostScore(right) - getPopularPostScore(left)),
)

const categoryLabelMap = computed(() =>
  Object.fromEntries(
    categories.value.map(category => [category.value, category.label]),
  ) as Record<PopularCategoryKey, string>,
)

const totalInteractions = computed(() =>
  rankedPosts.value.reduce(
    (sum, post) => sum + post.stats.likes + post.stats.comments + post.stats.shares,
    0,
  ),
)

const totalComments = computed(() =>
  rankedPosts.value.reduce((sum, post) => sum + post.stats.comments, 0),
)

const uniqueCreatorsCount = computed(() =>
  new Set(rankedPosts.value.map(post => post.author)).size,
)

const summaryCards = computed(() => [
  {
    label: t("pages.popularPage.statPosts"),
    value: formatPopularNumber(rankedPosts.value.length, locale.value),
    description: t("pages.popularPage.statPostsDescription"),
  },
  {
    label: t("pages.popularPage.statInteractions"),
    value: formatPopularNumber(totalInteractions.value, locale.value),
    description: t("pages.popularPage.statInteractionsDescription"),
  },
  {
    label: t("pages.popularPage.statCreators"),
    value: formatPopularNumber(uniqueCreatorsCount.value, locale.value),
    description: t("pages.popularPage.statCreatorsDescription"),
  },
  {
    label: t("pages.popularPage.statComments"),
    value: formatPopularNumber(totalComments.value, locale.value),
    description: t("pages.popularPage.statCommentsDescription"),
  },
])

const resultHeading = computed(() => {
  if (selectedCategory.value === "all") return t("pages.popularPage.resultHeadingAll")
  return t("pages.popularPage.resultHeadingCategory", { label: categoryLabelMap.value[selectedCategory.value] })
})

const topHashtags = computed(() => {
  const scoreMap = new Map<string, number>()

  rankedPosts.value.forEach((post) => {
    const postScore = getPopularPostScore(post)
    post.tags.forEach((tag) => {
      scoreMap.set(tag, (scoreMap.get(tag) ?? 0) + postScore)
    })
  })

  return Array.from(scoreMap.entries())
    .sort((left, right) => right[1] - left[1])
    .slice(0, 8)
    .map(([tag, score]) => ({
      label: formatHashtagLabel(tag),
      score: formatPopularNumber(score, locale.value),
      to: createHashtagPath(tag),
    }))
})

const topCreators = computed(() => {
  const creatorMap = new Map<string, { name: string; role: string; score: number }>()

  rankedPosts.value.forEach((post) => {
    const existing = creatorMap.get(post.author)
    const postScore = getPopularPostScore(post)

    if (existing) {
      existing.score += postScore
      return
    }

    creatorMap.set(post.author, {
      name: post.author,
      role: post.role,
      score: postScore,
    })
  })

  return Array.from(creatorMap.values())
    .sort((left, right) => right.score - left.score)
    .slice(0, 4)
    .map((item, index) => ({
      name: item.name,
      initials: item.name
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map(part => part[0]?.toUpperCase() ?? "")
        .join(""),
      role: item.role,
      score: formatPopularNumber(item.score, locale.value),
      accent: accentPalette[index % accentPalette.length],
    }))
})

const formatRank = (value: number) => String(value).padStart(2, "0")

const rankClass = (index: number) => {
  if (index === 0) return "bg-primary-600"
  if (index === 1) return "bg-emerald-600"
  if (index === 2) return "bg-orange-500"
  return "bg-slate-700"
}

const resetFilters = () => {
  search.value = ""
  selectedCategory.value = "all"
}
</script>
