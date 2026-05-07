<!-- Description: Renders the pages directory as a content-first list shell matching the legacy PHP page order. -->
<template>
  <div class="mx-auto max-w-[1120px] space-y-4 px-3 pb-10 sm:px-5 lg:px-6">
    <CommunityPageDirectoryTabsBar v-model:search="search" :tabs="tabItems" :active-tab="mode"
      :status-label="filterStatusLabel" />

    <div v-if="pending" class="grid gap-4 lg:grid-cols-2">
      <div v-for="item in 4" :key="item" class="skeleton-card">
        <div class="skeleton-cover">
          <div class="skeleton skeleton-bg"></div>
          
          <div class="skeleton-overlay-top-left">
            <div class="skeleton skeleton-pill w-[180px] h-[28px]"></div>
          </div>

          <div class="skeleton-overlay-top-right">
            <div class="skeleton skeleton-circle h-[34px] w-[34px]"></div>
          </div>

          <div class="skeleton-overlay-info">
            <div class="skeleton skeleton-avatar"></div>
            <div class="skeleton-info-text">
              <div class="skeleton skeleton-text w-[70%] h-[20px]"></div>
              <div class="skeleton skeleton-text w-[40%] h-[14px]"></div>
            </div>
          </div>

          <div class="skeleton-overlay-stats">
            <div class="skeleton skeleton-pill w-[120px] h-[31px]"></div>
            <div class="skeleton skeleton-pill w-[120px] h-[31px]"></div>
          </div>

          <div class="skeleton-overlay-bottom-right">
            <div class="skeleton skeleton-circle h-[34px] w-[34px]"></div>
          </div>
        </div>
      </div>
    </div>

    <section v-else-if="visiblePages.length === 0"
      class="rounded-[18px] border border-[#e2e8f0] bg-white px-6 py-12 text-center shadow-[0_2px_12px_rgba(0,0,0,0.04)]">
      <FoundationEmptyState :icon="mode === 'mine' ? 'i-ph-flag-duotone' : 'i-ph-magnifying-glass-duotone'"
        :title="mode === 'mine' ? $t('community.pagesDirectory.emptyMineTitle') : $t('community.pagesDirectory.emptyOtherTitle')"
        :description="mode === 'mine' ? $t('community.pagesDirectory.emptyMineDesc') : $t('community.pagesDirectory.emptyOtherDesc')" />
    </section>

    <div v-else class="grid gap-4 lg:grid-cols-2">
      <CommunityPageCard v-for="page in visiblePages" :key="page.id" :page="page" :action-label="actionLabel" />
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
const isSearching = ref(false)
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

<style scoped>
.skeleton-card {
  overflow: hidden;
  border-radius: 18px;
  border: 1px solid #e2e8f0;
  background: #ffffff;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
}

.skeleton-cover {
  position: relative;
  height: 300px;
  width: 100%;
}

.skeleton {
  background: #334155;
  background: linear-gradient(
    90deg,
    #334155 25%,
    #475569 50%,
    #334155 75%
  );
  background-size: 200% 100%;
  animation: skeleton-shimmer 2s infinite linear;
}

@keyframes skeleton-shimmer {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}

.skeleton-bg {
  position: absolute;
  inset: 0;
}

.skeleton-pill {
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.15);
}

.skeleton-circle {
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.15);
}

.skeleton-avatar {
  width: 52px;
  height: 52px;
  border-radius: 16px;
  flex-shrink: 0;
  background: rgba(255, 255, 255, 0.15);
}

.skeleton-text {
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.15);
}

.skeleton-overlay-top-left {
  position: absolute;
  left: 12px;
  top: 12px;
  z-index: 10;
}

.skeleton-overlay-top-right {
  position: absolute;
  right: 12px;
  top: 12px;
  z-index: 10;
}

.skeleton-overlay-info {
  position: absolute;
  bottom: 52px;
  left: 12px;
  right: 12px;
  z-index: 10;
  display: flex;
  align-items: center;
  gap: 12px;
}

.skeleton-info-text {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.skeleton-overlay-stats {
  position: absolute;
  bottom: 12px;
  left: 12px;
  z-index: 10;
  display: flex;
  gap: 8px;
}

.skeleton-overlay-bottom-right {
  position: absolute;
  bottom: 12px;
  right: 12px;
  z-index: 10;
}
</style>
