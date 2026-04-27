<template>
  <aside class="hidden xl:block space-y-6">
    <!-- Categories Card -->
    <div class="overflow-hidden rounded-[32px] border border-[#dbe3f2] bg-white shadow-lg p-6 sm:p-8">
      <div class="flex items-center justify-between mb-6">
        <div class="space-y-1">
          <p class="text-[11px] font-black uppercase tracking-[0.15em] text-slate-400">
            {{ t("pages.directoryPage.sidebarCategoriesEyebrow") }}
          </p>
          <h2 class="text-xl font-black tracking-tight text-[#0f172a]">
            {{ t("pages.directoryPage.sidebarCategoriesTitle") }}
          </h2>
        </div>
        <UButton
          v-if="hasActiveFilters"
          variant="ghost"
          color="gray"
          size="sm"
          class="rounded-xl h-8 w-8 p-0 flex items-center justify-center"
          icon="i-ph-arrows-counter-clockwise-bold"
          @click="emit('reset')"
        />
      </div>

      <div class="space-y-2">
        <button
          v-for="category in categories"
          :key="category.value"
          class="group w-full flex items-center justify-between p-4 rounded-2xl transition-all"
          :class="selectedCategory === category.value ? 'bg-primary-600 text-white shadow-lg shadow-primary-600/30' : 'bg-slate-50 text-[#0f172a] hover:bg-slate-100'"
          @click="emit('selectCategory', category.value)"
        >
          <div class="flex items-center gap-3">
            <div
              class="h-10 w-10 flex items-center justify-center rounded-xl transition-colors"
              :class="selectedCategory === category.value ? 'bg-white/20' : 'bg-white shadow-sm ring-1 ring-slate-100 group-hover:bg-slate-50'"
            >
              <Icon :name="category.icon" class="h-5 w-5" />
            </div>
            <div class="text-left">
              <span class="block text-[13px] font-black leading-tight">{{ category.label }}</span>
              <span class="block text-[10px] font-bold opacity-60 mt-0.5">{{ category.description }}</span>
            </div>
          </div>
          <span
            class="text-[11px] font-black px-2 py-1 rounded-lg"
            :class="selectedCategory === category.value ? 'bg-white/20' : 'bg-slate-200/50 text-slate-500'"
          >
            {{ counts[category.value] ?? 0 }}
          </span>
        </button>
      </div>
    </div>

    <!-- Featured Card -->
    <div class="overflow-hidden rounded-[32px] border border-[#dbe3f2] bg-white shadow-lg p-6 sm:p-8">
      <div class="space-y-1 mb-6">
        <p class="text-[11px] font-black uppercase tracking-[0.15em] text-slate-400">
          {{ t("pages.directoryPage.sidebarFeaturedEyebrow") }}
        </p>
        <h2 class="text-xl font-black tracking-tight text-[#0f172a]">
          {{ t("pages.directoryPage.sidebarFeaturedTitle") }}
        </h2>
      </div>

      <div v-if="featured.length > 0" class="space-y-4">
        <NuxtLink
          v-for="item in featured"
          :key="item.id"
          :to="item.href"
          class="group block p-4 rounded-2xl bg-slate-50 ring-1 ring-slate-100 hover:bg-white hover:shadow-xl hover:ring-primary-100 transition-all"
        >
          <div class="flex items-start justify-between mb-3">
            <h3 class="text-[14px] font-black text-[#0f172a] group-hover:text-primary-600 transition-colors">{{ item.title }}</h3>
            <Icon name="i-ph-arrow-up-right-bold" class="h-4 w-4 text-slate-300 group-hover:text-primary-500" />
          </div>
          <p class="text-[12px] font-medium text-slate-500 line-clamp-2 leading-relaxed mb-4">
            {{ item.description }}
          </p>
          <div class="flex items-center justify-between">
            <span class="text-[10px] font-black uppercase tracking-widest text-primary-600 bg-primary-50 px-2 py-1 rounded-lg">
              {{ item.categoryLabel }}
            </span>
            <span class="text-[11px] font-bold text-slate-400">
              {{ item.count }} interactions
            </span>
          </div>
        </NuxtLink>
      </div>

      <div v-else class="py-12 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
        <Icon name="i-ph-star-duotone" class="h-8 w-8 text-slate-300 mx-auto mb-3" />
        <p class="text-[12px] font-bold text-slate-400 px-4">{{ t('pages.directoryPage.sidebarFeaturedEmptyTitle') }}</p>
      </div>
    </div>
  </aside>
</template>

<script setup lang="ts">
import type { DirectoryCategory, DirectoryCategoryKey, DirectoryItem } from "~/composables/useMockDirectoryData"

const { t } = useI18n()

defineProps<{
  categories: ReadonlyArray<DirectoryCategory>
  selectedCategory: DirectoryCategoryKey
  counts: Record<string, number>
  featured: ReadonlyArray<DirectoryItem>
  statusLabel: string
  hasActiveFilters?: boolean
}>()

const emit = defineEmits<{
  selectCategory: [value: DirectoryCategoryKey]
  reset: []
}>()
</script>
