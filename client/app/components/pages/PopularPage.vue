<template>
  <div class="mx-auto max-w-[1280px] space-y-8 pb-20 px-4 sm:px-6">
    <PopularHero
      :eyebrow="t('pages.popularPage.heroEyebrow')"
      :title="t('pages.popularPage.heroTitle')"
      :description="t('pages.popularPage.heroDescription')"
      :primary-label="t('pages.popularPage.primaryCta')"
      primary-to="/home"
      :secondary-label="t('pages.popularPage.secondaryCta')"
      secondary-to="/search"
      :stats="summaryCards"
    />

    <PopularFilters
      v-model:search="search"
      v-model:selected-category="selectedCategory"
      :categories="categories"
      :placeholder="t('pages.popularPage.searchPlaceholder')"
    />

    <div class="grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start">
      <section class="min-w-0 space-y-8">
        <!-- Quick Stats for sections if any, but let's keep the flow -->
        <div class="scrollbar-hide -mx-6 flex gap-4 overflow-x-auto px-6 pb-4 sm:mx-0 sm:px-0 sm:pb-2">
          <NuxtLink
            v-for="(item, idx) in quickLinks"
            :key="item.title"
            :to="item.to"
            class="group min-w-[280px] shrink-0 surface-card p-6 ring-1 ring-secondary-100 hover:ring-primary-500/20 transition-all hover:-translate-y-1.5 hover:shadow-2xl bg-white"
          >
            <div class="flex h-14 w-14 items-center justify-center rounded-2xl text-white shadow-xl transition-transform group-hover:scale-110 group-hover:rotate-6 shadow-primary-500/20" :style="{ background: item.accent }">
              <Icon :name="item.icon.includes('duotone') ? item.icon : item.icon.replace('-bold', '-duotone').replace('-fill', '-duotone')" class="h-6 w-6" />
            </div>
            <h3 class="mt-6 text-xl font-black text-secondary-900 group-hover:text-secondary-900 transition-colors">{{ item.title }}</h3>
            <p class="mt-2 text-[13px] font-medium leading-relaxed text-secondary-500 italic">{{ item.description }}</p>
            <div class="mt-6 flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-secondary-900">
              {{ t("pages.popularPage.openLink") }}
              <Icon name="i-ph-arrow-up-right-duotone" class="h-4 w-4 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
            </div>
          </NuxtLink>
        </div>

        <section class="surface-card p-6 sm:p-8 ring-1 ring-secondary-200/50 shadow-2xl space-y-8">
          <div class="flex flex-col gap-6 border-b border-secondary-100/50 pb-8 sm:flex-row sm:items-center sm:justify-between">
            <div class="space-y-2">
              <p class="text-[9px] font-black uppercase tracking-[0.4em] text-secondary-900 pl-1">
                {{ t("pages.popularPage.resultEyebrow") }}
              </p>
              <h2 class="text-3xl font-black tracking-tight text-secondary-900 leading-none">
                {{ resultHeading }}
              </h2>
              <p class="text-[13px] font-medium leading-relaxed text-secondary-500 max-w-2xl px-0.5 italic">
                {{ t("pages.popularPage.resultCount", { count: rankedPosts.length }) }}
              </p>
            </div>

            <button
              class="h-10 inline-flex items-center justify-center rounded-xl border border-secondary-100 bg-secondary-50/50 px-5 text-[10px] font-black uppercase tracking-widest text-secondary-500 transition-all hover:bg-white hover:text-primary-600 hover:border-primary-100 hover:shadow-md active:scale-95"
              type="button"
              @click="resetFilters"
            >
              <Icon name="i-ph-arrow-counter-clockwise-duotone" class="mr-2 h-4 w-4" />
              {{ t("pages.popularPage.resetFilters") }}
            </button>
          </div>

          <div v-if="rankedPosts.length === 0" class="py-12">
            <FoundationEmptyState
              icon="i-ph-fire-duotone"
              :title="t('pages.popularPage.emptyTitle')"
              :description="t('pages.popularPage.emptyDescription')"
            />
          </div>

          <div v-else class="space-y-10">
            <div v-for="(post, index) in rankedPosts" :key="post.id" class="space-y-6">
              <div class="flex flex-wrap items-center gap-3">
                <span class="inline-flex h-8 items-center rounded-xl bg-primary-600 px-4 text-[10px] font-black uppercase tracking-widest text-white shadow-xl shadow-primary-500/30">
                  {{ t("pages.popularPage.rankLabel", { rank: formatRank(index + 1) }) }}
                </span>
                <span class="inline-flex h-8 items-center rounded-xl bg-orange-50 px-4 text-[10px] font-black uppercase tracking-widest text-orange-600 ring-1 ring-orange-100">
                  {{ post.trendLabel }}
                </span>
                <div class="inline-flex h-8 items-center gap-1.5 rounded-xl bg-white px-4 text-[10px] font-black uppercase tracking-widest text-secondary-900 ring-1 ring-secondary-100 shadow-sm">
                  <Icon name="i-ph-chart-line-up-duotone" class="h-3.5 w-3.5" />
                  {{ t("pages.popularPage.scoreCount", { count: formatPopularNumber(getPopularPostScore(post), locale.value) }) }}
                </div>
              </div>

              <FeedPostCard :post="post" />
            </div>
          </div>
        </section>
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
import { createHashtagPath, formatHashtagLabel } from "~/composables/useMockHashtagData"
import type { PopularCategoryKey } from "~/composables/useMockPopularData"
import { formatPopularNumber, getPopularPostScore } from "~/composables/useMockPopularData"

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

const resetFilters = () => {
  search.value = ""
  selectedCategory.value = "all"
}
</script>

<style scoped>
.scrollbar-hide {
  scrollbar-width: none;
}

.scrollbar-hide::-webkit-scrollbar {
  display: none;
}
</style>
