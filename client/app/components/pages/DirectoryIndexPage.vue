<template>
  <div class="space-y-5 pb-10">
    <DirectoryHero :stats="heroStats" />

    <DirectoryFilters
      v-model:search="search"
      v-model:selected-category="selectedCategory"
      :categories="categories"
    />

    <div class="grid gap-5 xl:grid-cols-[minmax(0,1fr)_330px]">
      <main class="space-y-4">
        <div class="rounded-[30px] border border-[var(--border-default)] bg-white p-5 shadow-[var(--shadow-md)]">
          <p class="text-label-secondary text-[var(--text-tertiary)]">{{ t("pages.directoryPage.resultsEyebrow") }}</p>
          <h2 class="mt-1 text-heading text-[var(--text-primary)]">{{ resultHeading }}</h2>
          <p class="mt-1 text-body-secondary">{{ t("pages.directoryPage.matchingItems", { count: filteredItems.length }) }}</p>
        </div>

        <div v-if="filteredItems.length > 0" class="grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
          <DirectoryCard
            v-for="item in filteredItems"
            :key="item.id"
            :item="item"
          />
        </div>

        <div v-else class="rounded-[30px] border border-dashed border-[var(--border-default)] bg-white p-8 text-center shadow-[var(--shadow-md)]">
          <Icon name="i-ph-squares-four-fill" class="mx-auto h-12 w-12 text-[var(--color-primary-600)]" />
          <h3 class="mt-3 text-xl font-black text-[var(--text-primary)]">{{ t("pages.directoryPage.emptyTitle") }}</h3>
          <p class="mt-2 text-body-secondary">{{ t("pages.directoryPage.emptyDescription") }}</p>
        </div>
      </main>

      <DirectorySidebar
        :categories="categories"
        :counts="categoryCounts"
        :featured="featuredItems"
        :selected-category="selectedCategory"
        @select-category="selectedCategory = $event"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import type { DirectoryCategoryKey } from "~/composables/useMockDirectoryData"

const { t } = useI18n()
const { categories, items } = useMockDirectoryData()

useSeoMeta({
  title: t("pages.directoryPage.seoTitle"),
  description: t("pages.directoryPage.seoDescription"),
})

const search = ref("")
const selectedCategory = ref<DirectoryCategoryKey>("all")

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

const featuredItems = computed(() => items.value.filter(item => item.featured))

const heroStats = computed(() => [
  {
    label: t("pages.directoryPage.statSubcategories"),
    value: categories.value.length - 1,
    description: t("pages.directoryPage.statSubcategoriesDescription"),
  },
  {
    label: t("pages.directoryPage.statItems"),
    value: items.value.length,
    description: t("pages.directoryPage.statItemsDescription"),
  },
  {
    label: t("pages.directoryPage.statFeatured"),
    value: featuredItems.value.length,
    description: t("pages.directoryPage.statFeaturedDescription"),
  },
])

const resultHeading = computed(() => {
  if (selectedCategory.value === "all") return t("pages.directoryPage.allCategories")
  return categories.value.find(category => category.value === selectedCategory.value)?.label ?? t("pages.directoryPage.resultFallback")
})
</script>
