<template>
  <section class="surface-card p-6 sm:p-10 ring-1 ring-secondary-200/50 shadow-2xl bg-white/60 backdrop-blur-3xl space-y-10 group/filters">
    <div class="flex flex-col gap-8 lg:flex-row lg:items-start lg:justify-between border-b border-secondary-100/50 pb-10">
      <div class="space-y-2">
        <p class="text-[9px] font-black uppercase tracking-[0.4em] text-primary-500 pl-1">
          {{ $t("pages.jobsPage.filtersEyebrow") }}
        </p>
        <h2 class="text-3xl font-black tracking-tight text-secondary-900 leading-none">
          {{ $t("pages.jobsPage.filtersTitle") }}
        </h2>
        <p class="text-[13px] font-medium leading-relaxed text-secondary-500 italic max-w-2xl px-0.5">
          {{ $t("pages.jobsPage.filtersDescription") }}
        </p>
      </div>

      <UButton
        size="xl"
        class="h-12 rounded-2xl bg-primary-600 text-white font-black text-[11px] uppercase tracking-widest shadow-2xl shadow-primary-500/30 transition-all hover:-translate-y-0.5 hover:bg-primary-700 active:scale-95 px-8"
        @click="$emit('openPost')"
      >
        <template #leading>
          <Icon name="i-ph-plus-circle-duotone" class="h-5 w-5" />
        </template>
        {{ $t("pages.jobsPage.postJob") }}
      </UButton>
    </div>

    <label class="relative block group/search">
      <Icon
        name="i-ph-magnifying-glass-duotone"
        class="absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2 text-primary-500 transition-transform group-focus-within/search:scale-110"
      />
      <input
        :value="search"
        class="h-14 w-full rounded-2xl border border-secondary-100 bg-secondary-50/50 py-3 pl-13 pr-5 text-[14px] font-black uppercase tracking-widest text-secondary-900 outline-none transition-all placeholder:text-secondary-400 placeholder:font-medium placeholder:normal-case placeholder:tracking-normal focus:border-primary-100 focus:bg-white focus:ring-4 focus:ring-primary-500/5"
        :placeholder="$t('pages.jobsPage.searchPlaceholder')"
        type="search"
        @input="$emit('update:search', ($event.target as HTMLInputElement).value)"
      >
    </label>

    <div class="grid gap-8 xl:grid-cols-2">
      <div class="rounded-3xl bg-secondary-50/50 p-6 ring-1 ring-secondary-100 space-y-6">
        <div class="flex items-center justify-between gap-3 px-1">
          <p class="text-[9px] font-black uppercase tracking-[0.4em] text-primary-500">
            {{ $t("pages.jobsPage.category") }}
          </p>
          <span class="text-[10px] font-black uppercase tracking-widest text-secondary-400">
            {{ $t("pages.jobsPage.optionCount", { count: categories.length }) }}
          </span>
        </div>

        <div class="grid gap-3 sm:grid-cols-2">
          <button
            v-for="category in categories"
            :key="category.value"
            class="flex items-center justify-between gap-3 rounded-xl px-4 py-3 text-left transition-all active:scale-95 ring-1"
            :class="selectedCategory === category.value
              ? 'bg-primary-50 text-primary-600 ring-primary-100 shadow-sm'
              : 'bg-white text-secondary-500 ring-secondary-100 hover:ring-primary-100 hover:text-primary-600'"
            type="button"
            @click="$emit('update:selectedCategory', category.value)"
          >
            <span class="inline-flex min-w-0 items-center gap-2.5 text-[11px] font-black uppercase tracking-widest">
              <Icon :name="category.icon.replace('-fill', '-duotone')" class="h-4 w-4 shrink-0" />
              <span class="truncate">{{ category.label }}</span>
            </span>
          </button>
        </div>
      </div>

      <div class="space-y-6">
        <div class="space-y-4">
          <p class="px-1 text-[9px] font-black uppercase tracking-[0.4em] text-primary-500">
            {{ $t("pages.jobsPage.location") }}
          </p>
          <div class="flex flex-wrap gap-2.5">
            <button
              v-for="location in locations"
              :key="location.value"
              class="inline-flex h-10 items-center justify-center gap-2 rounded-xl px-4 text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 ring-1"
              :class="selectedLocation === location.value
                ? 'bg-primary-50 text-primary-600 ring-primary-100 shadow-sm'
                : 'bg-secondary-50/50 text-secondary-500 ring-secondary-100 hover:bg-white hover:text-primary-600 hover:ring-primary-100'"
              type="button"
              @click="$emit('update:selectedLocation', location.value)"
            >
              <Icon :name="location.icon.replace('-fill', '-duotone')" class="h-4 w-4" />
              {{ location.label }}
            </button>
          </div>
        </div>

        <div class="space-y-4">
          <p class="px-1 text-[9px] font-black uppercase tracking-[0.4em] text-primary-500">
            {{ $t("pages.jobsPage.type") }}
          </p>
          <div class="flex flex-wrap gap-2.5">
            <button
              v-for="type in types"
              :key="type.value"
              class="inline-flex h-10 items-center justify-center gap-2 rounded-xl px-4 text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 ring-1"
              :class="selectedType === type.value
                ? 'bg-primary-50 text-primary-600 ring-primary-100 shadow-sm'
                : 'bg-secondary-50/50 text-secondary-500 ring-secondary-100 hover:bg-white hover:text-primary-600 hover:ring-primary-100'"
              type="button"
              @click="$emit('update:selectedType', type.value)"
            >
              <Icon :name="type.icon.replace('-fill', '-duotone')" class="h-4 w-4" />
              {{ type.label }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <div class="flex flex-col gap-6 rounded-3xl border border-secondary-100/50 bg-secondary-50/30 p-6 lg:flex-row lg:items-center lg:justify-between">
      <div class="space-y-1">
        <p class="text-[9px] font-black uppercase tracking-[0.4em] text-primary-500 pl-1">
          {{ $t("pages.jobsPage.sort") }}
        </p>
        <p class="text-[13px] font-medium text-secondary-500 italic px-1">
          {{ $t("pages.jobsPage.resultSummary", { count: resultCount, summary: activeSummary }) }}
        </p>
      </div>

      <div class="flex flex-wrap gap-2.5">
        <button
          v-for="sortOption in sortOptions"
          :key="sortOption.value"
          class="inline-flex h-10 items-center justify-center gap-2.5 rounded-xl px-4 text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 ring-1"
          :class="sortBy === sortOption.value
            ? 'bg-primary-50 text-primary-600 ring-primary-100 shadow-sm'
            : 'bg-white text-secondary-500 ring-secondary-100 hover:border-primary-100 hover:text-primary-600'"
          type="button"
          @click="$emit('update:sortBy', sortOption.value)"
        >
          <Icon :name="sortOption.icon.replace('-fill', '-duotone')" class="h-4 w-4" />
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
