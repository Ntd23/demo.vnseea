<template>
  <div class="mx-auto max-w-[1320px] space-y-6 pb-10 pt-5">
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

    <section
      v-if="hasKeyword"
      class="grid gap-3 sm:grid-cols-2 xl:grid-cols-4"
    >
      <article
        v-for="item in summaryCards"
        :key="item.label"
        class="rounded-[24px] border border-[#dbe3f2] bg-white px-5 py-4 shadow-[0_14px_30px_rgba(15,35,110,0.06)]"
      >
        <p class="text-[11px] font-black uppercase tracking-[0.18em] text-[#0000ff]/60">
          {{ item.label }}
        </p>
        <p class="mt-2 text-[1.7rem] font-black tracking-[-0.05em] text-[#243b63]">
          {{ item.value }}
        </p>
        <p class="mt-2 text-[13px] leading-6 text-slate-500">
          {{ item.description }}
        </p>
      </article>
    </section>

    <section
      v-if="!hasKeyword"
      class="overflow-hidden rounded-[32px] border border-[#dbe3f2] bg-white px-5 py-12 shadow-[0_16px_38px_rgba(15,35,110,0.06)] sm:px-8 sm:py-16"
    >
      <div class="flex min-h-[360px] flex-col items-center justify-center text-center">
        <div class="flex h-20 w-20 items-center justify-center rounded-full bg-[#9bb0c2] text-[2.1rem] font-light text-white">
          {{ idleMonogram }}
        </div>
        <p class="mt-5 text-[1.35rem] font-medium text-[#4b5f82]">
          {{ $t('community.search.emptyState.title') }}
        </p>
        <p class="mt-2 max-w-xl text-[14px] leading-7 text-slate-500">
          {{ $t('community.search.emptyState.desc') }}
        </p>
      </div>
    </section>

    <section
      v-else-if="totalResults === 0"
      class="overflow-hidden rounded-[32px] border border-[#dbe3f2] bg-white px-5 py-12 shadow-[0_16px_38px_rgba(15,35,110,0.06)] sm:px-8 sm:py-16"
    >
      <div class="mx-auto max-w-2xl text-center">
        <FoundationEmptyState
          icon="i-ph-magnifying-glass"
          :title="$t('community.search.emptyValue.title')"
          :description="$t('community.search.emptyValue.desc', { keyword: searchText.trim() })"
        />

        <div class="mt-6 flex flex-wrap justify-center gap-3">
          <button
            class="inline-flex h-11 items-center justify-center rounded-full bg-[#0000ff] px-5 text-[13px] font-bold text-white shadow-[0_12px_24px_rgba(0,0,255,0.24)] transition hover:-translate-y-0.5 hover:bg-[#0000e0]"
            type="button"
            @click="clearFilters"
          >
            {{ $t('community.search.clearFilters') }}
          </button>

          <button
            v-for="item in quickKeywords.slice(0, 3)"
            :key="item"
            class="inline-flex h-11 items-center justify-center rounded-full border border-[#dbe3f2] bg-[#f8fbff] px-4 text-[13px] font-bold text-[#243b63] transition hover:border-[#c8d6f2] hover:text-[#0000ff]"
            type="button"
            @click="applyQuickKeyword(item)"
          >
            {{ $t('community.search.tryKeyword', { keyword: item }) }}
          </button>
        </div>
      </div>
    </section>

    <div v-else class="space-y-5">
      <section class="rounded-[28px] border border-[#dbe3f2] bg-white px-5 py-5 shadow-[0_14px_30px_rgba(15,35,110,0.06)]">
        <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p class="text-[11px] font-black uppercase tracking-[0.18em] text-[#0000ff]/60">
              {{ $t('community.search.results.label') }}
            </p>
            <h2 class="mt-2 text-[1.55rem] font-black tracking-[-0.05em] text-[#243b63]">
              {{ resultHeading }}
            </h2>
            <p class="mt-2 text-[14px] leading-7 text-slate-500">
              {{ resultDescription }}
            </p>
          </div>

          <button
            v-if="selectedType !== 'all'"
            class="inline-flex h-11 items-center justify-center rounded-full border border-[#dbe3f2] bg-[#f8fbff] px-4 text-[13px] font-bold text-[#243b63] transition hover:border-[#c8d6f2] hover:text-[#0000ff]"
            type="button"
            @click="showAllResults"
          >
            {{ $t('community.search.results.showAllTypes') }}
          </button>
        </div>
      </section>

      <section
        v-for="section in visibleSections"
        :key="section.kind"
        class="space-y-4 rounded-[30px] border border-[#dbe3f2] bg-white px-5 py-5 shadow-[0_14px_32px_rgba(15,35,110,0.06)]"
      >
        <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p class="text-[11px] font-black uppercase tracking-[0.18em] text-[#0000ff]/60">
              {{ $t(`community.search.tabs.${section.kind}.label`) }}
            </p>
            <p class="mt-1 text-[14px] leading-6 text-slate-500">
              {{ $t(`community.search.tabs.${section.kind}.desc`) }}
            </p>
          </div>

          <button
            v-if="selectedType === 'all' && section.items.length > section.visibleItems.length"
            class="inline-flex h-11 items-center justify-center rounded-full border border-[#dbe3f2] bg-[#f8fbff] px-4 text-[13px] font-bold text-[#243b63] transition hover:border-[#c8d6f2] hover:text-[#0000ff]"
            type="button"
            @click="selectOnlyType(section.kind)"
          >
            {{ $t('community.search.results.viewAllOfSpecific', { count: section.items.length }) }}
          </button>
        </div>

        <div class="grid gap-4 lg:grid-cols-2">
          <SearchResultCard
            v-for="item in section.visibleItems"
            :key="item.id"
            :result="item"
          />
        </div>
      </section>
    </div>

    <footer class="rounded-[28px] border border-[#dbe3f2] bg-white px-5 py-5 shadow-[0_14px_30px_rgba(15,35,110,0.05)]">
      <div class="flex flex-col gap-4 border-t border-[#eef2fb] pt-5 text-[13px] text-slate-500 md:flex-row md:items-center md:justify-between">
        <div class="flex flex-wrap items-center gap-x-5 gap-y-2">
          <span>{{ $t('community.search.footer.copyright', { year: 2026 }) }}</span>
          <NuxtLink
            v-for="link in primaryFooterLinks"
            :key="link.label"
            :to="link.to || '/home'"
            class="transition hover:text-[#0000ff]"
          >
            {{ $t(link.label) }}
          </NuxtLink>
          <button
            v-for="link in secondaryFooterLinks"
            :key="link.label"
            class="transition hover:text-[#0000ff]"
            type="button"
          >
            {{ $t(link.label) }}
          </button>
        </div>

        <button class="inline-flex items-center gap-2 font-semibold text-[#4b5f82] transition hover:text-[#0000ff]" type="button">
          <Icon name="i-ph-globe-hemisphere-west-fill" class="h-4 w-4" />
          {{ $t('community.search.footer.language') }}
        </button>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import type {
  SearchCollectionType,
  SearchResultItem,
  SearchResultType,
  SearchSortKey,
} from "~/composables/useMockSearchData"

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
  { label: "community.search.footer.home", to: "/home" },
  { label: "community.search.footer.about", to: undefined },
  { label: "community.search.footer.contact", to: undefined },
  { label: "community.search.footer.privacy", to: undefined },
  { label: "community.search.footer.terms", to: undefined },
  { label: "community.search.footer.blog", to: "/blogs" },
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

const searchText = ref(readQueryValue(route.query.q))
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
  const nextKeyword = readQueryValue(route.query.q)
  const nextType = normalizeType(readQueryValue(route.query.type))
  const nextSort = normalizeSort(readQueryValue(route.query.sort))

  if (nextKeyword !== searchText.value) searchText.value = nextKeyword
  if (nextType !== selectedType.value) selectedType.value = nextType
  if (nextSort !== selectedSort.value) selectedSort.value = nextSort
}

watch(
  () => [route.query.q, route.query.type, route.query.sort],
  syncFromRoute,
)

function commitSearch() {
  const nextKeyword = searchText.value.trim()
  const nextType = selectedType.value === "all" ? "" : selectedType.value
  const nextSort = selectedSort.value === "relevance" ? "" : selectedSort.value

  if (
    nextKeyword === readQueryValue(route.query.q)
    && nextType === readQueryValue(route.query.type)
    && nextSort === readQueryValue(route.query.sort)
  ) {
    return
  }

  const nextQuery: Record<string, string> = {}
  if (nextKeyword) nextQuery.q = nextKeyword
  if (nextType) nextQuery.type = nextType
  if (nextSort) nextQuery.sort = nextSort

  void router.replace({ path: "/search", query: nextQuery })
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
        visibleItems: selectedType.value === "all" ? source.slice(0, 4) : source,
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
