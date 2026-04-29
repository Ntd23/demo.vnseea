<template>
  <div class="space-y-5 pb-10">
    <DirectoryHero
      :stats="heroStats"
      :status-label="heroStatusLabel"
      :active-category-label="selectedCategory !== 'all' ? activeCategoryLabel : ''"
      :search-term="search"
    />

    <DirectoryFilters
      v-model:search="search"
      v-model:selected-category="selectedCategory"
      :categories="categories"
      :result-count="filteredItems.length"
      :status-label="filtersStatusLabel"
      :can-reset="hasActiveFilters"
      @reset="resetFilters"
    />

    <div class="grid gap-5 xl:grid-cols-[minmax(0,1fr)_330px]">
      <main class="space-y-4">
        <UCard class="rounded-[18px] border border-[var(--border-default)] bg-white shadow-[0_2px_12px_rgba(0,0,0,0.04)]" :ui="{ body: 'p-5' }">
          <div class="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p class="text-label-secondary text-[var(--text-tertiary)]">{{ t("pages.directoryPage.resultsEyebrow") }}</p>
              <h2 class="mt-1 text-heading text-[var(--text-primary)]">{{ resultHeading }}</h2>
              <p class="mt-1 text-body-secondary">{{ t("pages.directoryPage.matchingItems", { count: filteredItems.length }) }}</p>
            </div>

            <div class="flex flex-wrap items-center gap-2">
              <UBadge color="primary" variant="subtle" class="rounded-full px-3 py-1.5 text-[12px] font-semibold">
                {{ activeCategoryLabel }}
              </UBadge>
              <UBadge
                v-if="search"
                color="neutral"
                variant="soft"
                class="rounded-full px-3 py-1.5 text-[12px] font-semibold"
              >
                {{ t("pages.directoryPage.queryBadge", { query: search }) }}
              </UBadge>
              <UButton
                v-if="hasActiveFilters"
                color="neutral"
                variant="outline"
                size="sm"
                class="rounded-xl font-semibold"
                @click="resetFilters"
              >
                <Icon name="i-ph-x-circle-bold" class="mr-1.5 h-4 w-4" />
                {{ t("pages.directoryPage.resetFilters") }}
              </UButton>
            </div>
          </div>
        </UCard>

        <div v-if="filteredItems.length > 0" class="grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
          <DirectoryCard
            v-for="item in filteredItems"
            :key="item.id"
            :item="item"
          />
        </div>

        <UAlert
          v-else
          color="neutral"
          variant="subtle"
          icon="i-ph-squares-four-fill"
          :title="t('pages.directoryPage.emptyTitle')"
          :description="t('pages.directoryPage.emptyDescription')"
          class="rounded-[18px]"
        >
          <template #actions>
            <UButton
              v-if="hasActiveFilters"
              color="neutral"
              variant="outline"
              size="sm"
              class="rounded-full"
              @click="resetFilters"
            >
              {{ t("pages.directoryPage.resetFilters") }}
            </UButton>
          </template>
        </UAlert>
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
import type { DirectoryCategoryKey } from "../../domain/types/directory.types"
import { directoryCategoryKeys, useDirectoryCatalog } from "../../infrastructure/mocks/directoryCatalog"
import DirectoryCard from "../components/DirectoryCard.vue"
import DirectoryFilters from "../components/DirectoryFilters.vue"
import DirectoryHero from "../components/DirectoryHero.vue"
import DirectorySidebar from "../components/DirectorySidebar.vue"

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
const { categories, items } = useDirectoryCatalog()

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
