<template>
  <div class="mx-auto max-w-[1440px] space-y-8 px-4 pb-20 pt-6 sm:px-6">
    <section class="overflow-hidden rounded-[32px] border border-[#dbe3f2] bg-white shadow-[0_20px_50px_rgba(15,35,110,0.08)]">
      <div class="grid gap-8 p-6 sm:p-10 xl:grid-cols-[minmax(0,1fr)_480px] xl:items-stretch">
        <div class="flex min-w-0 flex-col justify-between gap-10 rounded-[28px] bg-[#0f172a] p-6 text-white sm:p-10">
          <div class="space-y-6">
            <div class="flex flex-wrap items-center gap-3">
              <span class="inline-flex h-9 items-center rounded-2xl border border-white/20 bg-white/10 px-4 text-[12px] font-black uppercase tracking-[0.15em] text-white backdrop-blur-xl">
                {{ $t("community.pagesDirectory.title") }}
              </span>
              <span class="inline-flex h-9 items-center rounded-2xl bg-primary-600 px-4 text-[12px] font-black uppercase tracking-[0.15em] text-white shadow-lg shadow-primary-600/30">
                PRO DIRECTORY
              </span>
            </div>

            <div class="space-y-4">
              <h1 class="max-w-[720px] text-[38px] font-black leading-tight tracking-tight sm:text-[56px]">
                {{ pageTitle }}
              </h1>
              <p class="max-w-xl text-[16px] font-medium leading-relaxed text-white/60">
                {{ pageDescription }}
              </p>
            </div>
          </div>

          <div class="flex flex-wrap items-center gap-4">
            <UButton
              to="/create-page"
              size="xl"
              class="h-14 rounded-2xl bg-white px-8 font-black text-[#0f172a] shadow-2xl transition-all hover:bg-primary-50 active:scale-95"
            >
              <template #leading>
                <Icon name="i-ph-plus-bold" class="h-5 w-5" />
              </template>
              {{ $t("community.pagesDirectory.createAction") }}
            </UButton>

            <button class="flex h-14 w-14 items-center justify-center rounded-2xl border border-white/20 bg-white/10 text-white backdrop-blur-xl transition-all hover:bg-white/20">
              <Icon name="i-ph-share-network-duotone" class="h-6 w-6" />
            </button>
          </div>
        </div>

        <div class="grid gap-4">
          <div class="group relative overflow-hidden rounded-[28px] bg-primary-600 p-8 text-white shadow-2xl shadow-primary-600/20">
            <div class="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10 blur-3xl transition-transform group-hover:scale-150" />

            <div class="relative flex items-start justify-between">
              <div class="space-y-1">
                <p class="text-[11px] font-black uppercase tracking-widest text-white/70">
                  {{ $t("community.tabs.pages.suggested") }}
                </p>
                <p class="text-[48px] font-black leading-none">
                  {{ suggestedCount }}
                </p>
              </div>
              <div class="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-md">
                <Icon name="i-ph-sparkle-fill" class="h-7 w-7 text-white" />
              </div>
            </div>
            <p class="mt-4 text-[13px] font-bold text-white/80">Discover new opportunities today.</p>
          </div>

          <div class="grid gap-4 sm:grid-cols-2">
            <div class="rounded-[24px] border border-[#dbe3f2] bg-white p-6 shadow-sm">
              <p class="text-[10px] font-black uppercase tracking-widest text-slate-400">
                {{ $t("community.tabs.pages.favorite") }}
              </p>
              <p class="mt-2 text-[32px] font-black text-[#0f172a]">
                {{ favoriteCount }}
              </p>
            </div>

            <div class="rounded-[24px] border border-[#dbe3f2] bg-white p-6 shadow-sm">
              <p class="text-[10px] font-black uppercase tracking-widest text-slate-400">
                {{ $t("community.groups.stats.status") }}
              </p>
              <p class="mt-3 text-[14px] font-black uppercase tracking-tight text-primary-600">
                {{ activeTabStatus }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <CommunityPageDirectoryTabsBar
      v-model:search="search"
      :tabs="tabItems"
      :active-tab="mode"
      create-to="/create-page"
      :status-label="filterStatusLabel"
    />

    <section class="overflow-hidden rounded-[28px] border border-[#dbe3f2] bg-white p-2 shadow-sm lg:p-3">
      <div class="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between lg:px-6">
        <div class="flex items-center gap-4 px-4 py-3">
          <div class="h-2 w-2 animate-pulse rounded-full bg-emerald-500" />
          <p class="text-[13px] font-black uppercase tracking-widest text-[#0f172a]">
            {{ activeTabLabel }}
          </p>
          <div class="h-4 w-px bg-slate-200" />
          <p class="text-[13px] font-bold text-slate-400">
            {{ activeTabHint }}
          </p>
        </div>

        <div class="flex gap-2 p-2">
          <UButton color="gray" variant="ghost" icon="i-ph-squares-four-bold" class="h-10 w-10 rounded-xl" />
          <UButton color="gray" variant="ghost" icon="i-ph-list-bold" class="h-10 w-10 rounded-xl bg-slate-100" />
        </div>
      </div>
    </section>

    <section
      v-if="mode === 'mine' && visiblePages.length === 0"
      class="rounded-[32px] border border-[#dbe3f2] bg-white p-12 text-center shadow-xl lg:p-24"
    >
      <div class="mx-auto max-w-xl space-y-8">
        <div class="mx-auto flex h-24 w-24 items-center justify-center rounded-[40px] bg-slate-50 text-slate-300 ring-8 ring-slate-50/50">
          <Icon name="i-ph-flag-duotone" class="h-12 w-12" />
        </div>
        <div class="space-y-4">
          <h2 class="text-3xl font-black tracking-tight text-[#0f172a]">
            {{ $t('community.pagesDirectory.emptyMineTitle') }}
          </h2>
          <p class="text-base font-medium leading-relaxed text-slate-500">
            {{ $t('community.pagesDirectory.emptyMineDesc') }}
          </p>
        </div>
        <UButton
          to="/create-page"
          size="xl"
          class="h-14 rounded-2xl bg-primary-600 px-10 font-black text-white shadow-2xl shadow-primary-600/30 transition-all active:scale-95"
        >
          <template #leading>
            <Icon name="i-ph-plus-bold" class="h-5 w-5" />
          </template>
          {{ $t("community.pagesDirectory.createFirst") }}
        </UButton>
      </div>
    </section>

    <section
      v-else-if="visiblePages.length === 0"
      class="rounded-[32px] border border-[#dbe3f2] bg-white p-16 text-center shadow-lg"
    >
      <FoundationEmptyState
        icon="i-ph-magnifying-glass-duotone"
        :title="$t('community.pagesDirectory.emptyOtherTitle')"
        :description="$t('community.pagesDirectory.emptyOtherDesc')"
      />
    </section>

    <div v-else class="grid gap-6 xl:grid-cols-2">
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
import CommunityPageCard from "../components/PageCard.vue"
import CommunityPageDirectoryTabsBar from "../components/PageDirectoryTabsBar.vue"
import {
  communityPageRouteMap,
  communityPageTabs,
} from "../../domain/constants/community-options"
import { appendCommunityQuery } from "../../domain/services/community-helpers.service"
import { communityPageDirectory } from "../../infrastructure/mocks/communityDirectory.mock"
import type {
  CommunityPageRecord,
  CommunityPageTab,
} from "../../domain/types/community.types"

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

const search = ref(readQueryValue(route.query.q))
const storedSearch = useStorage<string>(
  `community:pages:${props.mode}:search`,
  "",
  undefined,
  { initOnMounted: true },
)

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

const suggestedCount = computed(() =>
  communityPageDirectory.filter(page => page.directoryTabs?.includes("suggested")).length,
)

const favoriteCount = computed(() =>
  communityPageDirectory.filter(page => page.directoryTabs?.includes("favorite")).length,
)

const visiblePages = computed<CommunityPageRecord[]>(() => {
  const pages =
    props.mode === "mine"
      ? []
      : communityPageDirectory.filter(page => page.directoryTabs?.includes(props.mode))

  const keyword = search.value.trim().toLowerCase()
  if (!keyword) return pages

  return pages.filter((page) => {
    const searchable = [
      t(page.name),
      page.slug,
      t(page.summary),
      t(page.ownerLabel),
      t(page.responseLabel),
      page.locationLabel ? t(page.locationLabel) : "",
      ...page.tags.map(tag => t(tag)),
    ].join(" ").toLowerCase()

    return searchable.includes(keyword)
  })
})

const tabItems = computed(() =>
  communityPageTabs.map(tab => ({
    ...tab,
    to: appendCommunityQuery(communityPageRouteMap[tab.value], { q: search.value.trim() }),
    count:
      tab.value === "mine"
        ? 0
        : communityPageDirectory.filter(page => page.directoryTabs?.includes(tab.value)).length,
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

const activeTabStatus = computed(() => {
  if (props.mode === "mine") return t("community.pagesDirectory.statusMine")
  if (props.mode === "suggested") return t("community.pagesDirectory.statusSuggested", { count: suggestedCount.value })
  return t("community.pagesDirectory.statusFavorite", { count: favoriteCount.value })
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
