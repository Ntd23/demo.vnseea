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
          Bạn đang tìm gì vậy?
        </p>
        <p class="mt-2 max-w-xl text-[14px] leading-7 text-slate-500">
          Nhập một từ khóa phía trên để tìm người dùng, fanpage, nhóm hoặc bài đăng. Bạn cũng có thể bắt đầu bằng các gợi ý nhanh đang xuất hiện trong bộ lọc.
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
          title="Không tìm thấy kết quả phù hợp"
          :description="`Không có mục nào khớp với từ khóa “${searchText.trim()}”. Thử đổi loại kết quả, đổi cách viết hoặc chọn một gợi ý khác.`"
        />

        <div class="mt-6 flex flex-wrap justify-center gap-3">
          <button
            class="inline-flex h-11 items-center justify-center rounded-full bg-[#0000ff] px-5 text-[13px] font-bold text-white shadow-[0_12px_24px_rgba(0,0,255,0.24)] transition hover:-translate-y-0.5 hover:bg-[#0000e0]"
            type="button"
            @click="clearFilters"
          >
            Xóa bộ lọc
          </button>

          <button
            v-for="item in quickKeywords.slice(0, 3)"
            :key="item"
            class="inline-flex h-11 items-center justify-center rounded-full border border-[#dbe3f2] bg-[#f8fbff] px-4 text-[13px] font-bold text-[#243b63] transition hover:border-[#c8d6f2] hover:text-[#0000ff]"
            type="button"
            @click="applyQuickKeyword(item)"
          >
            Thử {{ item }}
          </button>
        </div>
      </div>
    </section>

    <div v-else class="space-y-5">
      <section class="rounded-[28px] border border-[#dbe3f2] bg-white px-5 py-5 shadow-[0_14px_30px_rgba(15,35,110,0.06)]">
        <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p class="text-[11px] font-black uppercase tracking-[0.18em] text-[#0000ff]/60">
              Kết quả
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
            Hiện tất cả loại kết quả
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
              {{ section.label }}
            </p>
            <p class="mt-1 text-[14px] leading-6 text-slate-500">
              {{ section.description }}
            </p>
          </div>

          <button
            v-if="selectedType === 'all' && section.items.length > section.visibleItems.length"
            class="inline-flex h-11 items-center justify-center rounded-full border border-[#dbe3f2] bg-[#f8fbff] px-4 text-[13px] font-bold text-[#243b63] transition hover:border-[#c8d6f2] hover:text-[#0000ff]"
            type="button"
            @click="selectOnlyType(section.kind)"
          >
            Xem tất cả {{ section.items.length }} kết quả
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
          <span>© 2026 VNSEEA</span>
          <NuxtLink
            v-for="link in primaryFooterLinks"
            :key="link.label"
            :to="link.to || '/home'"
            class="transition hover:text-[#0000ff]"
          >
            {{ link.label }}
          </NuxtLink>
          <button
            v-for="link in secondaryFooterLinks"
            :key="link.label"
            class="transition hover:text-[#0000ff]"
            type="button"
          >
            {{ link.label }}
          </button>
        </div>

        <button class="inline-flex items-center gap-2 font-semibold text-[#4b5f82] transition hover:text-[#0000ff]" type="button">
          <Icon name="i-ph-globe-hemisphere-west-fill" class="h-4 w-4" />
          Ngôn ngữ
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
  { label: "Trang chủ", to: "/home" },
  { label: "Về", to: undefined },
  { label: "Liên hệ chúng tôi", to: undefined },
  { label: "Chính sách bảo mật", to: undefined },
  { label: "Điều khoản sử dụng", to: undefined },
  { label: "Blog", to: "/blogs" },
  { label: "Nhà phát triển", to: undefined },
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
  users: sortItems(resultsByType.users.filter(matchesKeyword)),
  pages: sortItems(resultsByType.pages.filter(matchesKeyword)),
  groups: sortItems(resultsByType.groups.filter(matchesKeyword)),
  posts: sortItems(resultsByType.posts.filter(matchesKeyword)),
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
  searchTypeOptions.find(option => option.value === selectedType.value)?.label ?? "Tất cả kết quả",
)

const summaryCards = computed(() => [
  {
    label: "Tổng kết quả",
    value: totalResults.value,
    description: hasKeyword.value
      ? `Kết quả đang khớp với từ khóa “${searchText.value.trim()}”.`
      : "Số lượng mục đang có trong mock data.",
  },
  {
    label: "Người dùng",
    value: filteredResults.value.users.length,
    description: "Liên hệ, gợi ý kết nối và thành viên cộng đồng.",
  },
  {
    label: "Cộng đồng",
    value: filteredResults.value.pages.length + filteredResults.value.groups.length,
    description: "Tổng fanpage và nhóm đang khớp với bộ lọc hiện tại.",
  },
  {
    label: "Bài đăng",
    value: filteredResults.value.posts.length,
    description: "Những thảo luận và nội dung có liên quan tới từ khóa.",
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
    ? `1 kết quả trong mục ${currentTypeLabel.value.toLowerCase()}`
    : `${totalResults.value} kết quả trong mục ${currentTypeLabel.value.toLowerCase()}`,
)

const resultDescription = computed(() => {
  const keyword = searchText.value.trim()
  if (!keyword) return "Kết quả sẽ xuất hiện tại đây khi bạn nhập từ khóa."

  if (selectedType.value === "all") {
    return `Bạn đang xem tổng hợp tất cả loại kết quả cho “${keyword}”. Chọn từng tab nếu muốn đi sâu vào một tập dữ liệu cụ thể.`
  }

  return `Danh sách dưới đây đã được lọc trong phạm vi ${currentTypeLabel.value.toLowerCase()} cho từ khóa “${keyword}”.`
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
    return keyword ? `Tìm kiếm "${keyword}" | VNSEEA` : "Tìm kiếm | VNSEEA"
  }),
  description: computed(() => {
    const keyword = searchText.value.trim()
    return keyword
      ? `Tra cứu người dùng, fanpage, nhóm và bài đăng liên quan tới ${keyword} trên VNSEEA.`
      : "Trang tìm kiếm tổng hợp người dùng, fanpage, nhóm và bài đăng trong VNSEEA."
  }),
})
</script>
