<template>
  <section class="relative z-10 overflow-hidden rounded-[30px] border border-white/70 bg-white/95 p-4 shadow-[var(--shadow-xl)] backdrop-blur sm:p-5">
    <div class="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
      <div>
        <p class="text-label-secondary text-[var(--color-primary-600)]">
          {{ $t("pages.jobsPage.filtersEyebrow") }}
        </p>
        <h2 class="mt-1 text-heading text-[var(--text-primary)]">
          {{ $t("pages.jobsPage.filtersTitle") }}
        </h2>
        <p class="mt-1 max-w-[620px] text-body-secondary">
          {{ $t("pages.jobsPage.filtersDescription") }}
        </p>
      </div>

      <button
        class="inline-flex h-14 items-center justify-center gap-2 rounded-[20px] bg-[var(--color-primary-500)] px-6 text-[14px] font-extrabold text-white shadow-[var(--shadow-brand)] transition hover:-translate-y-0.5 lg:min-w-[190px]"
        type="button"
        @click="$emit('openPost')"
      >
        <Icon name="i-ph-plus-circle-fill" class="h-5 w-5" />
        {{ $t("pages.jobsPage.postJob") }}
      </button>
    </div>

    <label class="relative mt-5 block">
      <Icon
        name="i-ph-magnifying-glass"
        class="pointer-events-none absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2 text-[var(--text-tertiary)]"
      />
      <input
        :value="search"
        class="h-16 w-full rounded-[22px] border border-[var(--border-default)] bg-[var(--color-secondary-100)] pl-14 pr-5 text-[15px] font-semibold text-[var(--text-primary)] outline-none transition placeholder:font-medium placeholder:text-[var(--text-tertiary)] focus:border-[var(--color-primary-200)] focus:bg-white focus:ring-4 focus:ring-[var(--bg-surface-active)]"
        :placeholder="$t('pages.jobsPage.searchPlaceholder')"
        type="search"
        @input="$emit('update:search', ($event.target as HTMLInputElement).value)"
      >
    </label>

    <div class="mt-5 grid gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      <div class="rounded-[24px] bg-[var(--color-secondary-50)] p-3">
        <div class="flex items-center justify-between gap-3 px-1">
          <p class="text-[11px] font-black uppercase tracking-[0.14em] text-[var(--text-tertiary)]">
            {{ $t("pages.jobsPage.category") }}
          </p>
          <span class="text-[12px] font-bold text-[var(--text-tertiary)]">
            {{ $t("pages.jobsPage.optionCount", { count: categories.length }) }}
          </span>
        </div>

        <div class="mt-3 grid gap-2 sm:grid-cols-2">
          <button
            v-for="category in categories"
            :key="category.value"
            class="flex min-h-12 items-center justify-between gap-3 rounded-[18px] px-3 py-2 text-left transition"
            :class="selectedCategory === category.value
              ? 'bg-[var(--color-primary-500)] text-white shadow-[var(--shadow-brand)]'
              : 'bg-white text-[var(--color-primary-900)] hover:bg-[var(--color-primary-50)] hover:text-[var(--color-primary-600)]'"
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
        <div>
          <p class="px-1 text-[11px] font-black uppercase tracking-[0.14em] text-[var(--text-tertiary)]">
            {{ $t("pages.jobsPage.location") }}
          </p>
          <div class="mt-3 flex flex-wrap gap-2">
            <button
              v-for="location in locations"
              :key="location.value"
              class="inline-flex min-h-11 items-center justify-center gap-2 rounded-[var(--radius-full)] px-4 py-2 text-[13px] font-extrabold transition"
              :class="selectedLocation === location.value
                ? 'bg-[var(--color-primary-500)] text-white shadow-[var(--shadow-brand)]'
                : 'bg-[var(--color-secondary-100)] text-[var(--color-primary-900)] hover:bg-[var(--color-primary-50)] hover:text-[var(--color-primary-600)]'"
              type="button"
              @click="$emit('update:selectedLocation', location.value)"
            >
              <Icon :name="location.icon" class="h-4 w-4" />
              {{ location.label }}
            </button>
          </div>
        </div>

        <div>
          <p class="px-1 text-[11px] font-black uppercase tracking-[0.14em] text-[var(--text-tertiary)]">
            {{ $t("pages.jobsPage.type") }}
          </p>
          <div class="mt-3 flex flex-wrap gap-2">
            <button
              v-for="type in types"
              :key="type.value"
              class="inline-flex min-h-11 items-center justify-center gap-2 rounded-[var(--radius-full)] px-4 py-2 text-[13px] font-extrabold transition"
              :class="selectedType === type.value
                ? 'bg-[var(--color-primary-500)] text-white shadow-[var(--shadow-brand)]'
                : 'bg-[var(--color-secondary-100)] text-[var(--color-primary-900)] hover:bg-[var(--color-primary-50)] hover:text-[var(--color-primary-600)]'"
              type="button"
              @click="$emit('update:selectedType', type.value)"
            >
              <Icon :name="type.icon" class="h-4 w-4" />
              {{ type.label }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <div class="mt-5 flex flex-col gap-3 rounded-[24px] border border-[var(--border-default)] bg-white px-4 py-3 lg:flex-row lg:items-center lg:justify-between">
      <div>
        <p class="text-[11px] font-black uppercase tracking-[0.14em] text-[var(--text-tertiary)]">
          {{ $t("pages.jobsPage.sort") }}
        </p>
        <p class="mt-1 text-[13px] font-semibold text-[var(--text-secondary)]">
          {{ $t("pages.jobsPage.resultSummary", { count: resultCount, summary: activeSummary }) }}
        </p>
      </div>

      <div class="flex flex-wrap gap-2">
        <button
          v-for="sortOption in sortOptions"
          :key="sortOption.value"
          class="inline-flex h-11 items-center justify-center gap-2 rounded-[18px] px-4 text-[13px] font-extrabold transition"
          :class="sortBy === sortOption.value
            ? 'bg-[var(--color-primary-500)] text-white shadow-[var(--shadow-brand)]'
            : 'bg-[var(--color-secondary-100)] text-[var(--color-primary-900)] hover:bg-[var(--color-primary-50)] hover:text-[var(--color-primary-600)]'"
          type="button"
          @click="$emit('update:sortBy', sortOption.value)"
        >
          <Icon :name="sortOption.icon" class="h-4 w-4" />
          {{ sortOption.label }}
        </button>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
type SortKey = "latest" | "salary" | "applicants"

const props = defineProps<{
  search: string
  selectedCategory: string
  selectedLocation: string
  selectedType: string
  sortBy: SortKey
  resultCount: number
  categories: ReadonlyArray<{ label: string; value: string; icon: string }>
  locations: ReadonlyArray<{ label: string; value: string; icon: string }>
  types: ReadonlyArray<{ label: string; value: string; icon: string }>
}>()

defineEmits<{
  "update:search": [value: string]
  "update:selectedCategory": [value: string]
  "update:selectedLocation": [value: string]
  "update:selectedType": [value: string]
  "update:sortBy": [value: SortKey]
  openPost: []
}>()

const { t } = useI18n()

const sortOptions = computed<{ value: SortKey; label: string; icon: string }[]>(() => [
  { value: "latest", label: t("pages.jobsPage.sortLatest"), icon: "i-ph-clock-countdown-fill" },
  { value: "salary", label: t("pages.jobsPage.sortSalary"), icon: "i-ph-money-fill" },
  { value: "applicants", label: t("pages.jobsPage.sortApplicants"), icon: "i-ph-users-three-fill" },
])

const activeSummary = computed(() => {
  const category = props.categories.find(item => item.value === props.selectedCategory)?.label ?? t("pages.jobsPage.categoryAll")
  const location = props.locations.find(item => item.value === props.selectedLocation)?.label ?? t("pages.jobsPage.locationAll")
  const type = props.types.find(item => item.value === props.selectedType)?.label ?? t("pages.jobsPage.typeAll")

  return `${category} · ${location} · ${type}`
})
</script>
