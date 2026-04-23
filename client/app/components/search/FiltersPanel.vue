<template>
  <section class="surface-card overflow-hidden">
    <div class="relative px-6 py-8 sm:px-8">
      <!-- Background decoration -->
      <div class="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,var(--tw-gradient-from),transparent_34%),radial-gradient(circle_at_bottom_left,var(--tw-gradient-to),transparent_30%)] from-primary-500/10 to-primary-600/5" />

      <div class="relative space-y-8">
        <div class="max-w-3xl">
          <p class="text-micro font-bold uppercase tracking-[0.2em] text-primary-600">
            {{ $t('community.search.controls.eyebrow') }}
          </p>
          <h1 class="text-display mt-2 text-3xl font-black text-secondary-900 sm:text-4xl">
            {{ $t('community.search.controls.title') }}
          </h1>
          <p class="text-body-secondary mt-2 text-sm leading-relaxed">
            {{ $t('community.search.controls.desc') }}
          </p>
        </div>

        <div class="grid gap-6">
          <UFormGroup
            :label="$t('community.search.controls.keywordParams.label')"
            class="w-full"
          >
            <UInput
              v-model="keywordModel"
              icon="i-ph-magnifying-glass-bold"
              size="xl"
              class="font-semibold"
              variant="outline"
              :placeholder="$t('community.search.controls.keywordParams.placeholder')"
              @keydown.enter.prevent="$emit('submit')"
            />
          </UFormGroup>

          <div class="grid gap-4 xl:grid-cols-[1fr_1fr_200px] xl:items-end">
            <UFormGroup :label="$t('community.search.controls.typeLabel')">
              <USelectMenu
                v-model="typeModel"
                :options="translatedTypeOptions"
                value-attribute="value"
                size="lg"
                class="font-semibold"
              />
            </UFormGroup>

            <UFormGroup :label="$t('community.search.controls.sortLabel')">
              <USelectMenu
                v-model="sortModel"
                :options="translatedSortOptions"
                value-attribute="value"
                size="lg"
                class="font-semibold"
              />
            </UFormGroup>

            <UButton
              color="primary"
              size="xl"
              class="rounded-xl font-bold px-8 shadow-lg shadow-primary-500/20"
              @click="$emit('submit')"
            >
              <template #leading>
                <Icon name="i-ph-magnifying-glass-bold" class="h-5 w-5" />
              </template>
              {{ $t('community.search.controls.submit') }}
            </UButton>
          </div>
        </div>

        <div class="space-y-6 pt-6 border-t border-secondary-100/50">
          <div class="flex flex-wrap items-center gap-3">
            <span class="text-micro font-bold uppercase tracking-wider text-secondary-400">
              {{ $t('community.search.controls.quickSuggestions') }}
            </span>

            <UButton
              v-for="item in quickKeywords"
              :key="item"
              variant="soft"
              color="gray"
              size="xs"
              class="rounded-full px-3 font-bold"
              @click="$emit('quick-search', item)"
            >
              {{ item }}
            </UButton>
          </div>

          <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            <button
              v-for="tab in tabs"
              :key="tab.value"
              class="group flex min-h-[100px] flex-col items-start rounded-2xl border p-5 text-left transition-all duration-300"
              :class="typeModel === tab.value
                ? 'border-primary-500 bg-primary-50 ring-2 ring-primary-500/10'
                : 'border-secondary-100 bg-white hover:border-primary-200 hover:bg-secondary-50/50'"
              type="button"
              @click="typeModel = tab.value"
            >
              <div class="flex w-full items-center justify-between gap-4">
                <div
                  class="flex h-12 w-12 items-center justify-center rounded-xl shadow-sm border border-secondary-100/30 transition-transform group-hover:scale-110"
                  :class="typeModel === tab.value ? 'bg-primary-500 text-white' : 'bg-secondary-50 text-secondary-500 group-hover:bg-primary-100 group-hover:text-primary-600'"
                >
                  <Icon :name="tab.icon" class="h-6 w-6" />
                </div>
                <span class="text-xl font-black text-secondary-900 tabular-nums">
                  {{ tab.count }}
                </span>
              </div>

              <div class="mt-4">
                <p class="text-sm font-black text-secondary-900">{{ $t(`community.search.tabs.${tab.value}.label`) }}</p>
                <p class="text-[11px] font-semibold text-secondary-400 leading-tight mt-1">{{ $t(`community.search.tabs.${tab.value}.desc`) }}</p>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import type {
  SearchOption,
  SearchResultType,
  SearchSortKey,
  SearchTabItem,
} from "~/composables/useMockSearchData"

type SearchPanelTab = SearchTabItem & {
  count: number
}

defineEmits<{
  submit: []
  "quick-search": [keyword: string]
}>()

const props = defineProps<{
  typeOptions: SearchOption<SearchResultType>[]
  sortOptions: SearchOption<SearchSortKey>[]
  tabs: SearchPanelTab[]
  quickKeywords: string[]
}>()

const { t } = useI18n()

const translatedTypeOptions = computed(() =>
  props.typeOptions.map(opt => ({
    ...opt,
    label: t(`community.search.types.${opt.value}`),
  })),
)

const translatedSortOptions = computed(() =>
  props.sortOptions.map(opt => ({
    ...opt,
    label: t(`community.search.sorts.${opt.value}`),
  })),
)

const keywordModel = defineModel<string>("keyword", { default: "" })
const typeModel = defineModel<SearchResultType>("type", { default: "all" })
const sortModel = defineModel<SearchSortKey>("sort", { default: "relevance" })
</script>
