<template>
  <div class="mx-auto max-w-[1320px] space-y-8 pb-16 pt-8 px-4 sm:px-6">
    <SearchFiltersPanel
      v-model:keyword="searchText"
      v-model:type="selectedType"
      v-model:sort="selectedSort"
      :type-options="searchTypeOptions"
      :sort-options="searchSortOptions"
      :tabs="tabItems"
      :quick-keywords="quickKeywords"
      @submit="commitSearch"
      @quick-search="applyQuickKeyword"
    />

    <!-- Summary Cards -->
    <section
      v-if="hasKeyword"
      class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
    >
      <article
        v-for="item in summaryCards"
        :key="item.label"
        class="surface-card p-6 border-secondary-100 flex flex-col justify-center"
      >
        <p class="text-micro font-bold uppercase tracking-[0.2em] text-[var(--text-primary)]">
          {{ item.label }}
        </p>
        <div class="mt-2 flex items-baseline gap-2">
          <p class="text-3xl font-black text-[var(--text-primary)] leading-none">
            {{ item.value }}
          </p>
          <span class="text-xs font-bold text-[var(--text-primary)]">results</span>
        </div>
        <p class="mt-3 text-xs font-medium text-[var(--text-primary)] leading-relaxed">
          {{ item.description }}
        </p>
      </article>
    </section>

    <!-- Empty State (No keyword) -->
    <section
      v-if="!hasKeyword"
      class="surface-card p-12 sm:p-20 border-secondary-100"
    >
      <div class="flex flex-col items-center justify-center text-center max-w-2xl mx-auto">
        <div class="flex h-24 w-24 items-center justify-center rounded-3xl bg-primary-50 text-3xl font-black text-[var(--text-primary)] border border-primary-100 shadow-sm mb-8">
          {{ idleMonogram }}
        </div>
        <h2 class="text-2xl font-black text-[var(--text-primary)] tracking-tight">
          {{ $t('community.search.emptyState.title') }}
        </h2>
        <p class="mt-3 text-body-secondary text-base leading-relaxed">
          {{ $t('community.search.emptyState.desc') }}
        </p>
      </div>
    </section>

    <!-- No Results found -->
    <section
      v-else-if="totalResults === 0"
      class="surface-card p-12 sm:p-20 border-secondary-100"
    >
      <div class="mx-auto max-w-2xl text-center">
        <FoundationEmptyState
          icon="i-ph-magnifying-glass-duotone"
          :title="$t('community.search.emptyValue.title')"
          :description="$t('community.search.emptyValue.desc', { keyword: searchText.trim() })"
        />

        <div class="mt-10 flex flex-wrap justify-center gap-3">
          <UButton
            color="primary"
            size="lg"
            class="rounded-full font-black px-8 shadow-lg shadow-primary-500/20"
            @click="clearFilters"
          >
            {{ $t('community.search.clearFilters') }}
          </UButton>

          <UButton
            v-for="item in quickKeywords.slice(0, 3)"
            :key="item"
            variant="soft"
            color="gray"
            size="lg"
            class="rounded-full px-6 font-bold"
            @click="applyQuickKeyword(item)"
          >
            {{ $t('community.search.tryKeyword', { keyword: item }) }}
          </UButton>
        </div>
      </div>
    </section>

    <!-- Main Results Flow -->
    <div v-else class="space-y-8">
      <section class="surface-card p-6 sm:p-8 border-secondary-100/50">
        <div class="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div class="space-y-1">
            <p class="text-micro font-bold uppercase tracking-widest text-[var(--text-primary)]">
              {{ $t('community.search.results.label') }}
            </p>
            <h2 class="text-2xl font-black text-[var(--text-primary)] leading-tight">
              {{ resultHeading }}
            </h2>
            <p class="text-body-secondary text-sm">
              {{ resultDescription }}
            </p>
          </div>

          <UButton
            v-if="selectedType !== 'all'"
            variant="soft"
            color="primary"
            size="md"
            class="rounded-full font-black px-6"
            @click="showAllResults"
          >
            {{ $t('community.search.results.showAllTypes') }}
          </UButton>
        </div>
      </section>

      <section
        v-for="section in visibleSections"
        :key="section.kind"
        class="space-y-6 surface-card p-6 sm:p-8 border-secondary-100/30"
      >
        <div class="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between border-b border-secondary-100/50 pb-6">
          <div class="space-y-1">
            <p class="text-label-primary text-[var(--text-primary)] uppercase tracking-widest text-xs font-black">
              {{ $t(`community.search.tabs.${section.kind}.label`) }}
            </p>
            <p class="text-body-secondary text-sm">
              {{ $t(`community.search.tabs.${section.kind}.desc`) }}
            </p>
          </div>

          <UButton
            v-if="selectedType === 'all' && section.items.length > section.visibleItems.length"
            variant="ghost"
            color="primary"
            size="sm"
            class="rounded-full font-black px-4"
            @click="selectOnlyType(section.kind)"
          >
            {{ $t('community.search.results.viewAllOfSpecific', { count: section.items.length }) }}
          </UButton>
        </div>

        <div class="grid gap-6 lg:grid-cols-2">
          <SearchResultCard
            v-for="item in section.visibleItems"
            :key="item.id"
            :result="item"
          />
        </div>
      </section>
    </div>

    <!-- Footer -->
    <footer class="surface-card p-6 sm:p-8 border-secondary-100/50">
      <div class="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div class="flex flex-wrap items-center gap-x-8 gap-y-3 text-sm font-bold text-[var(--text-primary)]">
          <span class="text-[var(--text-primary)]">© 2026 VNSEEA</span>
          <NuxtLink
            v-for="link in primaryFooterLinks"
            :key="link.label"
            :to="link.to || appRoutes.feed"
            class="transition hover:text-secondary-900"
          >
            {{ $t(link.label) }}
          </NuxtLink>
        </div>

        <UButton
          variant="ghost"
          color="gray"
          size="sm"
          class="rounded-full font-black text-[var(--text-primary)] hover:text-secondary-900"
        >
          <template #leading>
            <Icon name="i-ph-globe-hemisphere-west-fill" class="h-4 w-4" />
          </template>
          {{ $t('community.search.footer.language') }}
        </UButton>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { appRoutes } from "#shared-kernel/application/constants/route-registry"
import FoundationEmptyState from "../../../foundation/presentation/components/EmptyState.vue"
import SearchFiltersPanel from "../components/FiltersPanel.vue"
import SearchResultCard from "../components/ResultCard.vue"
import type {
  SearchCollectionType,
  SearchResultItem,
  SearchResultType,
  SearchSortKey,
} from "../../application/composables/useMockSearchData"
import { useMockSearchData } from "../../application/composables/useMockSearchData"

type SearchSection = {
  kind: SearchCollectionType
  label: string
  description: string
  items: SearchResultItem[]
  visibleItems: SearchResultItem[]
}

function readQueryValue(value: unknown) {
  if (Array.isArray(value)) return String(value[0] || "")
  return typeof value === "string" ? value : ""
}

function normalizeKeyword(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ")
}

const footerLinks = [
  { label: "community.search.footer.home", to: appRoutes.feed },
  { label: "community.search.footer.about", to: undefined },
  { label: "community.search.footer.contact", to: undefined },
  { label: "community.search.footer.privacy", to: undefined },
  { label: "community.search.footer.terms", to: undefined },
  { label: "community.search.footer.blog", to: appRoutes.blogs },
  { label: "community.search.footer.developers", to: undefined },
]

const primaryFooterLinks = footerLinks.filter(link => link.to)
const secondaryFooterLinks = footerLinks.filter(link => !link.to)

const route = useRoute()
const router = useRouter()

const {
  quickKeywords,
  searchTabs,
  searchTypeOptions,
  searchSortOptions,
  resultsByType,
} = useMockSearchData()

const { t } = useI18n()

const collectionKinds: SearchCollectionType[] = ["users", "pages", "groups", "posts"]

const normalizeType = (value: string): SearchResultType =>
  searchTypeOptions.some(option => option.value === value)
    ? value as SearchResultType
    : "all"

const normalizeSort = (value: string): SearchSortKey =>
  searchSortOptions.some(option => option.value === value)
    ? value as SearchSortKey
    : "relevance"

// 1. Breakpoints logic
const { isMobile } = useAppBreakpoints()

// 2. Search logic with debouncing and URL sync
const { searchQuery: searchText, debouncedSearchQuery } = useDebouncedSearch({
  debounceMs: 500,
  syncUrl: true,
  queryParamName: "q"
})

// Other filters (no debounce needed, simple sync)
const selectedType = ref<SearchResultType>(normalizeType(readQueryValue(route.query.type)))
const selectedSort = ref<SearchSortKey>(normalizeSort(readQueryValue(route.query.sort)))

const hasKeyword = computed(() => searchText.value.trim().length > 0)
const idleMonogram = computed(() => searchText.value.trim().charAt(0).toUpperCase() || "A")

const keywordTokens = computed(() =>
  normalizeKeyword(searchText.value)
    .split(" ")
    .map(token => token.replace(/^#+/, ""))
    .filter(Boolean),
)

function syncFromRoute() {
  const nextType = normalizeType(readQueryValue(route.query.type))
  const nextSort = normalizeSort(readQueryValue(route.query.sort))

  if (nextType !== selectedType.value) selectedType.value = nextType
  if (nextSort !== selectedSort.value) selectedSort.value = nextSort
}

watch(
  () => [route.query.type, route.query.sort],
  syncFromRoute,
)

function commitSearch() {
  const nextType = selectedType.value === "all" ? "" : selectedType.value
  const nextSort = selectedSort.value === "relevance" ? "" : selectedSort.value

  const nextQuery: Record<string, string> = { ...route.query }
  if (nextType) nextQuery.type = nextType; else delete nextQuery.type
  if (nextSort) nextQuery.sort = nextSort; else delete nextQuery.sort

  void router.replace({ path: appRoutes.search, query: nextQuery })
}

watch(selectedType, commitSearch)
watch(selectedSort, commitSearch)

function matchesKeyword(item: SearchResultItem) {
  if (!keywordTokens.value.length) return true

  return keywordTokens.value.every(token =>
    item.searchableText.includes(token),
  )
}

function relevanceScore(item: SearchResultItem) {
  const keyword = normalizeKeyword(searchText.value).replace(/^#+/, "")
  if (!keyword) return item.popularityScore * 0.05 + item.recentScore * 0.3

  const title = item.title.toLowerCase()
  const subtitle = item.subtitle.toLowerCase()
  const description = item.description.toLowerCase()
  const normalizedTags = item.tags.map(tag => tag.toLowerCase())

  let score = item.popularityScore * 0.05 + item.recentScore * 0.3

  if (title.includes(keyword)) score += 44
  if (subtitle.includes(keyword)) score += 20
  if (description.includes(keyword)) score += 12
  if (normalizedTags.some(tag => tag.includes(keyword))) score += 18
  if (item.searchableText.startsWith(keyword)) score += 10

  return score
}

function sortItems(items: SearchResultItem[]) {
  return items.slice().sort((left, right) => {
    if (selectedSort.value === "popular") {
      return right.popularityScore - left.popularityScore || right.recentScore - left.recentScore
    }

    if (selectedSort.value === "recent") {
      return right.recentScore - left.recentScore || right.popularityScore - left.popularityScore
    }

    return relevanceScore(right) - relevanceScore(left) || right.popularityScore - left.popularityScore
  })
}

const filteredResults = computed<Record<SearchCollectionType, SearchResultItem[]>>(() => ({
  users: sortItems(resultsByType.value.users.filter(matchesKeyword)),
  pages: sortItems(resultsByType.value.pages.filter(matchesKeyword)),
  groups: sortItems(resultsByType.value.groups.filter(matchesKeyword)),
  posts: sortItems(resultsByType.value.posts.filter(matchesKeyword)),
}))

const tabItems = computed(() =>
  searchTabs.map((tab) => {
    const count = tab.value === "all"
      ? collectionKinds.reduce((sum, kind) => sum + filteredResults.value[kind].length, 0)
      : filteredResults.value[tab.value].length

    return {
      ...tab,
      count,
    }
  }),
)

const totalResults = computed(() =>
  collectionKinds.reduce((sum, kind) => sum + filteredResults.value[kind].length, 0),
)

const currentTypeLabel = computed(() =>
  searchTypeOptions.find(option => option.value === selectedType.value)
    ? t(`community.search.types.${selectedType.value}`)
    : t('community.search.types.all')
)

const summaryCards = computed(() => [
  {
    label: t('community.search.summary.total.label'),
    value: totalResults.value,
    description: hasKeyword.value
      ? t('community.search.summary.total.descQuery', { keyword: searchText.value.trim() })
      : t('community.search.summary.total.descEmpty'),
  },
  {
    label: t('community.search.summary.users.label'),
    value: filteredResults.value.users.length,
    description: t('community.search.summary.users.desc'),
  },
  {
    label: t('community.search.summary.communities.label'),
    value: filteredResults.value.pages.length + filteredResults.value.groups.length,
    description: t('community.search.summary.communities.desc'),
  },
  {
    label: t('community.search.summary.posts.label'),
    value: filteredResults.value.posts.length,
    description: t('community.search.summary.posts.desc'),
  },
])

const visibleSections = computed<SearchSection[]>(() => {
  if (!hasKeyword.value) return []

  const sections = collectionKinds
    .filter(kind => selectedType.value === "all" || selectedType.value === kind)
    .map((kind) => {
      const source = filteredResults.value[kind]
      const config = searchTabs.find(tab => tab.value === kind)

      return {
        kind,
        label: config?.label ?? kind,
        description: config?.description ?? "",
        items: source,
        visibleItems: selectedType.value === "all" 
          ? source.slice(0, isMobile.value ? 2 : 4) 
          : source,
      }
    })

  return sections.filter(section => section.items.length > 0)
})

const resultHeading = computed(() =>
  totalResults.value === 1
    ? t('community.search.results.headingSingle', { type: currentTypeLabel.value.toLowerCase() })
    : t('community.search.results.headingMultiple', { count: totalResults.value, type: currentTypeLabel.value.toLowerCase() })
)

const resultDescription = computed(() => {
  const keyword = searchText.value.trim()
  if (!keyword) return t('community.search.results.descEmpty')

  if (selectedType.value === "all") {
    return t('community.search.results.descAll', { keyword })
  }

  return t('community.search.results.descSpecific', { type: currentTypeLabel.value.toLowerCase(), keyword })
})

function applyQuickKeyword(keyword: string) {
  searchText.value = keyword
  commitSearch()
}

function clearFilters() {
  searchText.value = ""
  selectedType.value = "all"
  selectedSort.value = "relevance"
  commitSearch()
}

function selectOnlyType(kind: SearchCollectionType) {
  selectedType.value = kind
  commitSearch()
}

function showAllResults() {
  selectedType.value = "all"
  commitSearch()
}

useSeoMeta({
  title: computed(() => {
    const keyword = searchText.value.trim()
    return keyword ? t('community.search.seoTitleQuery', { query: keyword }) : t('community.search.seoTitle')
  }),
  description: computed(() => {
    const keyword = searchText.value.trim()
    return keyword
      ? t('community.search.seoDescQuery', { query: keyword })
      : t('community.search.seoDesc')
  }),
})
</script>
