<template>
  <section class="search-filters">
    <div class="search-filters__inner">
      <input
        v-model="keywordModel"
        class="search-filters__keyword"
        type="search"
        :placeholder="$t('community.search.controls.keywordParams.placeholder')"
        @keyup.enter="emit('submit')"
      >

      <div class="search-filters__controls">
        <USelect
          v-model="countryModel"
          :aria-label="$t('community.search.filters.country')"
          :content="{ side: 'bottom', align: 'start' }"
          :items="countryOptions"
          :ui="selectUi"
          class="search-filters__country-select"
          color="primary"
          label-key="label"
          trailing-icon="i-ph-caret-circle-down-fill"
          value-key="value"
        />

        <UPopover :content="{ side: 'bottom', align: 'start' }">
          <button
            type="button"
            class="search-filters__filter-trigger"
          >
            <span>{{ filterButtonLabel }}</span>
            <Icon name="i-ph-caret-circle-down-fill" class="search-filters__caret" />
          </button>

          <template #content>
            <div class="search-filters__panel">
              <div class="search-filters__group">
                <p class="search-filters__group-title">
                  {{ $t("community.search.filters.age") }}
                </p>
                <div class="search-filters__pills">
                  <button
                    v-for="option in ageOptions"
                    :key="option.value"
                    type="button"
                    :class="pillClass(filterbyageModel === option.value)"
                    @click="filterbyageModel = option.value"
                  >
                    {{ option.label }}
                  </button>
                </div>
                <div
                  v-if="filterbyageModel === 'yes'"
                  class="search-filters__age-grid"
                >
                  <input
                    v-model="ageFromModel"
                    class="search-filters__age-input"
                    type="number"
                    min="10"
                    max="70"
                    :placeholder="$t('community.search.filters.ageFrom')"
                  >
                  <input
                    v-model="ageToModel"
                    class="search-filters__age-input"
                    type="number"
                    min="10"
                    max="70"
                    :placeholder="$t('community.search.filters.ageTo')"
                  >
                </div>
              </div>

              <FilterChoiceGroup
                :label="$t('community.search.filters.verified')"
                :options="verifiedOptions"
                :model-value="verifiedModel"
                @update:model-value="setVerified"
              />

              <FilterChoiceGroup
                :label="$t('community.search.filters.status')"
                :options="statusOptions"
                :model-value="statusModel"
                @update:model-value="setStatus"
              />

              <FilterChoiceGroup
                :label="$t('community.search.filters.gender')"
                :options="genderOptions"
                :model-value="genderModel"
                @update:model-value="setGender"
              />

              <FilterChoiceGroup
                :label="$t('community.search.filters.profilePicture')"
                :options="imageOptions"
                :model-value="imageModel"
                @update:model-value="setImage"
              />

              <div class="search-filters__panel-actions">
                <button
                  type="button"
                  class="search-filters__reset"
                  @click="resetFilters"
                >
                  {{ $t("community.search.clearFilters") }}
                </button>
                <button
                  type="button"
                  class="search-filters__panel-submit"
                  @click="emit('submit')"
                >
                  {{ $t("community.search.controls.submit") }}
                </button>
              </div>
            </div>
          </template>
        </UPopover>

        <button
          type="button"
          class="search-filters__submit"
          @click="emit('submit')"
        >
          {{ $t("community.search.controls.submit") }}
        </button>
      </div>

      <div class="search-filters__tabs">
        <button
          v-for="tab in visibleTabs"
          :key="tab.value"
          type="button"
          :class="tabClass(typeModel === tab.value)"
          @click="typeModel = tab.value"
        >
          <Icon :name="tab.icon" class="search-filters__tab-icon" />
          <span>{{ tab.label }}</span>
        </button>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import type {
  SearchAgeFilter,
  SearchGenderFilter,
  SearchImageFilter,
  SearchOption,
  SearchResultType,
  SearchTriStateFilter,
  SearchTabItem,
} from "../../domain/types/search.types"
import FilterChoiceGroup from "./FilterChoiceGroup.vue"

type SearchPanelTab = SearchTabItem & {
  count: number
}

const emit = defineEmits<{
  submit: []
}>()

const props = defineProps<{
  countryOptions: SearchOption<string>[]
  tabs: SearchPanelTab[]
}>()

const { t } = useI18n()

const keywordModel = defineModel<string>("keyword", { default: "" })
const typeModel = defineModel<SearchResultType>("type", { default: "all" })
const countryModel = defineModel<string>("country", { default: "all" })
const filterbyageModel = defineModel<SearchAgeFilter>("filterbyage", { default: "no" })
const ageFromModel = defineModel<string>("ageFrom", { default: "18" })
const ageToModel = defineModel<string>("ageTo", { default: "50" })
const verifiedModel = defineModel<SearchTriStateFilter>("verified", { default: "all" })
const statusModel = defineModel<SearchTriStateFilter>("status", { default: "all" })
const genderModel = defineModel<SearchGenderFilter>("gender", { default: "all" })
const imageModel = defineModel<SearchImageFilter>("image", { default: "all" })

const visibleTabs = computed(() =>
  props.tabs.filter(tab => ["users", "pages", "groups"].includes(tab.value)),
)

const activeFilterCount = computed(() => [
  countryModel.value !== "all",
  filterbyageModel.value === "yes",
  verifiedModel.value !== "all",
  statusModel.value !== "all",
  genderModel.value !== "all",
  imageModel.value !== "all",
].filter(Boolean).length)

const filterButtonLabel = computed(() =>
  activeFilterCount.value > 0
    ? `${t("community.search.filters.filter")} (${activeFilterCount.value})`
    : t("community.search.filters.filter"),
)

const selectUi = {
  base: "h-11 w-full rounded-xl border border-[#e2e8f0] bg-white px-3 text-[14px] font-bold text-[#334155] shadow-none ring-0 hover:border-[#cbd5e1] focus-visible:border-[color-mix(in srgb, var(--bg-brand) 45%, transparent)] focus-visible:ring-[3px] focus-visible:ring-[color-mix(in srgb, var(--bg-brand) 8%, transparent)]",
  content: "z-[70] min-w-[var(--reka-select-trigger-width)] rounded-2xl border border-[#e2e8f0] bg-white shadow-[0_12px_44px_rgba(0,0,0,0.12)]",
  viewport: "p-1",
  item: "rounded-xl px-3 py-2 text-[13px] font-semibold text-[#334155] data-[highlighted]:bg-[color-mix(in srgb, var(--bg-brand) 5%, transparent)] data-[highlighted]:text-[var(--text-brand)] data-[state=checked]:text-[var(--text-brand)]",
  trailingIcon: "size-5 text-[#64748b]",
}

const ageOptions = computed<SearchOption<SearchAgeFilter>[]>(() => [
  { label: t("community.search.filters.yes"), value: "yes" },
  { label: t("community.search.filters.no"), value: "no" },
])

const verifiedOptions = computed<SearchOption<SearchTriStateFilter>[]>(() => [
  { label: t("community.search.filters.all"), value: "all" },
  { label: t("community.search.filters.verifiedOn"), value: "on" },
  { label: t("community.search.filters.verifiedOff"), value: "off" },
])

const statusOptions = computed<SearchOption<SearchTriStateFilter>[]>(() => [
  { label: t("community.search.filters.all"), value: "all" },
  { label: t("community.search.filters.online"), value: "on" },
  { label: t("community.search.filters.offline"), value: "off" },
])

const genderOptions = computed<SearchOption<SearchGenderFilter>[]>(() => [
  { label: t("community.search.filters.all"), value: "all" },
  { label: t("community.search.filters.male"), value: "male" },
  { label: t("community.search.filters.female"), value: "female" },
])

const imageOptions = computed<SearchOption<SearchImageFilter>[]>(() => [
  { label: t("community.search.filters.all"), value: "all" },
  { label: t("community.search.filters.yes"), value: "yes" },
  { label: t("community.search.filters.no"), value: "no" },
])

const pillClass = (active: boolean) => [
  "search-filters__pill",
  active ? "search-filters__pill--active" : "",
]

const tabClass = (active: boolean) => [
  "search-filters__tab",
  active ? "search-filters__tab--active" : "",
]

const setVerified = (value: string) => {
  verifiedModel.value = value as SearchTriStateFilter
}

const setStatus = (value: string) => {
  statusModel.value = value as SearchTriStateFilter
}

const setGender = (value: string) => {
  genderModel.value = value as SearchGenderFilter
}

const setImage = (value: string) => {
  imageModel.value = value as SearchImageFilter
}

function resetFilters() {
  keywordModel.value = ""
  typeModel.value = "all"
  countryModel.value = "all"
  filterbyageModel.value = "no"
  ageFromModel.value = "18"
  ageToModel.value = "50"
  verifiedModel.value = "all"
  statusModel.value = "all"
  genderModel.value = "all"
  imageModel.value = "all"
  emit("submit")
}
</script>

<style scoped>
.search-filters {
  border: 1px solid #dfe6f4;
  border-radius: 16px;
  background: var(--bg-surface);
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
}

.search-filters__inner {
  display: grid;
  gap: 14px;
  padding: 16px 18px 0;
}

.search-filters__keyword {
  min-height: 46px;
  width: 100%;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  background: #fafbfe;
  padding: 0 16px;
  color: var(--text-primary);
  font-size: 14px;
  font-weight: 600;
  outline: none;
}

.search-filters__keyword::placeholder {
  color: var(--text-tertiary);
  opacity: 1;
}

.search-filters__keyword:focus {
  border-color: color-mix(in srgb, var(--bg-brand) 45%, transparent);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--bg-brand) 8%, transparent);
}

.search-filters__controls {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(180px, 0.42fr) minmax(150px, 0.28fr);
  gap: 12px;
  align-items: stretch;
}

.search-filters__country-select,
.search-filters__filter-trigger,
.search-filters__submit {
  min-height: 44px;
  border-radius: 12px;
}

.search-filters__filter-trigger {
  width: 100%;
  border: 1px solid #e2e8f0;
  background: var(--bg-surface);
  color: var(--text-primary);
  font-size: 14px;
  font-weight: 700;
}

.search-filters__filter-trigger:focus-visible {
  border-color: color-mix(in srgb, var(--bg-brand) 45%, transparent);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--bg-brand) 8%, transparent);
}

.search-filters__filter-trigger {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  padding: 0 14px;
  text-align: left;
}

.search-filters__caret {
  width: 20px;
  height: 20px;
  flex: none;
  color: var(--text-secondary);
}

.search-filters__submit,
.search-filters__panel-submit {
  border: 0;
  background: linear-gradient(180deg, var(--bg-brand-hover) 0%, var(--bg-brand) 100%);
  color: #ffffff;
  font-weight: 700;
  box-shadow: 0 4px 14px color-mix(in srgb, var(--bg-brand) 20%, transparent);
}

.search-filters__submit {
  font-size: 14px;
}

.search-filters__submit:hover,
.search-filters__panel-submit:hover {
  background: var(--bg-brand);
}

.search-filters__panel {
  display: grid;
  width: min(92vw, 360px);
  max-height: 68vh;
  gap: 18px;
  overflow-y: auto;
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  background: var(--bg-surface);
  padding: 16px;
  box-shadow: 0 12px 44px rgba(0, 0, 0, 0.12);
}

.search-filters__group {
  display: grid;
  gap: 10px;
}

.search-filters__group-title {
  color: var(--text-primary);
  font-size: 13px;
  font-weight: 800;
  line-height: 1.2;
}

.search-filters__pills {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.search-filters__pill {
  min-height: 32px;
  border: 1px solid transparent;
  border-radius: 999px;
  background: var(--bg-muted);
  color: var(--text-primary);
  padding: 0 14px;
  font-size: 13px;
  font-weight: 700;
  line-height: 1;
}

.search-filters__pill--active {
  border-color: var(--bg-brand);
  background: color-mix(in srgb, var(--bg-brand) 5%, transparent);
  color: var(--bg-brand);
  box-shadow: 0 4px 12px color-mix(in srgb, var(--bg-brand) 12%, transparent);
}

.search-filters__pill:hover {
  background: color-mix(in srgb, var(--bg-brand) 3%, transparent);
  color: var(--bg-brand);
}

.search-filters__pill--active:hover {
  background: color-mix(in srgb, var(--bg-brand) 8%, transparent);
  color: var(--bg-brand);
}

.search-filters__age-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
}

.search-filters__age-input {
  min-height: 38px;
  min-width: 0;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  padding: 0 12px;
  color: var(--text-primary);
  font-size: 13px;
  font-weight: 600;
  outline: none;
}

.search-filters__panel-actions {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  border-top: 1px solid #f1f5f9;
  padding-top: 12px;
}

.search-filters__reset,
.search-filters__panel-submit {
  min-height: 36px;
  border-radius: 10px;
  padding: 0 14px;
  font-size: 13px;
  font-weight: 700;
}

.search-filters__reset {
  border: 0;
  background: transparent;
  color: var(--text-secondary);
}

.search-filters__reset:hover {
  background: color-mix(in srgb, var(--bg-brand) 3%, transparent);
  color: var(--bg-brand);
}

.search-filters__tabs {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 8px;
  border-top: 1px solid #f1f5f9;
  padding: 10px 0 12px;
}

.search-filters__tab {
  display: inline-flex;
  min-height: 36px;
  align-items: center;
  gap: 8px;
  border: 0;
  border-radius: 12px;
  background: transparent;
  color: var(--text-secondary);
  padding: 0 12px;
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 0;
  line-height: 1;
}

.search-filters__tab--active {
  background: color-mix(in srgb, var(--bg-brand) 5%, transparent);
  color: var(--bg-brand);
}

.search-filters__tab-icon {
  width: 18px;
  height: 18px;
}

@media (max-width: 1023px) {
  .search-filters__controls {
    grid-template-columns: 1fr;
  }

  .search-filters__keyword,
  .search-filters__filter-trigger,
  .search-filters__submit {
    font-size: 14px;
  }

  .search-filters__tabs {
    justify-content: flex-start;
  }

  .search-filters__tab {
    padding-inline: 12px;
  }
}

@media (max-width: 640px) {
  .search-filters__inner {
    padding: 12px 12px 0;
  }

  .search-filters__keyword,
  .search-filters__country-select,
  .search-filters__filter-trigger,
  .search-filters__submit {
    min-height: 42px;
  }

  .search-filters__panel {
    width: min(92vw, 340px);
    padding: 14px;
  }

  .search-filters__pill {
    min-height: 30px;
    padding-inline: 12px;
    font-size: 12px;
  }
}
</style>
