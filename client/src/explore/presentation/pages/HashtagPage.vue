<!-- Description: Renders hashtag discovery as a heading plus post results, matching the PHP hashtag page order. -->
<template>
  <div class="mx-auto max-w-[1280px] space-y-5 px-3 pb-10 sm:px-5 lg:px-6">
    <section class="rounded-[26px] border border-[#dbe3f2] bg-white px-5 py-5 shadow-[0_12px_28px_rgba(15,35,110,0.06)]">
      <div class="space-y-4">
        <div class="space-y-2">
          <p class="text-[11px] font-bold uppercase tracking-[0.08em] text-slate-500">
            {{ t("pages.hashtagPage.heroEyebrow") }}
          </p>
          <h1 class="text-[1.9rem] font-black tracking-[-0.04em] text-[var(--text-primary)] sm:text-[2.2rem]">
            {{ hashtagLabel }}
          </h1>
          <p class="max-w-3xl text-[14px] leading-7 text-slate-500">
            {{ heroDescription }}
          </p>
        </div>

        <div class="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <article
            v-for="item in heroStats"
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

    <UAlert
      v-if="errorMessage"
      color="warning"
      variant="subtle"
      icon="i-ph-warning-circle-fill"
      class="rounded-[22px]"
      :description="errorMessage"
    />

    <section
      v-if="loading"
      class="rounded-[28px] border border-[#dbe3f2] bg-white px-6 py-14 text-center shadow-[0_14px_34px_rgba(15,35,110,0.06)]"
    >
      <div class="flex items-center justify-center gap-3 text-sm font-bold text-slate-500">
        <Icon name="i-lucide-loader-2" class="h-5 w-5 animate-spin" />
        <span>{{ t("pages.hashtagPage.heroEyebrow") }}</span>
      </div>
    </section>

    <section class="rounded-[22px] border border-[#dbe3f2] bg-white px-5 py-4 shadow-[0_8px_20px_rgba(15,35,110,0.04)]">
      <div class="flex flex-wrap gap-3">
        <NuxtLink
          v-for="item in visibleHashtags"
          :key="item.slug"
          :to="item.to"
          class="inline-flex items-center gap-2 rounded-full border border-[#dbe3f2] bg-[#f8fafc] px-4 py-2 text-[13px] font-bold text-[var(--text-primary)] transition hover:border-primary-200 hover:text-primary-700"
        >
          <span>{{ formatHashtagLabel(item.label) }}</span>
          <span class="rounded-full bg-white px-2 py-0.5 text-[11px] text-slate-500">{{ item.count }}</span>
        </NuxtLink>
      </div>
    </section>

    <section
      v-if="!loading && hasMatches"
      class="rounded-[26px] border border-[#dbe3f2] bg-white p-5 shadow-[0_12px_28px_rgba(15,35,110,0.06)]"
    >
      <div class="space-y-2 border-b border-[#eef2fb] pb-4">
        <p class="text-[11px] font-bold uppercase tracking-[0.08em] text-slate-500">
          {{ t("pages.hashtagPage.postsEyebrow") }}
        </p>
        <h2 class="text-[1.45rem] font-black tracking-[-0.03em] text-[var(--text-primary)]">
          {{ t("pages.hashtagPage.postsTitle", { count: matchingPosts.length, tag: hashtagLabel }) }}
        </h2>
        <p class="text-[14px] leading-6 text-slate-500">
          {{ t("pages.hashtagPage.postsDescription") }}
        </p>
      </div>

      <div class="mt-5 space-y-4">
        <FeedPostCard
          v-for="post in matchingPosts"
          :key="post.id"
          :post="post"
        />
      </div>
    </section>

    <section
      v-else
      class="rounded-[28px] border border-[#dbe3f2] bg-white px-6 py-14 text-center shadow-[0_14px_34px_rgba(15,35,110,0.06)]"
    >
      <FoundationEmptyState
        icon="i-ph-hash-bold"
        :title="t('pages.hashtagPage.emptyTitle', { tag: hashtagLabel })"
        :description="t('pages.hashtagPage.emptyDescription', { tag: hashtagLabel })"
      />
    </section>
  </div>
</template>

<script setup lang="ts">
import FoundationEmptyState from "../../../foundation/presentation/components/EmptyState.vue"
import FeedPostCard from "../../../feed/presentation/components/PostCard.vue"
import { formatHashtagLabel, normalizeHashtagValue } from "../../../feed/application/composables/useHashtagData"
import type { FeedHashtagChip, FeedPostRecord } from "../../../feed/domain/types/feed.types"
import { createApiFeedRepository } from "../../../feed/infrastructure/repositories/ApiFeedRepository"

function readRouteParam(value: unknown) {
  if (Array.isArray(value)) return String(value[0] || "")
  return typeof value === "string" ? value : ""
}

const route = useRoute()
const { t } = useI18n()
const repository = createApiFeedRepository()
const loading = ref(true)
const errorMessage = ref("")
const matchingPosts = ref<FeedPostRecord[]>([])

const rawTag = computed(() => normalizeHashtagValue(readRouteParam(route.params.tag)))
const hashtagLabel = computed(() => formatHashtagLabel(rawTag.value))
const hasMatches = computed(() => matchingPosts.value.length > 0)
const visibleHashtags = computed<FeedHashtagChip[]>(() => {
  const scoreMap = new Map<string, number>()

  matchingPosts.value.forEach((post) => {
    post.tags.forEach((tag) => {
      scoreMap.set(tag, (scoreMap.get(tag) ?? 0) + 1)
    })
  })

  return Array.from(scoreMap.entries())
    .filter(([tag]) => tag !== rawTag.value)
    .sort((left, right) => right[1] - left[1])
    .slice(0, 8)
    .map(([tag, count]) => ({
      label: tag,
      slug: tag,
      count,
      to: `/hashtag/${encodeURIComponent(tag)}`,
    }))
})

const formatCount = (value: number) =>
  new Intl.NumberFormat().format(value)

const heroStats = computed(() => [
  {
    label: t("pages.hashtagPage.postsEyebrow"),
    value: formatCount(matchingPosts.value.length),
    description: t("pages.hashtagPage.postsDescription"),
  },
  {
    label: t("pages.explorePage.sectionUsersShort"),
    value: formatCount(new Set(matchingPosts.value.map(post => post.author)).size),
    description: t("pages.explorePage.sectionUsersDescription"),
  },
  {
    label: t("pages.photosPage.statPhotos"),
    value: formatCount(matchingPosts.value.reduce((total, post) => total + post.mediaItems.filter(item => item.type === "image").length, 0)),
    description: t("pages.photosPage.statPhotosDescription"),
  },
  {
    label: t("pages.popularPage.statInteractions"),
    value: formatCount(
      matchingPosts.value.reduce(
        (total, post) => total + post.stats.likes + post.stats.comments + post.stats.shares,
        0,
      ),
    ),
    description: t("pages.popularPage.statInteractionsDescription"),
  },
])

const heroDescription = computed(() => {
  if (hasMatches.value) {
    return t("pages.hashtagPage.heroDescriptionMatch", { tag: hashtagLabel.value })
  }

  return t("pages.hashtagPage.heroDescriptionEmpty", { tag: hashtagLabel.value })
})

async function fetchHashtagPosts() {
  loading.value = true
  errorMessage.value = ""

  try {
    const response = await repository.getHashtag(rawTag.value, { limit: 18 })
    matchingPosts.value = response.posts
  }
  catch (error) {
    errorMessage.value = error instanceof Error ? error.message : t("pages.hashtagPage.emptyDescription", { tag: hashtagLabel.value })
    matchingPosts.value = []
  }
  finally {
    loading.value = false
  }
}

useSeoMeta({
  title: () => t("pages.hashtagPage.seoTitle", { tag: hashtagLabel.value }),
  description: () =>
    hasMatches.value
      ? t("pages.hashtagPage.seoDescriptionMatch", { tag: hashtagLabel.value })
      : t("pages.hashtagPage.seoDescriptionEmpty", { tag: hashtagLabel.value }),
})

watch(rawTag, async () => {
  await fetchHashtagPosts()
}, { immediate: true })
</script>
