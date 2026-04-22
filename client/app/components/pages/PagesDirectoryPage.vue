<template>
  <div class="mx-auto max-w-[1280px] space-y-6 pb-10">
    <section class="rounded-[30px] border border-[#dbe3f2] bg-white px-5 py-5 shadow-[0_14px_34px_rgba(15,35,110,0.07)] sm:px-7">
      <div class="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        <div class="flex items-start gap-4">
          <div class="flex h-14 w-14 shrink-0 items-center justify-center rounded-[20px] bg-[linear-gradient(135deg,#1d4ed8_0%,#0000ff_100%)] text-white shadow-[0_14px_30px_rgba(0,0,255,0.22)]">
            <Icon name="i-ph-flag-fill" class="h-7 w-7" />
          </div>

          <div>
            <p class="text-[12px] font-bold uppercase tracking-[0.22em] text-[#0000ff]/65">
              {{ $t("community.pagesDirectory.title") }}
            </p>
            <h1 class="mt-2 text-[2rem] font-black tracking-[-0.05em] text-[#243b63]">
              {{ pageTitle }}
            </h1>
            <p class="mt-2 max-w-[720px] text-[14px] leading-7 text-slate-500">
              {{ pageDescription }}
            </p>
          </div>
        </div>

        <div class="grid gap-3 sm:grid-cols-3">
          <div class="rounded-[20px] border border-[#edf2fb] bg-[#fbfcff] px-4 py-3">
            <p class="text-[11px] font-bold uppercase tracking-[0.14em] text-[#0000ff]/65">
              {{ $t("community.tabs.pages.suggested") }}
            </p>
            <p class="mt-1 text-[1.25rem] font-black text-[#243b63]">
              {{ suggestedCount }}
            </p>
          </div>
          <div class="rounded-[20px] border border-[#edf2fb] bg-[#fbfcff] px-4 py-3">
            <p class="text-[11px] font-bold uppercase tracking-[0.14em] text-[#0000ff]/65">
              {{ $t("community.tabs.pages.favorite") }}
            </p>
            <p class="mt-1 text-[1.25rem] font-black text-[#243b63]">
              {{ favoriteCount }}
            </p>
          </div>
          <div class="rounded-[20px] border border-[#edf2fb] bg-[#fbfcff] px-4 py-3">
            <p class="text-[11px] font-bold uppercase tracking-[0.14em] text-[#0000ff]/65">
              {{ $t("community.groups.stats.status") }}
            </p>
            <p class="mt-1 text-[13px] font-semibold text-[#243b63]">
              {{ activeTabStatus }}
            </p>
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

    <section class="rounded-[28px] border border-[#dbe3f2] bg-white px-5 py-5 shadow-[0_12px_30px_rgba(15,35,110,0.06)]">
      <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p class="text-[11px] font-bold uppercase tracking-[0.18em] text-[#0000ff]/65">
            {{ activeTabLabel }}
          </p>
          <p class="mt-1 text-[14px] leading-6 text-slate-500">
            {{ activeTabHint }}
          </p>
        </div>

        <UButton
          to="/create-page"
          color="neutral"
          variant="outline"
          size="lg"
          class="rounded-full text-[13px] font-bold"
        >
          <Icon name="i-ph-plus-bold" class="mr-2 h-4 w-4" />
          {{ $t("community.pagesDirectory.createAction") }}
        </UButton>
      </div>
    </section>

    <section
      v-if="mode === 'mine' && visiblePages.length === 0"
      class="rounded-[30px] border border-[#dbe3f2] bg-white px-5 py-12 shadow-[0_14px_34px_rgba(15,35,110,0.06)] sm:px-8 sm:py-16 lg:min-h-[520px]"
    >
      <div class="flex h-full flex-col items-center justify-center text-center">
        <FoundationEmptyState
          icon="i-ph-flag-fill"
          :title="$t('community.pagesDirectory.emptyMineTitle')"
          :description="$t('community.pagesDirectory.emptyMineDesc')"
        />

        <div class="mt-6 flex justify-center">
          <NuxtLink
            to="/create-page"
            class="inline-flex h-12 items-center justify-center rounded-[16px] bg-[#0000ff] px-5 text-[14px] font-extrabold text-white shadow-[0_12px_24px_rgba(0,0,255,0.24)] transition hover:-translate-y-0.5 hover:bg-[#0000e0]"
          >
            <Icon name="i-ph-plus-bold" class="mr-2 h-4 w-4" />
            {{ $t("community.pagesDirectory.createFirst") }}
          </NuxtLink>
        </div>
      </div>
    </section>

    <section
      v-else-if="visiblePages.length === 0"
      class="rounded-[30px] border border-[#dbe3f2] bg-white px-5 py-12 text-center shadow-[0_14px_34px_rgba(15,35,110,0.06)] sm:px-8 sm:py-16"
    >
      <div class="mx-auto max-w-xl">
        <FoundationEmptyState
          icon="i-ph-magnifying-glass"
          :title="$t('community.pagesDirectory.emptyOtherTitle')"
          :description="$t('community.pagesDirectory.emptyOtherDesc')"
        />
      </div>
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
import {
  appendCommunityQuery,
  communityPageDirectory,
  communityPageRouteMap,
  communityPageTabs,
} from "../../../types/community"
import type { CommunityPageRecord, CommunityPageTab } from "../../../types/community"

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

  return pages.filter(page => {
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
