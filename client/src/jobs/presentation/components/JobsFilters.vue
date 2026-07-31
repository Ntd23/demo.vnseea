<!-- English description: Renders a jobs filter bar with search, select controls, and a continuous per-kilometre distance slider. -->
<template>
  <section class="jobs-tabs-bar">
    <div class="jobs-tabs-bar__search">
      <Icon name="i-ph-magnifying-glass" class="jobs-tabs-bar__search-icon" />
      <input
        v-model="localSearch"
        type="text"
        :placeholder="$t('pages.jobsPage.searchPlaceholder')"
        class="jobs-tabs-bar__search-input"
      >
      <button
        v-if="localSearch"
        type="button"
        class="jobs-tabs-bar__search-clear"
        @click="localSearch = ''"
      >
        <Icon name="i-ph-x" class="h-4 w-4" />
      </button>
    </div>

    <div
      class="jobs-tabs-bar__filters"
      :class="{ 'jobs-tabs-bar__filters--with-reset': hasActiveFilters }"
    >
      <USelect
        v-model="typeModel"
        :items="typeOptions"
        value-key="value"
        label-key="label"
        size="lg"
        class="jobs-tabs-bar__select"
        :ui="{ base: 'h-12 rounded-[10px] bg-[var(--bg-surface)] border-[var(--border-light)] text-[var(--text-primary)] font-bold' }"
      />

      <USelect
        v-model="categoryModel"
        :items="categoryOptions"
        value-key="value"
        label-key="label"
        size="lg"
        class="jobs-tabs-bar__select"
        :ui="{ base: 'h-12 rounded-[10px] bg-[var(--bg-surface)] border-[var(--border-light)] text-[var(--text-primary)] font-bold' }"
      />

      <div
        class="jobs-tabs-bar__distance"
        :class="{ 'jobs-tabs-bar__distance--disabled': !distanceEnabled }"
      >
        <div class="jobs-tabs-bar__distance-header">
          <span>{{ $t("pages.jobsPage.distance") }}</span>
          <div class="jobs-tabs-bar__distance-heading-actions">
            <strong>{{ distanceSliderLabel }}</strong>
            <button
              type="button"
              class="jobs-tabs-bar__locate"
              :disabled="locationPending"
              :aria-label="$t('pages.jobsPage.refreshCurrentLocation')"
              @click="emit('requestLocation')"
            >
              <Icon
                :name="locationPending ? 'i-ph-spinner-gap-bold' : 'i-ph-crosshair-bold'"
                :class="{ 'jobs-tabs-bar__locate-icon--spin': locationPending }"
              />
            </button>
          </div>
        </div>
        <USlider
          v-model="distanceSliderModel"
          :min="0"
          :max="distanceSliderMax"
          :step="1"
          size="md"
          color="primary"
          :disabled="!distanceEnabled || distanceSliderMax === 0"
          :aria-label="$t('pages.jobsPage.distance')"
          class="jobs-tabs-bar__distance-slider"
        />
        <div class="jobs-tabs-bar__distance-scale" aria-hidden="true">
          <span>0 km</span>
          <span>{{ distanceSliderMax }} km</span>
        </div>
        <span class="jobs-tabs-bar__distance-status">{{ distanceStatus }}</span>
      </div>

      <button
        type="button"
        class="jobs-tabs-bar__create"
        :disabled="!canCreate"
        @click="emit('openCreate')"
      >
        <Icon name="i-ph-plus-bold" class="h-4 w-4" />
        <span>{{ $t("pages.jobsPage.postJob") }}</span>
      </button>

      <button
        v-if="hasActiveFilters"
        type="button"
        class="jobs-tabs-bar__reset"
        @click="emit('reset')"
      >
        {{ $t("pages.jobsPage.reset") }}
      </button>
    </div>

    <div v-if="statusLabel" class="jobs-tabs-bar__status">
      {{ statusLabel }}
    </div>
  </section>
</template>

<script setup lang="ts">
import { watchDebounced } from "@vueuse/core"
import type { JobsSelectOption } from "../../domain/types/jobs.types"

const ALL_CATEGORY_VALUE = "__all_categories__"
const ALL_TYPE_VALUE = "__all_types__"
const ALL_DISTANCE_VALUE = "__all_distances__"
const DEFAULT_MAX_DISTANCE_KM = 300

const props = defineProps<{
  search: string
  selectedType: string
  selectedCategory: string
  selectedDistance: string
  types: JobsSelectOption[]
  categories: JobsSelectOption[]
  distanceOptions: JobsSelectOption[]
  distanceEnabled: boolean
  locationPending: boolean
  distanceStatus: string
  canCreate: boolean
  createDisabledReason: string
  hasActiveFilters: boolean
}>()

const emit = defineEmits<{
  "update:search": [value: string]
  "update:selectedType": [value: string]
  "update:selectedCategory": [value: string]
  "update:selectedDistance": [value: string]
  openCreate: []
  requestLocation: []
  reset: []
}>()

const { t } = useI18n()
const localSearch = ref(props.search)

const typeOptions = computed(() => Array.isArray(props.types) ? props.types : [])
const categoryOptions = computed(() => Array.isArray(props.categories) ? props.categories : [])
const distanceSliderMax = computed(() => {
  const configuredMaximum = (Array.isArray(props.distanceOptions) ? props.distanceOptions : [])
    .filter(option => option.value !== ALL_DISTANCE_VALUE)
    .map(option => Number(option.value))
    .filter(value => Number.isFinite(value) && value > 0)
    .reduce((maximum, value) => Math.max(maximum, value), 0)

  return configuredMaximum || DEFAULT_MAX_DISTANCE_KM
})

const typeModel = computed({
  get: () => props.selectedType || ALL_TYPE_VALUE,
  set: value => emit("update:selectedType", String(value) === ALL_TYPE_VALUE ? "" : String(value)),
})

const categoryModel = computed({
  get: () => props.selectedCategory || ALL_CATEGORY_VALUE,
  set: value => emit("update:selectedCategory", String(value) === ALL_CATEGORY_VALUE ? "" : String(value)),
})

const distanceSliderModel = computed<number>({
  get: () => {
    const selectedValue = Number(props.selectedDistance)
    return Number.isFinite(selectedValue)
      ? Math.min(Math.max(Math.round(selectedValue), 0), distanceSliderMax.value)
      : 0
  },
  set: (value) => {
    const distance = Math.min(Math.max(Math.round(Number(value)), 0), distanceSliderMax.value)
    emit("update:selectedDistance", distance > 0 ? String(distance) : "")
  },
})

const distanceSliderLabel = computed(() =>
  distanceSliderModel.value > 0
    ? `${distanceSliderModel.value} km`
    : t("pages.jobsPage.allDistances"),
)

const statusLabel = computed(() => {
  if (!props.canCreate || props.createDisabledReason) {
    return props.createDisabledReason || t("pages.jobsPage.noOwnedPagesDescription")
  }

  return ""
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
    emit("update:search", value)
  },
  {
    debounce: 240,
    maxWait: 700,
  },
)
</script>

<style scoped>
.jobs-tabs-bar {
  display: flex;
  flex-direction: column;
  gap: 16px;
  border: 1px solid var(--border-default);
  border-radius: var(--radius-lg);
  background: var(--bg-surface);
  padding: 16px 18px;
  box-shadow: var(--shadow-sm);
}

.jobs-tabs-bar__create {
  display: inline-flex;
  min-height: 48px;
  align-items: center;
  justify-content: center;
  gap: 8px;
  border: 0;
  border-radius: 12px;
  background: var(--bg-brand);
  padding: 0 12px;
  color: var(--text-inverse);
  cursor: pointer;
  font-size: 14px;
  font-weight: 700;
  white-space: nowrap;
  box-shadow: var(--shadow-brand);
  transition: transform var(--duration-fast) var(--ease-default), background-color var(--duration-fast) var(--ease-default);
}

.jobs-tabs-bar__create:hover:not(:disabled) {
  transform: translateY(-1px);
  background: var(--bg-brand-hover);
}

.jobs-tabs-bar__create:disabled {
  cursor: not-allowed;
  opacity: 0.55;
}

.jobs-tabs-bar__filters {
  display: grid;
  gap: 12px;
}

.jobs-tabs-bar__search {
  position: relative;
  flex: 1;
}

.jobs-tabs-bar__search-input {
  width: 100%;
  height: 48px;
  border: 0;
  border-radius: 10px;
  background: var(--bg-muted);
  padding: 0 40px;
  color: var(--text-primary);
  font-size: 14px;
  transition: all var(--duration-fast) var(--ease-default);
}

.jobs-tabs-bar__search-input:focus {
  outline: none;
  border-color: var(--border-strong);
  background: var(--bg-surface);
  box-shadow: 0 0 0 3px var(--bg-surface-active);
}

.jobs-tabs-bar__search-icon {
  position: absolute;
  top: 50%;
  left: 14px;
  color: var(--text-tertiary);
  font-size: 18px;
  transform: translateY(-50%);
}

.jobs-tabs-bar__search-clear {
  position: absolute;
  top: 50%;
  right: 10px;
  display: flex;
  width: 24px;
  height: 24px;
  align-items: center;
  justify-content: center;
  border: 0;
  border-radius: 6px;
  background: transparent;
  color: var(--text-tertiary);
  cursor: pointer;
  transform: translateY(-50%);
  transition: all var(--duration-fast) var(--ease-default);
}

.jobs-tabs-bar__search-clear:hover {
  background: var(--bg-surface-active);
  color: var(--text-secondary);
}

.jobs-tabs-bar__select {
  width: 100%;
}

.jobs-tabs-bar__distance {
  display: flex;
  min-height: 48px;
  flex-direction: column;
  justify-content: center;
  gap: 8px;
  border: 1px solid var(--border-default);
  border-radius: 10px;
  background: var(--bg-surface);
  padding: 7px 12px 9px;
}

.jobs-tabs-bar__distance--disabled {
  opacity: 0.55;
}

.jobs-tabs-bar__distance-header {
  display: flex;
  min-width: 0;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  color: var(--text-tertiary);
  font-size: 11px;
  line-height: 1;
}

.jobs-tabs-bar__distance-header strong {
  overflow: hidden;
  color: var(--text-primary);
  font-size: 12px;
  font-weight: 700;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.jobs-tabs-bar__distance-heading-actions {
  display: inline-flex;
  min-width: 0;
  align-items: center;
  gap: 6px;
}

.jobs-tabs-bar__locate {
  display: inline-flex;
  width: 24px;
  height: 24px;
  flex: 0 0 24px;
  align-items: center;
  justify-content: center;
  border-radius: 999px;
  background: var(--bg-muted);
  color: var(--text-brand);
  transition: background 0.16s ease, transform 0.16s ease;
}

.jobs-tabs-bar__locate:hover:not(:disabled) {
  background: var(--bg-surface-active);
  transform: scale(1.05);
}

.jobs-tabs-bar__locate:disabled {
  cursor: wait;
  opacity: 0.65;
}

.jobs-tabs-bar__locate :deep(svg) {
  width: 14px;
  height: 14px;
}

.jobs-tabs-bar__locate-icon--spin {
  animation: jobs-filter-spin 0.8s linear infinite;
}

.jobs-tabs-bar__distance-slider {
  width: 100%;
}

.jobs-tabs-bar__distance-scale {
  display: flex;
  justify-content: space-between;
  margin-top: -4px;
  color: var(--text-tertiary);
  font-size: 9px;
  font-weight: 600;
  line-height: 1;
}

.jobs-tabs-bar__distance-status {
  overflow: hidden;
  color: var(--text-tertiary);
  font-size: 10px;
  font-weight: 600;
  line-height: 1.25;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.jobs-tabs-bar__reset {
  min-height: 40px;
  border: 1px solid var(--border-default);
  border-radius: 10px;
  background: var(--bg-surface);
  color: var(--text-brand);
  cursor: pointer;
  font-size: 13px;
  font-weight: 700;
}

.jobs-tabs-bar__status {
  color: var(--text-tertiary);
  font-size: 12px;
  font-weight: 500;
}

@media (min-width: 768px) {
  .jobs-tabs-bar__filters {
    align-items: center;
    grid-template-columns: minmax(150px, 0.8fr) minmax(150px, 0.8fr) minmax(280px, 1.6fr) auto;
  }

  .jobs-tabs-bar__filters--with-reset {
    grid-template-columns: minmax(150px, 0.8fr) minmax(150px, 0.8fr) minmax(280px, 1.6fr) auto auto;
  }
}

@keyframes jobs-filter-spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
