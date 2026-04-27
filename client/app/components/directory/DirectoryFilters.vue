<template>
  <div class="overflow-hidden rounded-[32px] border border-[#dbe3f2] bg-white shadow-xl p-2 lg:p-3">
    <div class="space-y-6 p-4 sm:p-6">
      <div class="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div class="max-w-[640px] space-y-2">
          <div class="flex items-center gap-2">
            <div class="h-1 w-4 rounded-full bg-primary-600" />
            <p class="text-[11px] font-black uppercase tracking-[0.15em] text-slate-400">
              {{ t("pages.directoryPage.filtersEyebrow") }}
            </p>
          </div>
          <h2 class="text-[32px] font-black tracking-tight text-[#0f172a] sm:text-[42px]">
            {{ t("pages.directoryPage.filtersTitle") }}
          </h2>
          <p class="text-[15px] font-medium text-slate-500 leading-relaxed">
            {{ t("pages.directoryPage.filtersDescription") }}
          </p>
        </div>

        <div class="flex flex-wrap items-center gap-3">
          <UBadge color="primary" variant="soft" class="rounded-xl px-4 py-2 font-black text-[11px] uppercase tracking-wider text-primary-600 ring-1 ring-primary-100 shadow-sm">
            {{ t("pages.directoryPage.matchingItems", { count: resultCount }) }}
          </UBadge>
          <UButton
            v-if="canReset"
            variant="ghost"
            color="gray"
            size="md"
            class="rounded-xl font-black text-[12px] uppercase tracking-wider h-11 px-6 border border-slate-200"
            @click="emit('reset')"
          >
            <template #leading>
              <Icon name="i-ph-arrows-counter-clockwise-bold" class="h-4 w-4" />
            </template>
            {{ t("pages.directoryPage.resetFilters") }}
          </UButton>
        </div>
      </div>

      <div class="flex flex-col gap-4 lg:flex-row lg:items-center">
        <div class="relative flex-1">
          <UInput
            v-model="searchModel"
            :placeholder="t('pages.directoryPage.searchPlaceholder')"
            color="primary"
            size="xl"
            class="w-full"
            :ui="searchInputUi"
          >
            <template #leading>
              <Icon name="i-ph-magnifying-glass-bold" class="h-5 w-5 text-primary-600" />
            </template>
            <template #trailing>
              <button
                v-if="searchModel"
                class="flex h-6 w-6 items-center justify-center rounded-lg bg-slate-100 text-slate-400 hover:bg-slate-200 hover:text-slate-600"
                @click="searchModel = ''"
              >
                <Icon name="i-ph-x-bold" class="h-3 w-3" />
              </button>
            </template>
          </UInput>
        </div>
      </div>

      <div class="flex flex-wrap items-center gap-2" role="tablist">
        <UButton
          v-for="category in categories"
          :key="category.value"
          variant="ghost"
          class="h-12 rounded-2xl px-6 font-black text-[13px] uppercase tracking-wider transition-all"
          :class="selectedCategoryModel === category.value ? 'bg-primary-600 text-white shadow-lg shadow-primary-600/30' : 'bg-slate-50 text-slate-500 hover:bg-slate-100 hover:text-[#0f172a] ring-1 ring-slate-100'"
          @click="selectedCategoryModel = category.value"
        >
          <Icon :name="category.icon" class="mr-2 h-4 w-4" />
          <span class="truncate">{{ category.label }}</span>
        </UButton>
      </div>
    </div>

    <!-- Bottom Status Info -->
    <div class="mt-4 flex items-center gap-3 border-t border-slate-50 px-8 py-4">
      <div class="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
      <p class="text-[12px] font-bold text-slate-400">
        {{ statusLabel }}
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { DirectoryCategory, DirectoryCategoryKey } from "~/composables/useMockDirectoryData"

const { t } = useI18n()

defineProps<{
  categories: ReadonlyArray<DirectoryCategory>
  resultCount: number
  statusLabel: string
  canReset?: boolean
}>()

const searchModel = defineModel<string>("search", {
  default: "",
})

const selectedCategoryModel = defineModel<DirectoryCategoryKey>("selectedCategory", {
  default: "all",
})

const emit = defineEmits<{
  reset: []
}>()

const searchInputUi = {
  base: "h-14 rounded-2xl px-12 text-[15px] font-bold bg-slate-50 border-none ring-1 ring-slate-100 focus:ring-2 focus:ring-primary-500 shadow-inner",
}
</script>
