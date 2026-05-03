<!-- Description: Renders the pages directory as a content-first list shell matching the legacy PHP page order. -->
<template>
  <div class="mx-auto max-w-[1280px] space-y-5 px-3 pb-10 sm:px-5 lg:px-6">
    <section class="rounded-[26px] border border-[#dbe3f2] bg-white px-5 py-5 shadow-[0_12px_28px_rgba(15,35,110,0.06)]">
      <div class="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div class="space-y-2">
          <p class="text-[11px] font-bold uppercase tracking-[0.08em] text-slate-500">
            {{ activeTabLabel }}
          </p>
          <h1 class="text-[1.9rem] font-black tracking-[-0.04em] text-[var(--text-primary)] sm:text-[2.3rem]">
            {{ pageTitle }}
          </h1>
          <p class="max-w-3xl text-[14px] leading-7 text-slate-500">
            {{ pageDescription }}
          </p>
        </div>

        <NuxtLink
          to="/create-page"
          class="inline-flex h-11 items-center justify-center rounded-[14px] bg-primary-600 px-5 text-[13px] font-bold text-white shadow-[0_12px_24px_rgba(37,99,235,0.18)] transition hover:-translate-y-0.5 hover:bg-primary-700"
        >
          <Icon name="i-ph-plus-bold" class="mr-2 h-4 w-4" />
          {{ $t("community.pagesDirectory.createAction") }}
        </NuxtLink>
      </div>
    </section>

    <CommunityPageDirectoryTabsBar
      v-model:search="search"
      :tabs="tabItems"
      :active-tab="mode"
      create-to="/create-page"
      :status-label="filterStatusLabel"
    />

    <section class="rounded-[22px] border border-[#dbe3f2] bg-white px-5 py-4 text-[14px] leading-6 text-slate-500 shadow-[0_8px_20px_rgba(15,35,110,0.04)]">
      <strong class="mr-2 text-[var(--text-primary)]">{{ activeTabLabel }}</strong>
      {{ activeTabHint }}
    </section>

    <div v-if="pending" class="grid gap-4 xl:grid-cols-2">
      <div
        v-for="item in 4"
        :key="item"
        class="rounded-[28px] border border-[#dbe3f2] bg-white p-5 shadow-[0_14px_34px_rgba(15,35,110,0.06)]"
      >
        <USkeleton class="h-36 w-full rounded-[22px]" />
        <div class="mt-4 space-y-3">
          <USkeleton class="h-6 w-48 rounded-xl" />
          <USkeleton class="h-4 w-full rounded-xl" />
          <USkeleton class="h-4 w-2/3 rounded-xl" />
        </div>
      </div>
    </div>

    <section
      v-else-if="visiblePages.length === 0"
      class="rounded-[28px] border border-[#dbe3f2] bg-white px-6 py-12 text-center shadow-[0_14px_34px_rgba(15,35,110,0.06)]"
    >
      <FoundationEmptyState
        :icon="mode === 'mine' ? 'i-ph-flag-duotone' : 'i-ph-magnifying-glass-duotone'"
        :title="mode === 'mine' ? $t('community.pagesDirectory.emptyMineTitle') : $t('community.pagesDirectory.emptyOtherTitle')"
        :description="mode === 'mine' ? $t('community.pagesDirectory.emptyMineDesc') : $t('community.pagesDirectory.emptyOtherDesc')"
      />
    </section>

    <div v-else class="grid gap-4 xl:grid-cols-2">
      <CommunityPageCard
        v-for="page in visiblePages"
        :key="page.id"
        :page="page"
        :action-label="actionLabel"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { useStorage, watchDebounced } from "@vueuse/core"
import FoundationEmptyState from "../../../foundation/presentation/components/EmptyState.vue"
import CommunityPageCard from "../components/PageCard.vue"
import CommunityPageDirectoryTabsBar from "../components/PageDirectoryTabsBar.vue"
import {
  communityPageRouteMap,
  communityPageTabs,
} from "../../domain/constants/community-options"
import { appendCommunityQuery } from "../../domain/services/community-helpers.service"
import type { CommunityPageTab } from "../../domain/types/community.types"
import { createApiCommunityRepository } from "../../infrastructure/repositories/ApiCommunityRepository"

function readQueryValue(value: unknown) {
  if (Array.isArray(value)) return String(value[0] || "")
  return typeof value === "string" ? value : ""
}

const props = withDefaults(defineProps<{
  mode?: CommunityPageTab
}>(), {
  mode: "mine",
})

const route = useRoute()
const router = useRouter()
const { t } = useI18n()
const repository = createApiCommunityRepository()

const search = ref(readQueryValue(route.query.q))
const storedSearch = useStorage<string>(
  `community:pages:${props.mode}:search`,
  "",
  undefined,
  { initOnMounted: true },
)

const { data: pagesData, status } = useAsyncData(
  () => `community:pages:${props.mode}`,
  () => repository.getPages(props.mode),
  {
    watch: [() => props.mode],
    default: () => [],
  },
)

const { data: countsData } = useAsyncData(
  "community:pages:counts",
  async () => {
    const [mine, suggested, favorite] = await Promise.all([
      repository.getPages("mine"),
      repository.getPages("suggested"),
      repository.getPages("favorite"),
    ])

    return {
      mine: mine.length,
      suggested: suggested.length,
      favorite: favorite.length,
    }
  },
  {
    default: () => ({
      mine: 0,
      suggested: 0,
      favorite: 0,
    }),
  },
)

const pending = computed(() => status.value === "pending")
const pages = computed(() => pagesData.value ?? [])

const pageTitle = computed(() => {
  if (props.mode === "suggested") return t("community.pagesDirectory.titleSuggested")
  if (props.mode === "favorite") return t("community.pagesDirectory.titleFavorite")
  return t("community.pagesDirectory.title")
})

const pageDescription = computed(() => {
  if (props.mode === "suggested") return t("community.pagesDirectory.descSuggested")
  if (props.mode === "favorite") return t("community.pagesDirectory.descFavorite")
  return t("community.pagesDirectory.desc")
})

const visiblePages = computed(() => {
  const keyword = search.value.trim().toLowerCase()
  if (!keyword) return pages.value

  return pages.value.filter((page) => {
    const searchable = [
      page.name,
      page.slug,
      page.summary,
      page.ownerLabel,
      page.responseLabel,
      page.locationLabel || "",
      ...page.tags,
    ].join(" ").toLowerCase()

    return searchable.includes(keyword)
  })
})

const tabItems = computed(() =>
  communityPageTabs.map(tab => ({
    ...tab,
    to: appendCommunityQuery(communityPageRouteMap[tab.value], { q: search.value.trim() }),
    count: countsData.value?.[tab.value] ?? 0,
  })),
)

const actionLabel = computed(() => {
  if (props.mode === "suggested") return t("community.pagesDirectory.actionSuggested")
  if (props.mode === "favorite") return t("community.pagesDirectory.actionFavorite")
  return t("community.pagesDirectory.actionMine")
})

const activeTabLabel = computed(() => {
  const tab = communityPageTabs.find(tab => tab.value === props.mode)
  return tab ? t(tab.label) : t("community.pagesDirectory.title")
})

const activeTabHint = computed(() => {
  if (props.mode === "mine") return t("community.pagesDirectory.hintMine")
  if (props.mode === "suggested") return t("community.pagesDirectory.hintSuggested")
  return t("community.pagesDirectory.hintFavorite")
})

const filterStatusLabel = computed(() =>
  search.value.trim()
    ? t("community.pagesDirectory.resultsActive", { count: visiblePages.value.length })
    : t("community.pagesDirectory.resultsIdle"),
)

watch(
  () => route.query.q,
  (value) => {
    const nextValue = readQueryValue(value)

    if (nextValue !== search.value) {
      search.value = nextValue
    }

    if (nextValue.trim()) {
      storedSearch.value = nextValue.trim()
    }
  },
  { immediate: true },
)

onMounted(() => {
  if (!readQueryValue(route.query.q) && storedSearch.value.trim()) {
    search.value = storedSearch.value.trim()
  }
})

watchDebounced(
  search,
  async (value) => {
    const keyword = value.trim()

    storedSearch.value = keyword

    if (keyword === readQueryValue(route.query.q)) {
      return
    }

    const nextQuery = { ...route.query }

    if (keyword) {
      nextQuery.q = keyword
    }
    else {
      delete nextQuery.q
    }

    await router.replace({ query: nextQuery })
  },
  {
    debounce: 250,
    maxWait: 1000,
  },
)
</script>
