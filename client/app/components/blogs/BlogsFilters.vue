<template>
  <section class="relative z-10 overflow-hidden rounded-[30px] border border-white/70 bg-white/95 p-4 shadow-[var(--shadow-xl)] backdrop-blur sm:p-5">
    <div class="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
      <div>
        <p class="text-label-secondary text-[var(--color-primary-600)]">
          {{ $t("pages.blogsPage.filtersEyebrow") }}
        </p>
        <h2 class="mt-1 text-heading text-[var(--text-primary)]">
          {{ $t("pages.blogsPage.filtersTitle") }}
        </h2>
        <p class="mt-1 max-w-[620px] text-body-secondary">
          {{ $t("pages.blogsPage.filtersDescription") }}
        </p>
      </div>

      <NuxtLink
        to="/create-blog"
        class="inline-flex h-14 items-center justify-center gap-2 rounded-[20px] bg-[var(--color-primary-500)] px-6 text-[14px] font-extrabold text-white shadow-[var(--shadow-brand)] transition hover:-translate-y-0.5 lg:min-w-[190px]"
      >
        <Icon name="i-ph-note-pencil-fill" class="h-5 w-5" />
        {{ $t("pages.blogsPage.createArticle") }}
      </NuxtLink>
    </div>

    <label class="relative mt-5 block">
      <Icon
        name="i-ph-magnifying-glass"
        class="pointer-events-none absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2 text-[var(--text-tertiary)]"
      />
      <input
        :value="search"
        class="h-16 w-full rounded-[22px] border border-[var(--border-default)] bg-[var(--color-secondary-100)] pl-14 pr-5 text-[15px] font-semibold text-[var(--text-primary)] outline-none transition placeholder:font-medium placeholder:text-[var(--text-tertiary)] focus:border-[var(--color-primary-200)] focus:bg-white focus:ring-4 focus:ring-[var(--bg-surface-active)]"
        :placeholder="$t('pages.blogsPage.searchPlaceholder')"
        type="search"
        @input="$emit('update:search', ($event.target as HTMLInputElement).value)"
      >
    </label>

    <div class="mt-5 grid gap-5 xl:grid-cols-[minmax(0,1.25fr)_minmax(280px,0.75fr)]">
      <div>
        <div class="flex items-center justify-between gap-3 px-1">
          <p class="text-[11px] font-black uppercase tracking-[0.14em] text-[var(--text-tertiary)]">
            {{ $t("pages.blogsPage.topic") }}
          </p>
          <span class="text-[12px] font-bold text-[var(--text-tertiary)]">
            {{ $t("pages.blogsPage.categoryCount", { count: categories.length }) }}
          </span>
        </div>

        <div class="mt-3 grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
          <button
            v-for="category in categories"
            :key="category.value"
            class="flex min-h-12 items-center justify-between gap-3 rounded-[18px] px-3 py-2 text-left transition"
            :class="selectedCategory === category.value
              ? 'bg-[var(--color-primary-500)] text-white shadow-[var(--shadow-brand)]'
              : 'bg-[var(--color-secondary-100)] text-[var(--color-primary-900)] hover:bg-[var(--color-primary-50)] hover:text-[var(--color-primary-600)]'"
            type="button"
            @click="$emit('update:selectedCategory', category.value)"
          >
            <span class="inline-flex min-w-0 items-center gap-2 text-[13px] font-extrabold">
              <Icon :name="category.icon" class="h-4 w-4 shrink-0" />
              <span class="truncate">{{ category.label }}</span>
            </span>
          </button>
        </div>
      </div>

      <div class="space-y-4">
        <div class="rounded-[24px] bg-[var(--color-secondary-50)] p-3">
          <p class="px-1 text-[11px] font-black uppercase tracking-[0.14em] text-[var(--text-tertiary)]">
            {{ $t("pages.blogsPage.sort") }}
          </p>
          <div class="mt-3 grid gap-2">
            <button
              v-for="option in sortOptions"
              :key="option.value"
              class="flex h-12 items-center justify-between rounded-[18px] px-3 text-left text-[13px] font-extrabold transition"
              :class="sortBy === option.value
                ? 'bg-[var(--color-primary-500)] text-white shadow-[var(--shadow-brand)]'
                : 'bg-white text-[var(--color-primary-900)] hover:bg-[var(--color-primary-50)] hover:text-[var(--color-primary-600)]'"
              type="button"
              @click="$emit('update:sortBy', option.value)"
            >
              <span class="inline-flex items-center gap-2">
                <Icon :name="sortIcon(option.value)" class="h-4 w-4" />
                {{ option.label }}
              </span>
              <Icon
                v-if="sortBy === option.value"
                name="i-ph-check-circle-fill"
                class="h-4 w-4"
              />
            </button>
          </div>
        </div>

        <button
          class="flex min-h-[76px] w-full items-center justify-between gap-4 rounded-[24px] border px-4 text-left transition"
          :class="mineOnly
            ? 'border-[var(--color-primary-200)] bg-[var(--color-primary-50)] text-[var(--color-primary-600)]'
            : 'border-[var(--border-default)] bg-white text-[var(--text-secondary)] hover:border-[var(--border-strong)] hover:text-[var(--color-primary-600)]'"
          type="button"
          @click="$emit('update:mineOnly', !mineOnly)"
        >
          <span>
            <span class="block text-[13px] font-extrabold">{{ $t("pages.blogsPage.myArticles") }}</span>
            <span class="mt-1 block text-[12px] font-semibold opacity-75">{{ $t("pages.blogsPage.mineFilterDescription") }}</span>
          </span>
          <span class="inline-flex h-10 w-10 items-center justify-center rounded-[16px] bg-white text-[var(--color-primary-600)] shadow-[var(--shadow-sm)]">
            <Icon :name="mineOnly ? 'i-ph-toggle-right-fill' : 'i-ph-toggle-left-fill'" class="h-6 w-6" />
          </span>
        </button>
      </div>
    </div>

    <div class="mt-5 flex flex-col gap-3 rounded-[24px] border border-[var(--border-default)] bg-white px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
      <div class="inline-flex items-center gap-2 text-[13px] font-bold text-[var(--text-secondary)]">
        <Icon name="i-ph-funnel-fill" class="h-4 w-4 text-[var(--color-primary-600)]" />
        {{ $t("pages.blogsPage.matchingArticles", { count: articleCount }) }}
      </div>
      <div class="text-[13px] font-semibold text-[var(--text-tertiary)]">
        {{ activeSummary }}
      </div>
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
