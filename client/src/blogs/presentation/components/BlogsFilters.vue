<template>
  <section
    class="overflow-hidden rounded-[28px] border border-[var(--border-default)] bg-white shadow-[var(--shadow-lg)]"
    aria-labelledby="blogs-filters-title"
  >
    <!-- Header row -->
    <div class="flex items-center justify-between gap-4 border-b border-[var(--border-light)] px-5 py-4">
      <div class="min-w-0">
        <p class="text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--text-tertiary)]">
          {{ $t("pages.blogsPage.filtersEyebrow") }}
        </p>
        <h2 id="blogs-filters-title" class="mt-0.5 text-[17px] font-extrabold tracking-[-0.02em] text-[var(--text-primary)]">
          {{ $t("pages.blogsPage.filtersTitle") }}
        </h2>
      </div>

      <UButton
        to="/create-blog"
        color="primary"
        variant="solid"
        size="md"
        class="shrink-0 rounded-[14px] px-4 py-2.5 text-[13px] font-bold shadow-[var(--shadow-brand)] transition hover:-translate-y-0.5"
      >
        <Icon name="i-ph-note-pencil-fill" class="h-4 w-4" />
        {{ $t("pages.blogsPage.createArticle") }}
      </UButton>
    </div>

    <!-- Search bar -->
    <div class="relative border-b border-[var(--border-light)] px-4 py-3">
      <Icon
        name="i-ph-magnifying-glass"
        class="pointer-events-none absolute left-8 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-[var(--text-tertiary)]"
      />
      <input
        id="blogs-search-input"
        :value="search"
        type="search"
        autocomplete="off"
        :placeholder="$t('pages.blogsPage.searchPlaceholder')"
        class="blogs-search-input w-full rounded-[16px] border border-[var(--border-default)] bg-[var(--color-secondary-50)] py-3 pl-11 pr-4 text-[14px] font-medium text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] transition focus:border-[var(--color-primary-300)] focus:bg-white focus:outline-none focus:ring-3 focus:ring-[var(--color-primary-100)]"
        @input="$emit('update:search', ($event.target as HTMLInputElement).value)"
      />
    </div>

    <!-- Category chips (horizontal scroll) -->
    <div class="border-b border-[var(--border-light)] px-4 py-3" role="group" :aria-label="$t('pages.blogsPage.categoryFilterLabel')">
      <p class="mb-2.5 px-0.5 text-[10.5px] font-bold uppercase tracking-[0.12em] text-[var(--text-tertiary)]">
        {{ $t("pages.blogsPage.topic") }}
      </p>
      <div class="flex flex-wrap gap-2">
        <button
          v-for="category in categories"
          :key="category.value"
          class="inline-flex items-center gap-1.5 rounded-[12px] px-3.5 py-2 text-[12.5px] font-bold transition-all duration-150"
          :class="selectedCategory === category.value
            ? 'bg-[var(--color-primary-500)] text-white shadow-[var(--shadow-brand)]'
            : 'bg-[var(--color-secondary-100)] text-[var(--text-secondary)] hover:bg-[var(--color-primary-50)] hover:text-[var(--color-primary-600)]'"
          type="button"
          :aria-pressed="selectedCategory === category.value"
          @click="$emit('update:selectedCategory', category.value)"
        >
          <Icon :name="category.icon" class="h-3.5 w-3.5" />
          {{ category.label }}
        </button>
      </div>
    </div>

    <!-- Sort + Mine toggle row -->
    <div class="flex flex-wrap items-center gap-3 px-4 py-3">
      <!-- Sort options -->
      <div class="flex flex-wrap gap-1.5" role="group" :aria-label="$t('pages.blogsPage.sortFilterLabel')">
        <button
          v-for="option in sortOptions"
          :key="option.value"
          class="inline-flex items-center gap-1.5 rounded-[10px] px-3 py-1.5 text-[12px] font-bold transition-all duration-150"
          :class="sortBy === option.value
            ? 'bg-[var(--color-primary-500)] text-white shadow-[var(--shadow-brand)]'
            : 'bg-[var(--color-secondary-100)] text-[var(--text-secondary)] hover:bg-[var(--color-primary-50)] hover:text-[var(--color-primary-600)]'"
          type="button"
          :aria-pressed="sortBy === option.value"
          @click="$emit('update:sortBy', option.value)"
        >
          <Icon :name="sortIcon(option.value)" class="h-3.5 w-3.5" />
          {{ option.label }}
        </button>
      </div>

      <!-- Spacer -->
      <div class="flex-1" />

      <!-- Mine toggle -->
      <button
        class="inline-flex items-center gap-2 rounded-[12px] border px-3 py-1.5 text-[12px] font-bold transition-all duration-150"
        :class="mineOnly
          ? 'border-[var(--color-primary-300)] bg-[var(--color-primary-50)] text-[var(--color-primary-700)]'
          : 'border-[var(--border-default)] bg-[var(--color-secondary-50)] text-[var(--text-secondary)] hover:border-[var(--border-strong)] hover:text-[var(--text-primary)]'"
        type="button"
        :aria-pressed="mineOnly"
        @click="$emit('update:mineOnly', !mineOnly)"
      >
        <Icon :name="mineOnly ? 'i-ph-toggle-right-fill' : 'i-ph-toggle-left'" class="h-4 w-4" />
        {{ $t("pages.blogsPage.myArticles") }}
      </button>
    </div>

    <!-- Active filters summary -->
    <div
      class="flex items-center gap-2 border-t border-[var(--border-light)] bg-[var(--color-secondary-50)] px-5 py-2.5"
      role="status"
      aria-live="polite"
    >
      <Icon name="i-ph-funnel-fill" class="h-3.5 w-3.5 shrink-0 text-[var(--text-tertiary)]" />
      <p class="text-[12px] font-semibold text-[var(--text-secondary)]">
        {{ $t("pages.blogsPage.matchingArticles", { count: articleCount }) }}
        <span class="mx-1 text-[var(--border-strong)]">·</span>
        {{ activeSummary }}
      </p>
    </div>
  </section>
</template>

<script setup lang="ts">
const { t } = useI18n()

const props = defineProps<{
  search: string
  selectedCategory: string
  sortBy: string
  mineOnly: boolean
  articleCount: number
  categories: ReadonlyArray<{
    label: string
    value: string
    icon: string
  }>
  sortOptions: ReadonlyArray<{
    label: string
    value: string
  }>
}>()

defineEmits<{
  "update:search": [value: string]
  "update:selectedCategory": [value: string]
  "update:sortBy": [value: string]
  "update:mineOnly": [value: boolean]
}>()

const activeSummary = computed(() => {
  const category = props.categories.find(item => item.value === props.selectedCategory)?.label ?? t("pages.blogsPage.categoryAll")
  const sort = props.sortOptions.find(item => item.value === props.sortBy)?.label ?? t("pages.blogsPage.sortLatest")
  const owner = props.mineOnly ? t("pages.blogsPage.myPostsSummary") : t("pages.blogsPage.allAuthors")

  return `${category} · ${sort} · ${owner}`
})

const sortIcon = (value: string) => {
  if (value === "popular") return "i-ph-star-fill"
  if (value === "views") return "i-ph-eye-fill"
  if (value === "reading") return "i-ph-timer-fill"
  return "i-ph-clock-countdown-fill"
}
</script>

<style scoped>

.blogs-search-input::-webkit-search-cancel-button {
  opacity: 0.5;
  cursor: pointer;
}

.focus\:ring-3:focus {
  box-shadow: 0 0 0 3px var(--color-primary-100);
}
</style>
