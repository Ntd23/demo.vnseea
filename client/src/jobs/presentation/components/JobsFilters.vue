<template>
  <UCard class="rounded-[30px] border border-[var(--border-default)] bg-white shadow-[var(--shadow-xl)]" :ui="{ body: 'p-5' }">
    <div class="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
      <div class="min-w-0 flex-1">
        <p class="text-label-secondary text-[var(--text-primary)]">
          {{ $t("pages.jobsPage.filtersEyebrow") }}
        </p>
        <h2 class="mt-1 text-heading text-[var(--text-primary)]">
          {{ $t("pages.jobsPage.filtersTitle") }}
        </h2>
        <p class="mt-2 max-w-[700px] text-body-secondary">
          {{ $t("pages.jobsPage.filtersDescription") }}
        </p>
      </div>

      <div class="flex flex-col gap-2 sm:flex-row">
        <UBadge
          color="primary"
          variant="subtle"
          class="justify-center rounded-full px-4 py-2 text-[12px] font-semibold"
        >
          {{ $t("pages.jobsPage.resultCount", { count: resultCount }) }}
        </UBadge>

        <UButton
          v-if="hasActiveFilters"
          type="button"
          color="neutral"
          variant="outline"
          class="justify-center rounded-full"
          @click="resetFilters"
        >
          {{ $t("pages.jobsPage.reset") }}
        </UButton>

        <UButton
          type="button"
          color="primary"
          class="justify-center rounded-[20px] font-extrabold"
          @click="$emit('openPost')"
        >
          <Icon name="i-ph-plus-circle-fill" class="mr-2 h-5 w-5" />
          {{ $t("pages.jobsPage.postJob") }}
        </UButton>
      </div>
    </div>

    <div class="mt-5 grid gap-4 lg:grid-cols-[minmax(0,1.3fr)_320px]">
      <UFormField
        :label="$t('pages.jobsPage.searchLabel')"
        size="xl"
        class="space-y-2"
      >
        <UInput
          v-model="localSearch"
          size="xl"
          color="primary"
          class="w-full"
          :leading-icon="'i-ph-magnifying-glass'"
          :placeholder="$t('pages.jobsPage.searchPlaceholder')"
          :ui="{ base: 'h-14 rounded-[22px] px-4 text-[15px] font-semibold' }"
        />
      </UFormField>

      <UAlert
        :color="hasActiveFilters ? 'primary' : 'neutral'"
        variant="subtle"
        icon="i-ph-faders-horizontal-fill"
        :title="$t('pages.jobsPage.filterStatusTitle')"
        :description="statusLabel"
        class="rounded-[24px]"
      />
    </div>

    <div class="mt-5 grid gap-4 xl:grid-cols-3">
      <UFormField
        :label="$t('pages.jobsPage.category')"
        size="xl"
        class="space-y-2"
      >
        <USelect
          v-model="categoryModel"
          :items="categories"
          value-key="value"
          label-key="label"
          size="xl"
          color="primary"
          class="w-full"
          :ui="{ base: 'h-14 rounded-[20px] px-4 text-[15px] font-semibold' }"
        />
      </UFormField>

      <UFormField
        :label="$t('pages.jobsPage.location')"
        size="xl"
        class="space-y-2"
      >
        <USelect
          v-model="locationModel"
          :items="locations"
          value-key="value"
          label-key="label"
          size="xl"
          color="primary"
          class="w-full"
          :ui="{ base: 'h-14 rounded-[20px] px-4 text-[15px] font-semibold' }"
        />
      </UFormField>

      <UFormField
        :label="$t('pages.jobsPage.type')"
        size="xl"
        class="space-y-2"
      >
        <USelect
          v-model="typeModel"
          :items="types"
          value-key="value"
          label-key="label"
          size="xl"
          color="primary"
          class="w-full"
          :ui="{ base: 'h-14 rounded-[20px] px-4 text-[15px] font-semibold' }"
        />
      </UFormField>
    </div>

    <div class="mt-5 rounded-[24px] border border-[var(--border-default)] bg-[var(--bg-surface-hover)] p-4">
      <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p class="text-label-secondary text-[var(--text-tertiary)]">
            {{ $t("pages.jobsPage.sort") }}
          </p>
          <p class="mt-1 text-sm text-[var(--text-secondary)]">
            {{ $t("pages.jobsPage.sortDescription") }}
          </p>
        </div>

        <div class="flex flex-wrap gap-2">
          <UButton
            v-for="sortOption in sortOptions"
            :key="sortOption.value"
            type="button"
            :color="sortBy === sortOption.value ? 'primary' : 'neutral'"
            :variant="sortBy === sortOption.value ? 'solid' : 'outline'"
            class="rounded-full"
            @click="$emit('update:sortBy', sortOption.value)"
          >
            <Icon :name="sortOption.icon" class="mr-1.5 h-4 w-4" />
            {{ sortOption.label }}
          </UButton>
        </div>
      </div>
    </div>
  </UCard>
</template>

<script setup lang="ts">
import { watchDebounced } from "@vueuse/core"
import type { JobSortKey } from "../../application/composables/useMockJobsData"

const props = withDefaults(defineProps<{
  search: string
  selectedCategory: string
  selectedLocation: string
  selectedType: string
  sortBy: JobSortKey
  resultCount: number
  categories: ReadonlyArray<{ label: string; value: string; icon: string }>
  locations: ReadonlyArray<{ label: string; value: string; icon: string }>
  types: ReadonlyArray<{ label: string; value: string; icon: string }>
  statusLabel: string
  hasActiveFilters?: boolean
}>(), {
  hasActiveFilters: false,
})

const emit = defineEmits<{
  "update:search": [value: string]
  "update:selectedCategory": [value: string]
  "update:selectedLocation": [value: string]
  "update:selectedType": [value: string]
  "update:sortBy": [value: JobSortKey]
  openPost: []
  reset: []
}>()

const { t } = useI18n()
const localSearch = ref(props.search)

const sortOptions = computed<{ value: JobSortKey; label: string; icon: string }[]>(() => [
  { value: "latest", label: t("pages.jobsPage.sortLatest"), icon: "i-ph-clock-countdown-fill" },
  { value: "salary", label: t("pages.jobsPage.sortSalary"), icon: "i-ph-money-fill" },
  { value: "applicants", label: t("pages.jobsPage.sortApplicants"), icon: "i-ph-users-three-fill" },
])

const categoryModel = computed({
  get: () => props.selectedCategory,
  set: value => emit("update:selectedCategory", String(value)),
})

const locationModel = computed({
  get: () => props.selectedLocation,
  set: value => emit("update:selectedLocation", String(value)),
})

const typeModel = computed({
  get: () => props.selectedType,
  set: value => emit("update:selectedType", String(value)),
})

watch(
  () => props.search,
  (value) => {
    if (value !== localSearch.value) {
      localSearch.value = value
    }
  },
)

watchDebounced(
  localSearch,
  (value) => {
    if (value !== props.search) {
      emit("update:search", value)
    }
  },
  {
    debounce: 240,
    maxWait: 700,
  },
)

function resetFilters() {
  localSearch.value = ""
  emit("reset")
}
</script>
