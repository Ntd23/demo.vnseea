<template>
  <SearchPresentationFiltersPanel v-bind="$attrs" />
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
