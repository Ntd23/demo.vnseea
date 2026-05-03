<!-- Description: Renders the explore page as a content-first discovery shell rather than a dashboard hero. -->
<template>
  <div class="mx-auto max-w-[1280px] space-y-5 px-3 pb-20 sm:px-5 lg:px-6">
    <section class="rounded-[26px] border border-[#dbe3f2] bg-white px-5 py-5 shadow-[0_12px_28px_rgba(15,35,110,0.06)]">
      <div class="space-y-4">
        <div class="space-y-2">
          <p class="text-[11px] font-bold uppercase tracking-[0.08em] text-slate-500">
            {{ t("pages.explorePage.heroEyebrow") }}
          </p>
          <h1 class="text-[1.9rem] font-black tracking-[-0.04em] text-[var(--text-primary)] sm:text-[2.2rem]">
            {{ t("pages.explorePage.heroTitle") }}
          </h1>
          <p class="max-w-3xl text-[14px] leading-7 text-slate-500">
            {{ t("pages.explorePage.heroDescription") }}
          </p>
        </div>

        <div class="flex flex-wrap gap-3">
          <button
            v-for="option in exploreViewOptions"
            :key="option.value"
            class="inline-flex h-10 items-center justify-center rounded-[14px] border px-4 text-[13px] font-bold transition"
            :class="activeView === option.value
              ? 'border-primary-200 bg-primary-50 text-primary-700'
              : 'border-[#dbe3f2] bg-white text-[var(--text-primary)] hover:border-primary-200 hover:text-primary-700'"
            type="button"
            @click="setView(option.value)"
          >
            <Icon :name="option.icon" class="mr-2 h-4 w-4" />
            {{ option.label }}
          </button>
        </div>

        <div class="grid gap-3 sm:grid-cols-3">
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

    <section class="rounded-[22px] border border-[#dbe3f2] bg-white px-5 py-4 shadow-[0_8px_20px_rgba(15,35,110,0.04)]">
      <div class="flex flex-wrap gap-3">
        <NuxtLink
          v-for="item in trendingHashtags"
          :key="item.slug"
          :to="item.to"
          class="inline-flex items-center gap-2 rounded-full border border-[#dbe3f2] bg-[#f8fafc] px-4 py-2 text-[13px] font-bold text-[var(--text-primary)] transition hover:border-primary-200 hover:text-primary-700"
        >
          <span>{{ formatHashtagLabel(item.label) }}</span>
          <span class="rounded-full bg-white px-2 py-0.5 text-[11px] text-slate-500">{{ item.score }}</span>
        </NuxtLink>
      </div>
    </section>

    <section
      v-if="!hasContent"
      class="rounded-[28px] border border-[#dbe3f2] bg-white px-6 py-14 text-center shadow-[0_14px_34px_rgba(15,35,110,0.06)]"
    >
      <FoundationEmptyState
        icon="i-ph-compass-duotone"
        :title="t('pages.explorePage.emptyTitle')"
        :description="t('pages.explorePage.emptyDescription')"
      />
    </section>

    <section
      v-for="section in visibleSections"
      :key="section.kind"
      class="rounded-[26px] border border-[#dbe3f2] bg-white p-5 shadow-[0_12px_28px_rgba(15,35,110,0.06)]"
    >
      <div class="space-y-2 border-b border-[#eef2fb] pb-4">
        <p class="text-[11px] font-bold uppercase tracking-[0.08em] text-slate-500">
          {{ section.label }}
        </p>
        <h2 class="text-[1.45rem] font-black tracking-[-0.03em] text-[var(--text-primary)]">
          {{ section.countLabel }}
        </h2>
        <p class="text-[14px] leading-6 text-slate-500">
          {{ section.description }}
        </p>
      </div>

      <div v-if="section.kind === 'users'" class="mt-5 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
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
import FoundationEmptyState from "../../../foundation/presentation/components/EmptyState.vue"
import CommunityPageCard from "../../../community/presentation/components/PageCard.vue"
import FeedPostCard from "../../../feed/presentation/components/PostCard.vue"
import { formatHashtagLabel } from "../../../feed/application/composables/useMockHashtagData"
import ExploreUserSpotlightCard from "../components/UserSpotlightCard.vue"
import type { ExploreView } from "../../application/composables/useMockExploreData"
import { useMockExploreData } from "../../application/composables/useMockExploreData"

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
