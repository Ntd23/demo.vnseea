<template>
  <div class="mx-auto max-w-[1280px] space-y-5 pb-10 sm:space-y-6">
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

    <div class="grid gap-5 sm:gap-6 xl:grid-cols-[minmax(0,1fr)_320px] xl:items-start">
      <section class="min-w-0 space-y-4 sm:space-y-5">
        <div class="scrollbar-hide -mx-4 flex gap-3 overflow-x-auto px-4 pb-2 sm:mx-0 sm:px-0 sm:pb-1">
          <NuxtLink
            v-for="item in quickLinks"
            :key="item.title"
            :to="item.to"
            class="group min-w-[216px] shrink-0 rounded-[24px] border border-[#dbe3f2] bg-white p-4 shadow-[0_14px_32px_rgba(15,35,110,0.06)] transition hover:-translate-y-1 sm:min-w-[240px]"
          >
            <div class="flex h-12 w-12 items-center justify-center rounded-[18px] text-white" :style="{ background: item.accent }">
              <Icon :name="item.icon" class="h-5 w-5" />
            </div>
            <h3 class="mt-4 text-[1.05rem] font-black text-[#243b63]">{{ item.title }}</h3>
            <p class="mt-2 text-[13px] font-semibold leading-6 text-slate-500">{{ item.description }}</p>
            <div class="mt-4 inline-flex items-center gap-2 text-[12px] font-black text-[#0000ff]">
              {{ t("pages.popularPage.openLink") }}
              <Icon name="i-ph-arrow-up-right-bold" class="h-4 w-4 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </div>
          </NuxtLink>
        </div>

        <section class="rounded-[30px] border border-[#dbe3f2] bg-white px-4 py-4 shadow-[0_14px_32px_rgba(15,35,110,0.06)] sm:px-5 sm:py-5">
          <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p class="text-[11px] font-black uppercase tracking-[0.18em] text-[#0000ff]/60">
                {{ t("pages.popularPage.resultEyebrow") }}
              </p>
              <h2 class="mt-2 text-[1.45rem] font-black tracking-[-0.04em] text-[#243b63]">
                {{ resultHeading }}
              </h2>
              <p class="mt-2 text-[14px] leading-6 text-slate-500">
                {{ t("pages.popularPage.resultCount", { count: rankedPosts.length }) }}
              </p>
            </div>

            <button
              class="inline-flex h-11 w-full items-center justify-center rounded-full border border-[#dbe3f2] bg-[#f8fbff] px-4 text-[13px] font-bold text-[#243b63] transition hover:border-[#c8d6f2] hover:text-[#0000ff] sm:w-auto"
              type="button"
              @click="resetFilters"
            >
              <Icon name="i-ph-arrow-counter-clockwise-bold" class="mr-2 h-4 w-4" />
              {{ t("pages.popularPage.resetFilters") }}
            </button>
          </div>
        </section>

        <section
          v-if="rankedPosts.length === 0"
          class="rounded-[30px] border border-[#dbe3f2] bg-white px-5 py-12 shadow-[0_14px_34px_rgba(15,35,110,0.06)] sm:px-8 sm:py-16"
        >
          <div class="mx-auto max-w-2xl text-center">
            <FoundationEmptyState
              icon="i-ph-fire"
              :title="t('pages.popularPage.emptyTitle')"
              :description="t('pages.popularPage.emptyDescription')"
            />
          </div>
        </section>

        <div v-else class="space-y-4 sm:space-y-5">
          <article v-for="(post, index) in rankedPosts" :key="post.id" class="space-y-3">
            <div class="flex flex-wrap items-center gap-2">
              <span class="rounded-full bg-[#0000ff] px-3 py-1.5 text-[11px] font-black uppercase tracking-[0.14em] text-white">
                {{ t("pages.popularPage.rankLabel", { rank: formatRank(index + 1) }) }}
              </span>
              <span class="rounded-full bg-[#f3f6fd] px-3 py-1.5 text-[11px] font-black text-[#243b63]">
                {{ post.trendLabel }}
              </span>
              <span class="rounded-full bg-white px-3 py-1.5 text-[11px] font-black text-[#0000ff] shadow-[0_8px_18px_rgba(15,35,110,0.06)]">
                {{ t("pages.popularPage.scoreCount", { count: formatPopularNumber(getPopularPostScore(post), locale.value) }) }}
              </span>
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
import { createHashtagPath, formatHashtagLabel } from "~/composables/useMockHashtagData"
import type { PopularCategoryKey } from "~/composables/useMockPopularData"
import { formatPopularNumber, getPopularPostScore } from "~/composables/useMockPopularData"

const accentPalette = [
  "linear-gradient(135deg,#2563eb 0%,#60a5fa 100%)",
  "linear-gradient(135deg,#0f766e 0%,#2dd4bf 100%)",
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
