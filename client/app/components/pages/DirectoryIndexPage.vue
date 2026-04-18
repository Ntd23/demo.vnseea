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
          <p class="text-label-secondary text-[var(--text-tertiary)]">Kết quả</p>
          <h2 class="mt-1 text-heading text-[var(--text-primary)]">{{ resultHeading }}</h2>
          <p class="mt-1 text-body-secondary">{{ filteredItems.length }} mục phù hợp</p>
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
          <h3 class="mt-3 text-xl font-black text-[var(--text-primary)]">Không tìm thấy danh mục</h3>
          <p class="mt-2 text-body-secondary">Thử đổi từ khóa hoặc chọn “Tất cả”.</p>
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

const { categories, items } = useMockDirectoryData()

useSeoMeta({
  title: "Directory | VNSEEA",
  description: "12 sub-categories trong VNSEEA: users, pages, groups, market, events, jobs, blogs, funding, live, watch, games và forum.",
})

const search = ref("")
const selectedCategory = ref<DirectoryCategoryKey>("all")

const filteredItems = computed(() => {
  const keyword = search.value.trim().toLowerCase()

  return items.filter((item) => {
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
  const counts: Record<string, number> = { all: items.length }
  for (const category of categories) {
    if (category.value === "all") continue
    counts[category.value] = items.filter(item => item.category === category.value).length
  }
  return counts
})

const featuredItems = computed(() => items.filter(item => item.featured))

const heroStats = computed(() => [
  {
    label: "Sub-categories",
    value: categories.length - 1,
    description: "Theo audit P-44.",
  },
  {
    label: "Mục",
    value: items.length,
    description: "Lối tắt directory.",
  },
  {
    label: "Nổi bật",
    value: featuredItems.value.length,
    description: "Mục được ghim.",
  },
])

const resultHeading = computed(() => {
  if (selectedCategory.value === "all") return "Tất cả danh mục"
  return categories.find(category => category.value === selectedCategory.value)?.label ?? "Directory"
})
</script>
