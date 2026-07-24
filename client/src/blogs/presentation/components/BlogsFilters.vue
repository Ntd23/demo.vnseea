<template>
  <section class="blogs-filters" aria-labelledby="blogs-filters-title">
    <div class="blogs-filters__header">
      <div class="blogs-filters__actions">
        <button
          type="button"
          class="blogs-filters__my-articles"
          :class="{ 'blogs-filters__my-articles--active': mineOnly }"
          :aria-pressed="mineOnly"
          @click="$emit('update:mineOnly', !mineOnly)"
        >
          <Icon :name="mineOnly ? 'i-ph-toggle-right-fill' : 'i-ph-article-fill'" class="h-4 w-4 shrink-0" />
          <span>{{ $t("pages.blogsPage.myArticles") }}</span>
        </button>
        <UButton to="/create-blog" color="primary" variant="solid" size="md" class="blogs-filters__create">
          <Icon name="i-ph-note-pencil-fill" class="h-4 w-4" />
          {{ $t("pages.blogsPage.createArticle") }}
        </UButton>
      </div>
    </div>

    <div class="blogs-filters__search-wrap">
      <Icon name="i-ph-magnifying-glass"
        class="pointer-events-none absolute left-8 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-[var(--text-tertiary)]" />
      <input id="blogs-search-input" :value="search" type="search" autocomplete="off"
        :placeholder="$t('pages.blogsPage.searchPlaceholder')" class="blogs-search-input"
        @input="$emit('update:search', ($event.target as HTMLInputElement).value)" />
    </div>

    <div class="blogs-filters__group" role="group" :aria-label="$t('pages.blogsPage.categoryFilterLabel')">
      <p class="blogs-filters__label">{{ $t("pages.blogsPage.topic") }}</p>
      <div class="flex flex-wrap gap-2">
        <button v-for="category in categories" :key="category.value" class="blogs-filters__chip" :class="selectedCategory === category.value
          ? 'blogs-filters__chip--active'
          : 'blogs-filters__chip--idle'" type="button" :aria-pressed="selectedCategory === category.value"
          @click="$emit('update:selectedCategory', category.value)">
          <Icon :name="category.icon" class="h-3.5 w-3.5" />
          <span>{{ category.label }}</span>
        </button>
      </div>
    </div>

    <div class="blogs-filters__sort-row">
      <div class="flex flex-wrap gap-1.5" role="group" :aria-label="$t('pages.blogsPage.sortFilterLabel')">
        <button v-for="option in sortOptions" :key="option.value" class="blogs-filters__sort" :class="sortBy === option.value
          ? 'blogs-filters__sort--active'
          : 'blogs-filters__sort--idle'" type="button" :aria-pressed="sortBy === option.value"
          @click="$emit('update:sortBy', option.value)">
          <Icon :name="sortIcon(option.value)" class="h-3.5 w-3.5" />
          <span>{{ option.label }}</span>
        </button>
      </div>
    </div>

    <div class="blogs-filters__summary" role="status" aria-live="polite">
      <Icon name="i-ph-funnel-fill" class="h-3.5 w-3.5 shrink-0 text-[var(--text-tertiary)]" />
      <p>
        {{ $t("pages.blogsPage.matchingArticles", { count: articleCount }) }}
        <span class="mx-1 text-[var(--text-tertiary)]">/</span>
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

  return `${category} / ${sort} / ${owner}`
})

const sortIcon = (value: string) => {
  if (value === "popular") return "i-ph-star-fill"
  if (value === "views") return "i-ph-eye-fill"
  if (value === "reading") return "i-ph-timer-fill"
  return "i-ph-clock-countdown-fill"
}
</script>

<style scoped>
.blogs-filters {
  overflow: hidden;
  border: 1px solid rgba(15, 23, 42, 0.08);
  border-radius: 18px;
  background: var(--bg-surface);
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
}

.blogs-filters__header,
.blogs-filters__sort-row,
.blogs-filters__summary {
  display: flex;
  align-items: center;
}

.blogs-filters__header {
  justify-content: space-between;
  gap: 14px;
  border-bottom: 1px solid var(--border-light);
  padding: 16px;
}

.blogs-filters__actions {
  display: flex;
  flex: 0 0 auto;
  align-items: center;
  gap: 8px;
}

.blogs-filters__my-articles {
  display: inline-flex;
  min-height: 40px;
  align-items: center;
  justify-content: center;
  gap: 8px;
  border: 1px solid var(--border-light);
  border-radius: 12px;
  background: var(--bg-surface);
  color: var(--text-primary);
  padding: 10px 14px;
  font-size: 13px;
  font-weight: 800;
  cursor: pointer;
  transition: all 0.15s ease;
}

.blogs-filters__my-articles > * {
  pointer-events: none;
}

.blogs-filters__my-articles:hover,
.blogs-filters__my-articles--active {
  border-color: color-mix(in srgb, var(--bg-brand) 16%, transparent);
  background: color-mix(in srgb, var(--bg-brand) 5%, transparent);
  color: var(--bg-brand);
}

.blogs-filters__eyebrow,
.blogs-filters__label {
  margin: 0;
  color: var(--text-tertiary);
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.blogs-filters__title {
  margin: 3px 0 0;
  color: var(--text-primary);
  font-size: 17px;
  font-weight: 800;
  letter-spacing: -0.01em;
}

.blogs-filters__create {
  position: relative;
  z-index: 2;
  flex: 0 0 auto;
  border-radius: 12px;
  padding: 10px 14px;
  font-size: 13px;
  font-weight: 800;
  pointer-events: auto;
  user-select: none;
  box-shadow: 0 4px 14px color-mix(in srgb, var(--bg-brand) 20%, transparent);
  transition: all 0.15s ease;
}

.blogs-filters__create>* {
  pointer-events: none;
}

.blogs-filters__search-wrap {
  position: relative;
  border-bottom: 1px solid var(--border-light);
  padding: 12px 14px;
}

.blogs-search-input {
  width: 100%;
  border: 1px solid var(--border-light);
  border-radius: 12px;
  background: var(--bg-surface);
  color: var(--text-primary);
  font-size: 14px;
  font-weight: 500;
  outline: none;
  padding: 12px 14px 12px 44px;
  transition: all 0.15s ease;
}

.blogs-search-input:focus {
  border-color: color-mix(in srgb, var(--bg-brand) 25%, transparent);
  background: var(--bg-surface);
}

.blogs-search-input::-webkit-search-cancel-button {
  cursor: pointer;
  opacity: 0.5;
}

.blogs-filters__group {
  border-bottom: 1px solid var(--border-light);
  padding: 13px 14px;
}

.blogs-filters__label {
  margin-bottom: 10px;
}

.blogs-filters__chip,
.blogs-filters__sort,
.blogs-filters__mine {
  position: relative;
  z-index: 2;
  display: inline-flex;
  min-height: 34px;
  align-items: center;
  gap: 6px;
  border: 1px solid transparent;
  border-radius: 12px;
  font-weight: 700;
  cursor: pointer;
  pointer-events: auto;
  user-select: none;
  transition: all 0.15s ease;
}

.blogs-filters__chip>*,
.blogs-filters__sort>*,
.blogs-filters__mine>* {
  pointer-events: none;
}

.blogs-filters__chip {
  padding: 8px 12px;
  font-size: 12.5px;
}

.blogs-filters__sort {
  padding: 7px 10px;
  font-size: 12px;
}

.blogs-filters__chip--active,
.blogs-filters__sort--active {
  background: var(--bg-brand);
  color: var(--text-inverse);
  box-shadow: 0 4px 14px color-mix(in srgb, var(--bg-brand) 20%, transparent);
}

.blogs-filters__chip--idle,
.blogs-filters__sort--idle {
  background: var(--bg-muted);
  color: var(--text-primary);
}

.blogs-filters__chip--idle:hover,
.blogs-filters__sort--idle:hover {
  background: color-mix(in srgb, var(--bg-brand) 5%, transparent);
  color: var(--bg-brand);
}

.blogs-filters__sort-row {
  flex-wrap: wrap;
  gap: 12px;
  padding: 13px 14px;
}

.blogs-filters__mine {
  padding: 7px 11px;
  font-size: 12px;
}

.blogs-filters__mine--active {
  border-color: color-mix(in srgb, var(--bg-brand) 18%, transparent);
  background: color-mix(in srgb, var(--bg-brand) 6%, transparent);
  color: var(--bg-brand);
}

.blogs-filters__mine--idle {
  border-color: var(--border-light);
  background: var(--bg-muted);
  color: var(--text-primary);
}

.blogs-filters__summary {
  gap: 8px;
  border-top: 1px solid var(--border-light);
  background: var(--bg-muted);
  padding: 10px 16px;
}

.blogs-filters__summary p {
  margin: 0;
  color: var(--text-primary);
  font-size: 12px;
  font-weight: 600;
}
</style>
