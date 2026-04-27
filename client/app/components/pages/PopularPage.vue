<template>
  <div class="mx-auto max-w-[1440px] space-y-5 px-3 pb-16 sm:px-5 lg:px-6">
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

    <div class="grid gap-5 lg:grid-cols-[minmax(0,1fr)_340px] lg:items-start">
      <section class="min-w-0 space-y-5">
        <div class="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <NuxtLink
            v-for="item in quickLinks"
            :key="item.title"
            :to="item.to"
            class="group flex min-h-[112px] items-start gap-3 rounded-[18px] border border-[#dbe3f2] bg-white p-4 shadow-[0_8px_22px_rgba(15,35,110,0.04)] transition hover:-translate-y-0.5 hover:border-primary-200 hover:shadow-[0_14px_30px_rgba(15,35,110,0.08)]"
          >
            <div class="flex h-11 w-11 shrink-0 items-center justify-center rounded-[14px] text-white shadow-[0_10px_18px_rgba(37,99,235,0.14)] transition-transform group-hover:scale-105" :style="{ background: item.accent }">
              <Icon :name="item.icon.includes('duotone') ? item.icon : item.icon.replace('-bold', '-duotone').replace('-fill', '-duotone')" class="h-5 w-5" />
            </div>
            <div class="min-w-0 flex-1">
              <h3 class="text-[14px] font-extrabold leading-snug text-[var(--text-primary)] transition-colors group-hover:text-primary-700">{{ item.title }}</h3>
              <p class="mt-1 line-clamp-2 text-[12px] font-medium leading-5 text-slate-500">{{ item.description }}</p>
              <div class="mt-3 inline-flex items-center gap-1.5 text-[11px] font-bold text-primary-600">
                {{ t("pages.popularPage.openLink") }}
                <Icon name="i-ph-arrow-up-right-duotone" class="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </div>
            </div>
          </NuxtLink>
        </div>

        <section class="overflow-hidden rounded-[24px] border border-[#dbe3f2] bg-white shadow-[0_12px_32px_rgba(15,35,110,0.06)]">
          <div class="flex flex-col gap-4 border-b border-secondary-100 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
            <div class="space-y-1">
              <p class="text-[11px] font-extrabold uppercase text-slate-500">
                {{ t("pages.popularPage.resultEyebrow") }}
              </p>
              <h2 class="text-[22px] font-black leading-tight text-[var(--text-primary)] sm:text-[26px]">
                {{ resultHeading }}
              </h2>
              <p class="max-w-2xl text-[13px] font-medium leading-6 text-slate-500">
                {{ t("pages.popularPage.resultCount", { count: rankedPosts.length }) }}
              </p>
            </div>

            <button
              class="inline-flex h-10 items-center justify-center rounded-[14px] border border-secondary-200 bg-secondary-50 px-4 text-[12px] font-extrabold text-[var(--text-primary)] transition hover:border-primary-200 hover:bg-white hover:text-primary-700 active:scale-95"
              type="button"
              @click="resetFilters"
            >
              <Icon name="i-ph-arrow-counter-clockwise-duotone" class="mr-2 h-4 w-4 shrink-0" />
              {{ t("pages.popularPage.resetFilters") }}
            </button>
          </div>

          <div v-if="rankedPosts.length === 0" class="px-4 py-12">
            <FoundationEmptyState
              icon="i-ph-fire-duotone"
              :title="t('pages.popularPage.emptyTitle')"
              :description="t('pages.popularPage.emptyDescription')"
            />
          </div>

          <div v-else class="divide-y divide-secondary-100">
            <article v-for="(post, index) in rankedPosts" :key="post.id" class="space-y-3 bg-white px-3 py-4 sm:px-5 sm:py-5">
              <div class="grid gap-3 rounded-[18px] border border-secondary-100 bg-secondary-50/60 p-3 sm:grid-cols-[auto_minmax(0,1fr)_auto] sm:items-center">
                <div
                  class="flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-[16px] text-white shadow-lg"
                  :class="rankClass(index)"
                >
                  <span class="text-[10px] font-bold leading-none opacity-80">#</span>
                  <span class="text-[20px] font-black leading-none">{{ formatRank(index + 1) }}</span>
                </div>

                <div class="min-w-0 space-y-2">
                  <div class="flex flex-wrap items-center gap-2">
                    <span class="inline-flex h-7 items-center rounded-full bg-white px-3 text-[12px] font-extrabold text-[var(--text-primary)] ring-1 ring-secondary-100">
                      {{ categoryLabelMap[post.category] }}
                    </span>
                    <span class="inline-flex h-7 items-center rounded-full bg-orange-50 px-3 text-[12px] font-extrabold text-orange-700 ring-1 ring-orange-100">
                      {{ post.trendLabel }}
                    </span>
                  </div>
                  <div class="flex items-center gap-3">
                    <div class="h-2 min-w-0 flex-1 overflow-hidden rounded-full bg-white ring-1 ring-secondary-100">
                      <div class="h-full rounded-full bg-primary-600" :style="{ width: `${postScorePercent(post)}%` }" />
                    </div>
                    <div class="inline-flex items-center gap-1.5 text-[12px] font-black text-[var(--text-primary)]">
                      <Icon name="i-ph-chart-line-up-duotone" class="h-4 w-4 text-primary-600" />
                      {{ t("pages.popularPage.scoreCount", { count: formatPopularNumber(getPopularPostScore(post), locale.value) }) }}
                    </div>
                  </div>
                </div>

                <div class="grid grid-cols-3 gap-2 sm:w-[178px]">
                  <div class="rounded-[14px] bg-white px-2.5 py-2 text-center ring-1 ring-secondary-100">
                    <Icon name="i-ph-thumbs-up-duotone" class="mx-auto h-4 w-4 text-primary-600" />
                    <p class="mt-1 text-[12px] font-black leading-none text-[var(--text-primary)]">{{ formatPopularNumber(post.stats.likes, locale.value) }}</p>
                  </div>
                  <div class="rounded-[14px] bg-white px-2.5 py-2 text-center ring-1 ring-secondary-100">
                    <Icon name="i-ph-chat-circle-text-duotone" class="mx-auto h-4 w-4 text-emerald-600" />
                    <p class="mt-1 text-[12px] font-black leading-none text-[var(--text-primary)]">{{ formatPopularNumber(post.stats.comments, locale.value) }}</p>
                  </div>
                  <div class="rounded-[14px] bg-white px-2.5 py-2 text-center ring-1 ring-secondary-100">
                    <Icon name="i-ph-share-network-duotone" class="mx-auto h-4 w-4 text-orange-600" />
                    <p class="mt-1 text-[12px] font-black leading-none text-[var(--text-primary)]">{{ formatPopularNumber(post.stats.shares, locale.value) }}</p>
                  </div>
                </div>
              </div>

              <FeedPostCard :post="post" />
            </article>
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
import type { PopularCategoryKey, PopularPost } from "~/composables/useMockPopularData"
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

const highestScore = computed(() =>
  rankedPosts.value.reduce((highest, post) => Math.max(highest, getPopularPostScore(post)), 0),
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
  if (index === 0) return "bg-primary-600 shadow-primary-500/20"
  if (index === 1) return "bg-emerald-600 shadow-emerald-500/20"
  if (index === 2) return "bg-orange-500 shadow-orange-500/20"
  return "bg-secondary-900 shadow-secondary-900/10"
}

const postScorePercent = (post: Pick<PopularPost, "stats">) => {
  if (highestScore.value === 0) return 0

  return Math.max(8, Math.round((getPopularPostScore(post) / highestScore.value) * 100))
}

const resetFilters = () => {
  search.value = ""
  selectedCategory.value = "all"
}
</script>


<style scoped>
/** Fixed CSS parsing error by providing explicit style block */
</style>

