<template>
  <section class="surface-card border-secondary-100/60 p-6 sm:p-8">
    <div class="flex flex-col gap-6">
      <div class="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
        <div class="space-y-2">
          <p class="text-[11px] font-semibold uppercase tracking-[0.06em] text-slate-400">
            {{ $t("community.search.filters.label") }}
          </p>
          <h1 class="text-3xl font-extrabold tracking-tight text-[var(--text-primary)]">
            {{ $t("community.search.filters.title") }}
          </h1>
          <p class="max-w-2xl text-sm leading-7 text-body-secondary">
            {{ $t("community.search.filters.description") }}
          </p>
        </div>

        <div class="grid gap-3 sm:grid-cols-3 xl:min-w-[560px]">
          <UFormField :label="$t('community.search.filters.keyword')" name="keyword">
            <UInput
              v-model="keywordModel"
              icon="i-ph-magnifying-glass-bold"
              size="xl"
              class="w-full"
              :placeholder="$t('community.search.filters.keywordPlaceholder')"
              @keyup.enter="emit('submit')"
            />
          </UFormField>

          <UFormField :label="$t('community.search.filters.type')" name="type">
            <USelect
              v-model="typeModel"
              :items="translatedTypeOptions"
              value-key="value"
              size="xl"
              class="w-full"
            />
          </UFormField>

          <UFormField :label="$t('community.search.filters.sort')" name="sort">
            <USelect
              v-model="sortModel"
              :items="translatedSortOptions"
              value-key="value"
              size="xl"
              class="w-full"
            />
          </UFormField>
        </div>
      </div>

      <div class="flex flex-wrap gap-3">
        <UButton
          v-for="tab in tabs"
          :key="tab.value"
          color="neutral"
          :variant="typeModel === tab.value ? 'soft' : 'outline'"
          class="rounded-xl px-4 py-2.5 text-left"
          @click="typeModel = tab.value"
        >
          <div class="flex items-center gap-3">
            <Icon :name="tab.icon" class="h-4 w-4" />
            <div class="flex flex-col items-start">
              <span class="text-[12px] font-semibold text-slate-700">{{ tab.label }}</span>
              <span class="text-[11px] font-medium text-slate-400">{{ tab.count }}</span>
            </div>
          </div>
        </UButton>
      </div>

      <div class="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div class="flex flex-wrap items-center gap-2">
          <span class="text-[11px] font-semibold uppercase tracking-[0.06em] text-slate-400">
            {{ $t("community.search.filters.quickKeywords") }}
          </span>
          <UButton
            v-for="keyword in quickKeywords"
            :key="keyword"
            color="neutral"
            variant="soft"
            size="xs"
            class="rounded-full"
            @click="emit('quick-search', keyword)"
          >
            {{ keyword }}
          </UButton>
        </div>

        <div class="flex items-center gap-3">
          <UButton
            color="neutral"
            variant="outline"
            class="rounded-xl font-semibold"
            @click="resetFilters"
          >
            {{ $t("community.search.clearFilters") }}
          </UButton>
          <UButton
            color="primary"
            class="rounded-xl px-6 font-semibold"
            @click="emit('submit')"
          >
            <Icon name="i-ph-magnifying-glass-bold" class="h-4 w-4" />
            {{ $t("community.search.filters.submit") }}
          </UButton>
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
} from "../../domain/types/search.types"

type SearchPanelTab = SearchTabItem & {
  count: number
}

const emit = defineEmits<{
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

const keywordModel = defineModel<string>("keyword", { default: "" })
const typeModel = defineModel<SearchResultType>("type", { default: "all" })
const sortModel = defineModel<SearchSortKey>("sort", { default: "relevance" })

const translatedTypeOptions = computed(() =>
  props.typeOptions.map(option => ({
    ...option,
    label: t(`community.search.types.${option.value}`),
  })),
)

const translatedSortOptions = computed(() =>
  props.sortOptions.map(option => ({
    ...option,
    label: t(`community.search.sorts.${option.value}`),
  })),
)

function resetFilters() {
  keywordModel.value = ""
  typeModel.value = "all"
  sortModel.value = "relevance"
  emit("submit")
}
</script>
