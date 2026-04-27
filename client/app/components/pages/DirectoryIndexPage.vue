<template>
  <div class="mx-auto max-w-[1440px] space-y-8 px-4 pb-20 pt-6 sm:px-6">
    <!-- GoPro Style Hero -->
    <DirectoryHero
      :stats="heroStats"
      :status-label="heroStatusLabel"
      :active-category-label="selectedCategory !== 'all' ? activeCategoryLabel : ''"
      :search-term="search"
    />

    <div class="grid gap-8 xl:grid-cols-[minmax(0,1fr)_360px] xl:items-start">
      <main class="space-y-8 min-w-0">
        <!-- Filters Section -->
        <DirectoryFilters
          v-model:search="search"
          v-model:selected-category="selectedCategory"
          :categories="categories"
          :result-count="filteredItems.length"
          :status-label="filtersStatusLabel"
          :can-reset="hasActiveFilters"
          @reset="resetFilters"
        />

        <!-- Results Header Card -->
        <div class="overflow-hidden rounded-[32px] border border-[#dbe3f2] bg-white shadow-xl p-6 sm:p-8">
          <div class="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div class="space-y-1">
              <div class="flex items-center gap-2">
                <div class="h-1.5 w-6 rounded-full bg-primary-500" />
                <p class="text-[11px] font-black uppercase tracking-[0.15em] text-slate-400">
                  {{ t("pages.directoryPage.resultsEyebrow") }}
                </p>
              </div>
              <h2 class="text-[28px] font-black tracking-tight text-[#0f172a] sm:text-[34px]">
                {{ resultHeading }}
              </h2>
              <p class="text-[14px] font-bold text-slate-400">
                {{ t("pages.directoryPage.matchingItems", { count: filteredItems.length }) }}
              </p>
            </div>

            <div class="flex flex-wrap items-center gap-2">
              <UBadge
                v-if="selectedCategory !== 'all'"
                color="primary"
                variant="solid"
                class="rounded-xl px-4 py-2 font-black text-[11px] uppercase tracking-wider shadow-lg shadow-primary-500/20"
              >
                {{ activeCategoryLabel }}
              </UBadge>
              
              <UButton
                v-if="hasActiveFilters"
                color="gray"
                variant="soft"
                size="md"
                class="rounded-xl font-black text-[12px] uppercase tracking-wider"
                @click="resetFilters"
              >
                <template #leading>
                  <Icon name="i-ph-x-circle-bold" class="h-4 w-4" />
                </template>
                {{ t("pages.directoryPage.resetFilters") }}
              </UButton>
            </div>
          </div>
        </div>

        <!-- Items Grid -->
        <div v-if="filteredItems.length > 0" class="grid gap-6 md:grid-cols-2 2xl:grid-cols-3">
          <DirectoryCard
            v-for="item in filteredItems"
            :key="item.id"
            :item="item"
          />
        </div>

        <!-- Empty State -->
        <div
          v-else
          class="rounded-[32px] border border-[#dbe3f2] bg-white p-12 text-center shadow-lg lg:p-24"
        >
          <div class="mx-auto max-w-sm space-y-6">
            <div class="flex h-20 w-20 mx-auto items-center justify-center rounded-[30px] bg-slate-50 text-slate-300">
              <Icon name="i-ph-squares-four-duotone" class="h-10 w-10" />
            </div>
            <div class="space-y-2">
              <h3 class="text-xl font-black text-[#0f172a]">{{ t('pages.directoryPage.emptyTitle') }}</h3>
              <p class="text-sm font-medium text-slate-500">{{ t('pages.directoryPage.emptyDescription') }}</p>
            </div>
            <UButton
              v-if="hasActiveFilters"
              color="primary"
              variant="solid"
              size="lg"
              class="h-12 rounded-xl px-8 font-black shadow-lg"
              @click="resetFilters"
            >
              {{ t("pages.directoryPage.resetFilters") }}
            </UButton>
          </div>
        </div>
      </main>

      <DirectorySidebar
        :categories="categories"
        :counts="categoryCounts"
        :featured="featuredItems"
        :selected-category="selectedCategory"
        :status-label="filtersStatusLabel"
        :has-active-filters="hasActiveFilters"
        @select-category="selectedCategory = $event"
        @reset="resetFilters"
      />
    </div>
  </div>
</template>


<script setup lang="ts">
import { useStorage, watchDebounced } from "@vueuse/core"
import {
  directoryCategoryKeys,
  type DirectoryCategoryKey,
} from "~/composables/useMockDirectoryData"

function readQueryValue(value: unknown) {
  if (Array.isArray(value)) return String(value[0] || "")
  return typeof value === "string" ? value : ""
}

function normalizeCategory(value: string): DirectoryCategoryKey {
  return directoryCategoryKeys.includes(value as DirectoryCategoryKey)
    ? value as DirectoryCategoryKey
    : "all"
}

const { t, locale } = useI18n()
const route = useRoute()
const router = useRouter()
const { categories, items } = useMockDirectoryData()

const storedSearch = useStorage(
  "directory:search",
  "",
  undefined,
  { initOnMounted: true },
)
const storedCategory = useStorage<DirectoryCategoryKey>(
  "directory:category",
  "all",
  undefined,
  { initOnMounted: true },
)

const search = ref(readQueryValue(route.query.q).trim())
const selectedCategory = ref<DirectoryCategoryKey>(normalizeCategory(readQueryValue(route.query.category)))

const activeCategoryLabel = computed(() =>
  categories.value.find(category => category.value === selectedCategory.value)?.label
  ?? t("pages.directoryPage.allCategories"),
)

const hasActiveFilters = computed(() =>
  search.value.trim().length > 0 || selectedCategory.value !== "all",
)

const filteredItems = computed(() => {
  const keyword = search.value.trim().toLowerCase()

  return items.value.filter((item) => {
    const matchesCategory = selectedCategory.value === "all" || item.category === selectedCategory.value
    const matchesKeyword = keyword.length === 0 || [
      item.title,
      item.categoryLabel,
      item.description,
      item.meta,
      item.count,
      ...item.tags,
    ].some(field => field.toLowerCase().includes(keyword))

    return matchesCategory && matchesKeyword
  })
})

const categoryCounts = computed(() => {
  const counts: Record<string, number> = { all: items.value.length }
  for (const category of categories.value) {
    if (category.value === "all") continue
    counts[category.value] = items.value.filter(item => item.category === category.value).length
  }
  return counts
})

const featuredItems = computed(() => {
  const scopedItems = filteredItems.value.filter(item => item.featured)
  if (scopedItems.length > 0) return scopedItems.slice(0, 4)
  return items.value.filter(item => item.featured).slice(0, 4)
})

const formatNumber = (value: number) =>
  new Intl.NumberFormat(locale.value === "vi" ? "vi-VN" : "en-US").format(value)

const heroStats = computed(() => [
  {
    label: t("pages.directoryPage.statSubcategories"),
    value: formatNumber(categories.value.length - 1),
    description: t("pages.directoryPage.statSubcategoriesDescription"),
  },
  {
    label: t("pages.directoryPage.statItems"),
    value: formatNumber(items.value.length),
    description: t("pages.directoryPage.statItemsDescription"),
  },
  {
    label: t("pages.directoryPage.statFeatured"),
    value: formatNumber(items.value.filter(item => item.featured).length),
    description: t("pages.directoryPage.statFeaturedDescription"),
  },
])

const resultHeading = computed(() => {
  if (search.value && selectedCategory.value !== "all") {
    return t("pages.directoryPage.resultHeadingSearchCategory", {
      query: search.value,
      category: activeCategoryLabel.value,
    })
  }

  if (search.value) {
    return t("pages.directoryPage.resultHeadingSearch", {
      query: search.value,
    })
  }

  if (selectedCategory.value === "all") return t("pages.directoryPage.allCategories")
  return activeCategoryLabel.value || t("pages.directoryPage.resultFallback")
})

const filtersStatusLabel = computed(() => {
  if (search.value && selectedCategory.value !== "all") {
    return t("pages.directoryPage.filterStatusSearchCategory", {
      count: formatNumber(filteredItems.value.length),
      query: search.value,
      category: activeCategoryLabel.value,
    })
  }

  if (search.value) {
    return t("pages.directoryPage.filterStatusSearch", {
      count: formatNumber(filteredItems.value.length),
      query: search.value,
    })
  }

  if (selectedCategory.value !== "all") {
    return t("pages.directoryPage.filterStatusCategory", {
      count: formatNumber(filteredItems.value.length),
      category: activeCategoryLabel.value,
    })
  }

  return t("pages.directoryPage.filterStatusDefault", {
    count: formatNumber(items.value.length),
  })
})

const heroStatusLabel = computed(() => {
  if (search.value && selectedCategory.value !== "all") {
    return t("pages.directoryPage.heroStatusSearchCategory", {
      query: search.value,
      category: activeCategoryLabel.value,
      count: formatNumber(filteredItems.value.length),
    })
  }

  if (search.value) {
    return t("pages.directoryPage.heroStatusSearch", {
      query: search.value,
      count: formatNumber(filteredItems.value.length),
    })
  }

  if (selectedCategory.value !== "all") {
    return t("pages.directoryPage.heroStatusCategory", {
      category: activeCategoryLabel.value,
      count: formatNumber(filteredItems.value.length),
    })
  }

  return t("pages.directoryPage.heroStatusAll", {
    count: formatNumber(items.value.length),
  })
})

watch(() => route.query.q, (value) => {
  const nextSearch = readQueryValue(value).trim()
  if (nextSearch !== search.value) {
    search.value = nextSearch
  }
})

watch(() => route.query.category, (value) => {
  const nextCategory = normalizeCategory(readQueryValue(value))
  if (nextCategory !== selectedCategory.value) {
    selectedCategory.value = nextCategory
  }
})

onMounted(() => {
  if (!search.value && storedSearch.value.trim()) {
    search.value = storedSearch.value.trim()
  }

  if (selectedCategory.value === "all" && storedCategory.value !== "all") {
    selectedCategory.value = normalizeCategory(storedCategory.value)
  }
})

watchDebounced(search, () => {
  const normalizedSearch = search.value.trim()

  if (normalizedSearch !== search.value) {
    search.value = normalizedSearch
    return
  }

  storedSearch.value = normalizedSearch
  syncRoute()
}, { debounce: 250, maxWait: 800 })

watch(selectedCategory, (value) => {
  storedCategory.value = value
  syncRoute()
})

function resetFilters() {
  search.value = ""
  selectedCategory.value = "all"
}

function syncRoute() {
  const currentSearch = readQueryValue(route.query.q).trim()
  const currentCategory = normalizeCategory(readQueryValue(route.query.category))
  const nextSearch = search.value.trim()

  if (currentSearch === nextSearch && currentCategory === selectedCategory.value) {
    return
  }

  const nextQuery = { ...route.query }

  if (nextSearch) {
    nextQuery.q = nextSearch
  }
  else {
    delete nextQuery.q
  }

  if (selectedCategory.value !== "all") {
    nextQuery.category = selectedCategory.value
  }
  else {
    delete nextQuery.category
  }

  router.replace({ query: nextQuery })
}
</script>
